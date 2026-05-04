<?php

namespace App\Entity;

use App\Repository\ResetPasswordTokenRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ResetPasswordTokenRepository::class)]
class ResetPasswordToken
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(length: 64)]
    private string $hashedToken;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $requestedAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $expiresAt;

    public function __construct(User $user, string $hashedToken, \DateTimeImmutable $expiresAt)
    {
        $this->user = $user;
        $this->hashedToken = $hashedToken;
        $this->requestedAt = new \DateTimeImmutable();
        $this->expiresAt = $expiresAt;
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): User { return $this->user; }
    public function getHashedToken(): string { return $this->hashedToken; }
    public function getRequestedAt(): \DateTimeImmutable { return $this->requestedAt; }
    public function getExpiresAt(): \DateTimeImmutable { return $this->expiresAt; }

    public function isExpired(): bool
    {
        return $this->expiresAt <= new \DateTimeImmutable();
    }
}
