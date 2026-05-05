<?php

namespace App\Command;

use App\Entity\StudentRecord;
use App\Entity\Alumni;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:backfill-student-record-academic',
    description: 'Copies college/department from Alumni records to their linked StudentRecords.',
)]
class BackfillStudentRecordAcademicCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Find all claimed StudentRecords that have null college or department
        $records = $this->em->createQuery(
            'SELECT sr FROM App\Entity\StudentRecord sr
             WHERE sr.claimedByUser IS NOT NULL
             AND (sr.college IS NULL OR sr.department IS NULL)'
        )->getResult();

        $updated = 0;

        /** @var StudentRecord $record */
        foreach ($records as $record) {
            $user = $record->getClaimedByUser();

            if ($user === null) {
                continue;
            }

            $alumni = $user->getAlumni();

            if (!$alumni instanceof Alumni) {
                $io->warning(sprintf(
                    'Student %s (%s) has no Alumni record — skipping.',
                    $record->getStudentId(),
                    $record->getFullName()
                ));
                continue;
            }

            $collegeValue = $alumni->getCollege();
            $courseValue = $alumni->getCourse();

            if ($record->getCollege() === null && $collegeValue !== null) {
                $record->setCollege($collegeValue);
            }

            if ($record->getDepartment() === null && $courseValue !== null) {
                $record->setDepartment($courseValue);
            }

            if ($collegeValue !== null || $courseValue !== null) {
                $updated++;
                $io->text(sprintf(
                    '✔ %s (%s) → College: %s, Department: %s',
                    $record->getStudentId(),
                    $record->getFullName(),
                    $collegeValue ?? '(none)',
                    $courseValue ?? '(none)',
                ));
            } else {
                $io->warning(sprintf(
                    '⚠ %s (%s) — Alumni record has no college/department set.',
                    $record->getStudentId(),
                    $record->getFullName(),
                ));
            }
        }

        $this->em->flush();

        $io->success(sprintf('Updated %d student record(s).', $updated));

        return Command::SUCCESS;
    }
}
