<?php

namespace App\Entity;

use App\Repository\CollegeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CollegeRepository::class)]
class College
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

    #[ORM\Column(nullable: true)]
    private ?bool $isActive = true;

    #[ORM\OneToMany(mappedBy: 'college', targetEntity: Department::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $departments;

    public function __construct()
    {
        $this->departments = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getName(): string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getCode(): string { return $this->code; }
    public function setCode(string $code): static { $this->code = $code; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }

    public function isIsActive(): ?bool { return $this->isActive; }
    public function setIsActive(?bool $isActive): static { $this->isActive = $isActive; return $this; }

    public function getDepartments(): Collection { return $this->departments; }

    public function addDepartment(Department $department): static
    {
        if (!$this->departments->contains($department)) {
            $this->departments->add($department);
            $department->setCollege($this);
        }
        return $this;
    }

    public function removeDepartment(Department $department): static
    {
        if ($this->departments->removeElement($department)) {
            if ($department->getCollege() === $this) {
                $department->setCollege(null);
            }
        }
        return $this;
    }

    public function __toString(): string { return $this->name; }
}
