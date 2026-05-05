<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\MySQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260506120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Mark existing GTS survey questions as required by default.';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof MySQLPlatform,
            'Migration can only be executed safely on MySQL.'
        );

        $this->addSql('ALTER TABLE gts_survey_question ADD COLUMN is_required TINYINT(1) NOT NULL DEFAULT 0');
        $this->addSql('UPDATE gts_survey_question SET is_required = 1 WHERE is_required = 0');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof MySQLPlatform,
            'Migration can only be executed safely on MySQL.'
        );

        $this->addSql('ALTER TABLE gts_survey_question DROP COLUMN is_required');
    }
}
