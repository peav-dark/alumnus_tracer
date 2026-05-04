<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Feedback
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Alumni::class, inversedBy: 'feedbacks')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Alumni $alumni = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $suggestions = null;

    #[ORM\Column(nullable: true)]
    private ?bool $recommendUniversity = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $dateSubmitted = null;

    public function __construct()
    {
        $this->dateSubmitted = new \DateTime();
    }

    // ── Getters & Setters ──

    public function getId(): ?int { return $this->id; }

    public function getAlumni(): ?Alumni { return $this->alumni; }
    public function setAlumni(?Alumni $v): static { $this->alumni = $v; return $this; }

    public function getSuggestions(): ?string { return $this->suggestions; }
    public function setSuggestions(?string $v): static { $this->suggestions = $v; return $this; }

    public function isRecommendUniversity(): ?bool { return $this->recommendUniversity; }
    public function setRecommendUniversity(?bool $v): static { $this->recommendUniversity = $v; return $this; }

    public function getDateSubmitted(): ?\DateTimeInterface { return $this->dateSubmitted; }
    public function setDateSubmitted(\DateTimeInterface $v): static { $this->dateSubmitted = $v; return $this; }
}
