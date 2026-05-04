<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Employment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Alumni::class, inversedBy: 'employments')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Alumni $alumni = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $companyName = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $jobTitle = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $employmentStatus = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $employmentType = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $monthlySalary = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateHired = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateEnded = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $workLocation = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $industry = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $jobLevel = null;

    #[ORM\Column(nullable: true)]
    private ?bool $jobRelatedToCourse = null;

    #[ORM\Column(nullable: true)]
    private ?bool $isAbroad = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $country = null;

    // ── Getters & Setters ──

    public function getId(): ?int { return $this->id; }

    public function getAlumni(): ?Alumni { return $this->alumni; }
    public function setAlumni(?Alumni $v): static { $this->alumni = $v; return $this; }

    public function getCompanyName(): ?string { return $this->companyName; }
    public function setCompanyName(?string $v): static { $this->companyName = $v; return $this; }

    public function getJobTitle(): ?string { return $this->jobTitle; }
    public function setJobTitle(?string $v): static { $this->jobTitle = $v; return $this; }

    public function getEmploymentStatus(): ?string { return $this->employmentStatus; }
    public function setEmploymentStatus(?string $v): static { $this->employmentStatus = $v; return $this; }

    public function getEmploymentType(): ?string { return $this->employmentType; }
    public function setEmploymentType(?string $v): static { $this->employmentType = $v; return $this; }

    public function getMonthlySalary(): ?string { return $this->monthlySalary; }
    public function setMonthlySalary(?string $v): static { $this->monthlySalary = $v; return $this; }

    public function getDateHired(): ?\DateTimeInterface { return $this->dateHired; }
    public function setDateHired(?\DateTimeInterface $v): static { $this->dateHired = $v; return $this; }

    public function getDateEnded(): ?\DateTimeInterface { return $this->dateEnded; }
    public function setDateEnded(?\DateTimeInterface $v): static { $this->dateEnded = $v; return $this; }

    public function getWorkLocation(): ?string { return $this->workLocation; }
    public function setWorkLocation(?string $v): static { $this->workLocation = $v; return $this; }

    public function getIndustry(): ?string { return $this->industry; }
    public function setIndustry(?string $v): static { $this->industry = $v; return $this; }

    public function getJobLevel(): ?string { return $this->jobLevel; }
    public function setJobLevel(?string $v): static { $this->jobLevel = $v; return $this; }

    public function isJobRelatedToCourse(): ?bool { return $this->jobRelatedToCourse; }
    public function setJobRelatedToCourse(?bool $v): static { $this->jobRelatedToCourse = $v; return $this; }

    public function isAbroad(): ?bool { return $this->isAbroad; }
    public function setIsAbroad(?bool $v): static { $this->isAbroad = $v; return $this; }

    public function getCountry(): ?string { return $this->country; }
    public function setCountry(?string $v): static { $this->country = $v; return $this; }
}
