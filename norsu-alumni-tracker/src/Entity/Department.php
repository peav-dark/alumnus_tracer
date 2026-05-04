<?php

namespace App\Entity;

use App\Repository\DepartmentRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DepartmentRepository::class)]
class Department
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    private string $name;

    #[ORM\Column(length: 100, unique: true)]
    private string $code;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $description = null;

    #[ORM\ManyToOne(inversedBy: 'departments', targetEntity: College::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?College $college = null;

    #[ORM\Column(nullable: true)]
    private ?bool $isActive = true;

    public function getId(): ?int { return $this->id; }

    public function getName(): string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getCode(): string { return $this->code; }
    public function setCode(string $code): static { $this->code = $code; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }

    public function getCollege(): ?College { return $this->college; }
    public function setCollege(?College $college): static { $this->college = $college; return $this; }

    public function isIsActive(): ?bool { return $this->isActive; }
    public function setIsActive(?bool $isActive): static { $this->isActive = $isActive; return $this; }

    public function __toString(): string { return $this->name; }
}
