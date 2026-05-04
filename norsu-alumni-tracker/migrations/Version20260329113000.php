<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260329113000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add tracer status and last tracer submission timestamp to alumni';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE alumni ADD tracer_status VARCHAR(50) DEFAULT NULL, ADD last_tracer_submission_at DATETIME DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE alumni DROP tracer_status, DROP last_tracer_submission_at');
    }
}
