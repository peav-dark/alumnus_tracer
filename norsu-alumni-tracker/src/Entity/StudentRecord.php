<?php

namespace App\Entity;

use App\Repository\StudentRecordRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: StudentRecordRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_STUDENT_RECORD_STUDENT_ID', fields: ['studentId'])]
class StudentRecord
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    private string $studentId;

    #[ORM\Column(length: 255)]
    private string $firstName;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $middleName = null;

    #[ORM\Column(length: 255)]
    private string $lastName;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $college = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $department = null;

    #[ORM\Column(nullable: true)]
    private ?int $batchYear = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $claimedByUser = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $claimedAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $importedAt;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $importBatchLabel = null;

    public function __construct()
    {
        $this->importedAt = new \DateTimeImmutable();
    }

    // ── Getters & Setters ──

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStudentId(): string
    {
        return $this->studentId;
    }

    public function setStudentId(string $studentId): static
    {
        $this->studentId = trim($studentId);

        return $this;
    }

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = trim($firstName);

        return $this;
    }

    public function getMiddleName(): ?string
    {
        return $this->middleName;
    }

    public function setMiddleName(?string $middleName): static
    {
        $normalizedMiddleName = trim((string) $middleName);
        $this->middleName = $normalizedMiddleName !== '' ? $normalizedMiddleName : null;

        return $this;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = trim($lastName);

        return $this;
    }

    public function getFullName(): string
    {
        $parts = [$this->firstName];

        if ($this->middleName !== null) {
            $parts[] = $this->middleName;
        }

        $parts[] = $this->lastName;

        return implode(' ', $parts);
    }

    public function getCollege(): ?string
    {
        return $this->college;
    }

    public function setCollege(?string $college): static
    {
        $normalizedCollege = trim((string) $college);
        $this->college = $normalizedCollege !== '' ? $normalizedCollege : null;

        return $this;
    }

    public function getDepartment(): ?string
    {
        return $this->department;
    }

    public function setDepartment(?string $department): static
    {
        $normalizedDepartment = trim((string) $department);
        $this->department = $normalizedDepartment !== '' ? $normalizedDepartment : null;

        return $this;
    }

    public function getBatchYear(): ?int
    {
        return $this->batchYear;
    }

    public function setBatchYear(?int $batchYear): static
    {
        $this->batchYear = $batchYear;

        return $this;
    }

    public function getClaimedByUser(): ?User
    {
        return $this->claimedByUser;
    }

    public function setClaimedByUser(?User $claimedByUser): static
    {
        $this->claimedByUser = $claimedByUser;

        return $this;
    }

    public function getClaimedAt(): ?\DateTimeImmutable
    {
        return $this->claimedAt;
    }

    public function setClaimedAt(?\DateTimeImmutable $claimedAt): static
    {
        $this->claimedAt = $claimedAt;

        return $this;
    }

    public function isClaimed(): bool
    {
        return $this->claimedByUser !== null;
    }

    public function getImportedAt(): \DateTimeImmutable
    {
        return $this->importedAt;
    }

    public function setImportedAt(\DateTimeImmutable $importedAt): static
    {
        $this->importedAt = $importedAt;

        return $this;
    }

    public function getImportBatchLabel(): ?string
    {
        return $this->importBatchLabel;
    }

    public function setImportBatchLabel(?string $importBatchLabel): static
    {
        $normalizedLabel = trim((string) $importBatchLabel);
        $this->importBatchLabel = $normalizedLabel !== '' ? $normalizedLabel : null;

        return $this;
    }
}
