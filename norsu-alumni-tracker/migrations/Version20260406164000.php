<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Platforms\MySQLPlatform;
use Doctrine\Migrations\AbstractMigration;

final class Version20260406164000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'MySQL trigger guard: block GTS survey rows linked to admin/staff users';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof MySQLPlatform,
            'Migration can only be executed safely on mysql.'
        );

        $this->addSql('DROP TRIGGER IF EXISTS trg_gts_survey_alumni_only_insert');
        $this->addSql('DROP TRIGGER IF EXISTS trg_gts_survey_alumni_only_update');

        $this->addSql(<<<'SQL'
CREATE TRIGGER trg_gts_survey_alumni_only_insert
BEFORE INSERT ON gts_survey
FOR EACH ROW
BEGIN
    IF NEW.user_id IS NOT NULL AND EXISTS (
        SELECT 1
        FROM `user` u
        WHERE u.id = NEW.user_id
          AND (u.roles LIKE '%ROLE_ADMIN%' OR u.roles LIKE '%ROLE_STAFF%')
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Surveys are for Alumni accounts only.';
    END IF;
END
SQL);

        $this->addSql(<<<'SQL'
CREATE TRIGGER trg_gts_survey_alumni_only_update
BEFORE UPDATE ON gts_survey
FOR EACH ROW
BEGIN
    IF NEW.user_id IS NOT NULL AND EXISTS (
        SELECT 1
        FROM `user` u
        WHERE u.id = NEW.user_id
          AND (u.roles LIKE '%ROLE_ADMIN%' OR u.roles LIKE '%ROLE_STAFF%')
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Surveys are for Alumni accounts only.';
    END IF;
END
SQL);
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof MySQLPlatform,
            'Migration can only be executed safely on mysql.'
        );

        $this->addSql('DROP TRIGGER IF EXISTS trg_gts_survey_alumni_only_insert');
        $this->addSql('DROP TRIGGER IF EXISTS trg_gts_survey_alumni_only_update');
    }
}
