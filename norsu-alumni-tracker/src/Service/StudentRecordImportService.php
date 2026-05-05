<?php

namespace App\Service;

use App\Entity\QrRegistrationBatch;
use App\Entity\StudentRecord;
use App\Repository\QrRegistrationBatchRepository;
use App\Repository\StudentRecordRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class StudentRecordImportService
{
    /**
     * Required CSV columns (case-insensitive, underscores/spaces normalized).
     */
    private const REQUIRED_COLUMNS = ['student_id', 'first_name', 'last_name'];

    /**
     * All recognized column mappings: normalized header → entity setter method suffix.
     */
    private const COLUMN_MAP = [
        'student_id'  => 'studentId',
        'first_name'  => 'firstName',
        'last_name'   => 'lastName',
        'middle_name' => 'middleName',
        'batch_year'  => 'batchYear',
    ];

    public function __construct(
        private EntityManagerInterface $entityManager,
        private StudentRecordRepository $studentRecordRepository,
        private QrRegistrationBatchRepository $batchRepository,
    ) {}

    /**
     * Import student records from a CSV file.
     *
     * @return array{imported: int, updated: int, skipped: int, errors: string[]}
     */
    public function importFromCsv(UploadedFile $file, ?string $batchLabel = null): array
    {
        $result = [
            'imported' => 0,
            'updated'  => 0,
            'skipped'  => 0,
            'errors'   => [],
        ];

        // Validate file type
        $mimeType = $file->getMimeType();
        $allowedMimes = ['text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel'];

        if (!in_array($mimeType, $allowedMimes, true)) {
            $result['errors'][] = 'Invalid file type. Please upload a CSV file.';

            return $result;
        }

        $handle = fopen($file->getPathname(), 'r');

        if ($handle === false) {
            $result['errors'][] = 'Unable to open the uploaded file.';

            return $result;
        }

        // Skip BOM if present
        $bom = fread($handle, 3);

        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        // Read and validate headers
        $rawHeaders = fgetcsv($handle);

        if ($rawHeaders === false || count($rawHeaders) === 0) {
            fclose($handle);
            $result['errors'][] = 'The CSV file is empty or has no headers.';

            return $result;
        }

        $headerMap = $this->mapHeaders($rawHeaders);
        $missingRequired = $this->findMissingRequired($headerMap);

        if (count($missingRequired) > 0) {
            fclose($handle);
            $result['errors'][] = 'Missing required columns: ' . implode(', ', $missingRequired) . '. Required: student_id, first_name, last_name.';

            return $result;
        }

        // Process rows
        $rowNumber = 1; // 1 = header row already read
        $batchSize = 50;
        $processedInBatch = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;

            // Skip completely empty rows
            if (count(array_filter($row, static fn ($v) => trim((string) $v) !== '')) === 0) {
                continue;
            }

            $rowResult = $this->processRow($row, $headerMap, $rowNumber, $batchLabel);

            if ($rowResult === 'imported') {
                $result['imported']++;
            } elseif ($rowResult === 'updated') {
                $result['updated']++;
            } elseif ($rowResult === 'skipped') {
                $result['skipped']++;
            } else {
                // It's an error message string
                $result['errors'][] = $rowResult;
            }

            $processedInBatch++;

            if ($processedInBatch >= $batchSize) {
                $this->entityManager->flush();
                $processedInBatch = 0;
            }
        }

        // Flush remaining
        $this->entityManager->flush();
        fclose($handle);

        // Auto-create QrRegistrationBatch entries for each unique batch year
        $this->autoCreateBatches($result);

        return $result;
    }

    /**
     * Auto-create QrRegistrationBatch entries for each unique batch year found during import.
     * Skips years that already have a batch entry.
     *
     * @param array{imported: int, updated: int, skipped: int, errors: string[]} $result
     */
    private function autoCreateBatches(array &$result): void
    {
        // Collect all unique batch years from the student records table
        $allYears = $this->entityManager->createQuery(
            'SELECT DISTINCT sr.batchYear FROM App\Entity\StudentRecord sr WHERE sr.batchYear IS NOT NULL ORDER BY sr.batchYear DESC'
        )->getSingleColumnResult();

        $createdCount = 0;

        foreach ($allYears as $year) {
            $year = (int) $year;

            if ($year <= 0) {
                continue;
            }

            $existing = $this->batchRepository->findOneByBatchYear($year);

            if ($existing !== null) {
                continue;
            }

            $batch = new QrRegistrationBatch();
            $batch->setBatchYear($year);
            $batch->setIsOpen(true);
            $this->entityManager->persist($batch);
            $createdCount++;
        }

        if ($createdCount > 0) {
            $this->entityManager->flush();
        }
    }

    /**
     * Normalize headers and map them to entity fields.
     *
     * @param string[] $rawHeaders
     *
     * @return array<int, string|null> Index → entity field name (or null if unrecognized)
     */
    private function mapHeaders(array $rawHeaders): array
    {
        $map = [];

        foreach ($rawHeaders as $index => $header) {
            $normalized = $this->normalizeHeader($header);
            $map[$index] = self::COLUMN_MAP[$normalized] ?? null;
        }

        return $map;
    }

    /**
     * Check for missing required columns in the header map.
     *
     * @param array<int, string|null> $headerMap
     *
     * @return string[]
     */
    private function findMissingRequired(array $headerMap): array
    {
        $foundFields = array_filter($headerMap, static fn ($v) => $v !== null);
        $missing = [];

        foreach (self::REQUIRED_COLUMNS as $requiredCol) {
            $requiredField = self::COLUMN_MAP[$requiredCol] ?? null;

            if ($requiredField === null || !in_array($requiredField, $foundFields, true)) {
                $missing[] = $requiredCol;
            }
        }

        return $missing;
    }

    /**
     * Process a single CSV row.
     *
     * @param string[]               $row
     * @param array<int, string|null> $headerMap
     *
     * @return string 'imported', 'updated', 'skipped', or an error message
     */
    private function processRow(array $row, array $headerMap, int $rowNumber, ?string $batchLabel): string
    {
        // Extract row data
        $data = [];

        foreach ($headerMap as $index => $fieldName) {
            if ($fieldName !== null && isset($row[$index])) {
                $data[$fieldName] = trim($row[$index]);
            }
        }

        // Validate required fields
        $studentId = $data['studentId'] ?? '';
        $firstName = $data['firstName'] ?? '';
        $lastName = $data['lastName'] ?? '';

        if ($studentId === '') {
            return "Row {$rowNumber}: Missing student_id, skipped.";
        }

        if ($firstName === '' || $lastName === '') {
            return "Row {$rowNumber} (ID: {$studentId}): Missing first_name or last_name, skipped.";
        }

        // Check if record already exists
        $existing = $this->studentRecordRepository->findByStudentId($studentId);

        if ($existing !== null) {
            // If already claimed, skip with warning
            if ($existing->isClaimed()) {
                return 'skipped';
            }

            // Update the unclaimed record
            $this->populateRecord($existing, $data, $batchLabel);

            return 'updated';
        }

        // Create new record
        $record = new StudentRecord();
        $this->populateRecord($record, $data, $batchLabel);
        $this->entityManager->persist($record);

        return 'imported';
    }

    /**
     * Populate a StudentRecord entity from parsed row data.
     *
     * @param array<string, string> $data
     */
    private function populateRecord(StudentRecord $record, array $data, ?string $batchLabel): void
    {
        $record->setStudentId($data['studentId'] ?? '');
        $record->setFirstName($data['firstName'] ?? '');
        $record->setLastName($data['lastName'] ?? '');
        $record->setMiddleName($data['middleName'] ?? null);

        $batchYear = $data['batchYear'] ?? null;

        if ($batchYear !== null && $batchYear !== '' && is_numeric($batchYear)) {
            $record->setBatchYear((int) $batchYear);
        }

        if ($batchLabel !== null && trim($batchLabel) !== '') {
            $record->setImportBatchLabel($batchLabel);
        }
    }

    /**
     * Normalize a CSV header string for matching.
     *
     * Handles: "Student ID", "student_id", "StudentId", "STUDENT ID", etc.
     */
    private function normalizeHeader(string $header): string
    {
        // Remove BOM, trim whitespace
        $clean = trim($header, " \t\n\r\0\x0B\xEF\xBB\xBF");

        // Convert camelCase/PascalCase to snake_case
        $snake = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $clean) ?? $clean);

        // Replace spaces and multiple underscores with single underscore
        $snake = preg_replace('/[\s_]+/', '_', $snake) ?? $snake;

        return trim($snake, '_');
    }
}
