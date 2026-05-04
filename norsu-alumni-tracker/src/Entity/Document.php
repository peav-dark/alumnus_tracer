<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Document
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Alumni::class, inversedBy: 'documents')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Alumni $alumni = null;

    #[ORM\Column(length: 255)]
    private string $originalFilename;

    #[ORM\Column(length: 255)]
    private string $storedFilename;

    #[ORM\Column(length: 100)]
    private string $documentType; // resume, transcript, certificate

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private \DateTimeInterface $uploadedAt;

    public function __construct()
    {
        $this->uploadedAt = new \DateTime();
    }

    // ── Getters & Setters ──

    public function getId(): ?int { return $this->id; }

    public function getAlumni(): ?Alumni { return $this->alumni; }
    public function setAlumni(?Alumni $v): static { $this->alumni = $v; return $this; }

    public function getOriginalFilename(): string { return $this->originalFilename; }
    public function setOriginalFilename(string $v): static { $this->originalFilename = $v; return $this; }

    public function getStoredFilename(): string { return $this->storedFilename; }
    public function setStoredFilename(string $v): static { $this->storedFilename = $v; return $this; }

    public function getDocumentType(): string { return $this->documentType; }
    public function setDocumentType(string $v): static { $this->documentType = $v; return $this; }

    public function getUploadedAt(): \DateTimeInterface { return $this->uploadedAt; }
    public function setUploadedAt(\DateTimeInterface $v): static { $this->uploadedAt = $v; return $this; }
}
