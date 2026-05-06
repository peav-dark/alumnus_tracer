<?php

declare(strict_types=1);

use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

(new Dotenv())->bootEnv(dirname(__DIR__) . '/.env');

$kernel = new Kernel($_SERVER['APP_ENV'] ?? 'dev', (bool) ($_SERVER['APP_DEBUG'] ?? true));
$kernel->boot();
$container = $kernel->getContainer();
$em = $container->get('doctrine')->getManager();
$conn = $em->getConnection();

function getCount($conn, string $table): int
{
    try {
        return (int) $conn->fetchOne(sprintf('SELECT COUNT(*) FROM %s', $table));
    } catch (\Throwable $e) {
        return -1;
    }
}

$tables = [
    'gts_survey' => 'GTS survey responses',
    'survey_invitation' => 'Survey invitations',
    'survey_campaign' => 'Survey campaigns',
];

echo "Current counts:\n";
foreach ($tables as $table => $label) {
    printf(" - %s (%s): %s\n", $label, $table, getCount($conn, $table));
}

echo "\nRemoving all GTS surveys, invitations, and campaigns...\n";

try {
    $conn->beginTransaction();

    // Delete surveys first to avoid FK issues
    $deletedSurveys = $conn->executeStatement('DELETE FROM gts_survey');

    // Then delete invitations
    $deletedInvitations = $conn->executeStatement('DELETE FROM survey_invitation');

    // Finally delete campaigns
    $deletedCampaigns = $conn->executeStatement('DELETE FROM survey_campaign');

    $conn->commit();

    printf("Deleted: %d surveys, %d invitations, %d campaigns\n", $deletedSurveys, $deletedInvitations, $deletedCampaigns);
} catch (\Throwable $e) {
    $conn->rollBack();
    echo 'Error during deletion: ' . $e->getMessage() . "\n";
    exit(1);
}

echo "\nCounts after deletion:\n";
foreach ($tables as $table => $label) {
    printf(" - %s (%s): %s\n", $label, $table, getCount($conn, $table));
}

echo "\nDone.\n";
