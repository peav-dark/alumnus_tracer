<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Education
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Alumni::class, inversedBy: 'educations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Alumni $alumni = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $degreeProgram = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $major = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateGraduated = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $honorsReceived = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $schoolName = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $gwa = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $scholarshipGranted = null;

    // ── Getters & Setters ──

    public function getId(): ?int { return $this->id; }

    public function getAlumni(): ?Alumni { return $this->alumni; }
    public function setAlumni(?Alumni $v): static { $this->alumni = $v; return $this; }

    public function getDegreeProgram(): ?string { return $this->degreeProgram; }
    public function setDegreeProgram(?string $v): static { $this->degreeProgram = $v; return $this; }

    public function getMajor(): ?string { return $this->major; }
    public function setMajor(?string $v): static { $this->major = $v; return $this; }

    public function getDateGraduated(): ?\DateTimeInterface { return $this->dateGraduated; }
    public function setDateGraduated(?\DateTimeInterface $v): static { $this->dateGraduated = $v; return $this; }

    public function getHonorsReceived(): ?string { return $this->honorsReceived; }
    public function setHonorsReceived(?string $v): static { $this->honorsReceived = $v; return $this; }

    public function getSchoolName(): ?string { return $this->schoolName; }
    public function setSchoolName(?string $v): static { $this->schoolName = $v; return $this; }

    public function getGwa(): ?string { return $this->gwa; }
    public function setGwa(?string $v): static { $this->gwa = $v; return $this; }

    public function getScholarshipGranted(): ?string { return $this->scholarshipGranted; }
    public function setScholarshipGranted(?string $v): static { $this->scholarshipGranted = $v; return $this; }
}
