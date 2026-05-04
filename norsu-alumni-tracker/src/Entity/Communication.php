<?php

namespace App\Entity;

use App\Repository\CommunicationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CommunicationRepository::class)]
class Communication
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $subject;

    #[ORM\Column(type: Types::TEXT)]
    private string $message;

    #[ORM\Column(length: 100)]
    private string $channel = 'email';

    #[ORM\Column]
    private int $recipientCount = 0;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $targetYear = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private \DateTimeInterface $sentAt;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $sentBy = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSubject(): string
    {
        return $this->subject;
    }

    public function setSubject(string $subject): static
    {
        $this->subject = $subject;

        return $this;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function setMessage(string $message): static
    {
        $this->message = $message;

        return $this;
    }

    public function getChannel(): string
    {
        return $this->channel;
    }

    public function setChannel(string $channel): static
    {
        $this->channel = $channel;

        return $this;
    }

    public function getRecipientCount(): int
    {
        return $this->recipientCount;
    }

    public function setRecipientCount(int $recipientCount): static
    {
        $this->recipientCount = $recipientCount;

        return $this;
    }

    public function getTargetYear(): ?string
    {
        return $this->targetYear;
    }

    public function setTargetYear(?string $targetYear): static
    {
        $this->targetYear = $targetYear;

        return $this;
    }

    public function getSentAt(): \DateTimeInterface
    {
        return $this->sentAt;
    }

    public function setSentAt(\DateTimeInterface $sentAt): static
    {
        $this->sentAt = $sentAt;

        return $this;
    }

    public function getSentBy(): ?string
    {
        return $this->sentBy;
    }

    public function setSentBy(?string $sentBy): static
    {
        $this->sentBy = $sentBy;

        return $this;
    }
}
