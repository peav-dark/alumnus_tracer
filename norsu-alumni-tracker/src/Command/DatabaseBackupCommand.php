<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:database:backup',
    description: 'Creates a backup of the database as a SQL dump file',
)]
class DatabaseBackupCommand extends Command
{
    public function __construct(private string $databaseUrl)
    {
        parent::__construct();
    }

    public static function getSubscribedServices(): array
    {
        return [];
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $params = parse_url($this->databaseUrl);
        if (!$params) {
            $io->error('Could not parse DATABASE_URL.');
            return Command::FAILURE;
        }

        $scheme = $params['scheme'] ?? '';
        $host = $params['host'] ?? '127.0.0.1';
        $port = $params['port'] ?? null;
        $user = $params['user'] ?? '';
        $pass = $params['pass'] ?? '';
        $dbName = ltrim($params['path'] ?? '', '/');

        $backupDir = dirname(__DIR__, 2) . '/var/backups';
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $filename = $dbName . '_' . date('Y-m-d_His') . '.sql';
        $filepath = $backupDir . '/' . $filename;

        if (str_contains($scheme, 'mysql')) {
            $cmd = sprintf(
                'mysqldump --host=%s --user=%s --password=%s %s %s > %s',
                escapeshellarg($host),
                escapeshellarg($user),
                escapeshellarg($pass),
                $port ? '--port=' . escapeshellarg((string) $port) : '',
                escapeshellarg($dbName),
                escapeshellarg($filepath)
            );
        } elseif (str_contains($scheme, 'pgsql') || str_contains($scheme, 'postgres')) {
            $envPass = $pass ? 'PGPASSWORD=' . escapeshellarg($pass) . ' ' : '';
            $cmd = sprintf(
                '%spg_dump --host=%s --username=%s %s --format=plain --file=%s %s',
                $envPass,
                escapeshellarg($host),
                escapeshellarg($user),
                $port ? '--port=' . escapeshellarg((string) $port) : '',
                escapeshellarg($filepath),
                escapeshellarg($dbName)
            );
        } else {
            $io->error('Unsupported database driver: ' . $scheme);
            return Command::FAILURE;
        }

        $io->info('Running backup for database: ' . $dbName);

        $returnCode = 0;
        $cmdOutput = [];
        exec($cmd . ' 2>&1', $cmdOutput, $returnCode);

        if ($returnCode !== 0) {
            $io->error('Backup failed: ' . implode("\n", $cmdOutput));
            return Command::FAILURE;
        }

        // Clean up old backups (keep last 10)
        $files = glob($backupDir . '/' . $dbName . '_*.sql');
        if ($files && count($files) > 10) {
            usort($files, fn($a, $b) => filemtime($a) - filemtime($b));
            $toDelete = array_slice($files, 0, count($files) - 10);
            foreach ($toDelete as $old) {
                unlink($old);
            }
            $io->note('Cleaned up ' . count($toDelete) . ' old backup(s).');
        }

        $size = file_exists($filepath) ? round(filesize($filepath) / 1024, 1) : 0;
        $io->success("Backup created: {$filename} ({$size} KB)");

        return Command::SUCCESS;
    }
}
