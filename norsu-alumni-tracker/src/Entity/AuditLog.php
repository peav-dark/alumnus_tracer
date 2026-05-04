<?php

namespace App\Entity;

use App\Repository\AuditLogRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * Tracks access to sensitive alumni data for Data Privacy Act of 2012 compliance.
 * Records who accessed what data, when, and what action was performed.
 */
#[ORM\Entity(repositoryClass: AuditLogRepository::class)]
#[ORM\Index(columns: ['action'], name: 'idx_audit_action')]
#[ORM\Index(columns: ['created_at'], name: 'idx_audit_date')]
class AuditLog
{
    public const ACTION_VIEW_ALUMNI      = 'view_alumni';
    public const ACTION_EDIT_ALUMNI      = 'edit_alumni';
    public const ACTION_DELETE_ALUMNI    = 'delete_alumni';
    public const ACTION_CREATE_ALUMNI    = 'create_alumni';
    public const ACTION_EXPORT_REPORT   = 'export_report';
    public const ACTION_VIEW_EMPLOYMENT = 'view_employment';
    public const ACTION_APPROVE_USER    = 'approve_user';
    public const ACTION_DENY_USER       = 'deny_user';
    public const ACTION_CHANGE_ROLE     = 'change_role';
    public const ACTION_VIEW_TRACER     = 'view_tracer';
    public const ACTION_IMPORT_ALUMNI   = 'import_alumni';
    public const ACTION_DELETE_USER     = 'delete_user';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private User $performedBy;

    #[ORM\Column(length: 50)]
    private string $action;

    #[ORM\Column(length: 255)]
    private string $entityType; // e.g. 'Alumni', 'User', 'Report'

    #[ORM\Column(nullable: true)]
    private ?int $entityId = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $details = null;

    #[ORM\Column(length: 45, nullable: true)]
    private ?string $ipAddress = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    // ── Getters & Setters ──

    public function getId(): ?int { return $this->id; }

    public function getPerformedBy(): User { return $this->performedBy; }
    public function setPerformedBy(User $v): static { $this->performedBy = $v; return $this; }

    public function getAction(): string { return $this->action; }
    public function setAction(string $v): static { $this->action = $v; return $this; }

    public function getEntityType(): string { return $this->entityType; }
    public function setEntityType(string $v): static { $this->entityType = $v; return $this; }

    public function getEntityId(): ?int { return $this->entityId; }
    public function setEntityId(?int $v): static { $this->entityId = $v; return $this; }

    public function getDetails(): ?string { return $this->details; }
    public function setDetails(?string $v): static { $this->details = $v; return $this; }

    public function getIpAddress(): ?string { return $this->ipAddress; }
    public function setIpAddress(?string $v): static { $this->ipAddress = $v; return $this; }

    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
    public function setCreatedAt(\DateTimeInterface $v): static { $this->createdAt = $v; return $this; }

    public function getActionLabel(): string
    {
        return match ($this->action) {
            self::ACTION_VIEW_ALUMNI      => 'Viewed Alumni Record',
            self::ACTION_EDIT_ALUMNI      => 'Edited Alumni Record',
            self::ACTION_DELETE_ALUMNI    => 'Deleted Alumni Record',
            self::ACTION_CREATE_ALUMNI    => 'Created Alumni Record',
            self::ACTION_EXPORT_REPORT   => 'Exported Report',
            self::ACTION_VIEW_EMPLOYMENT => 'Viewed Employment Data',
            self::ACTION_APPROVE_USER    => 'Approved User',
            self::ACTION_DENY_USER       => 'Denied User',
            self::ACTION_CHANGE_ROLE     => 'Changed User Role',
            self::ACTION_VIEW_TRACER     => 'Viewed Tracer Analytics',
            self::ACTION_IMPORT_ALUMNI   => 'Imported Alumni Data',
            self::ACTION_DELETE_USER     => 'User Data Erasure (DPA)',
            default                      => ucfirst(str_replace('_', ' ', $this->action)),
        };
    }
}
