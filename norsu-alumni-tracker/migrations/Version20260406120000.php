<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260406120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Enforce one GTS survey response per user with unique index on gts_survey.user_id';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE gts_survey DROP INDEX IDX_9621D0D4A76ED395, ADD UNIQUE INDEX UNIQ_GTS_SURVEY_USER (user_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE gts_survey DROP INDEX UNIQ_GTS_SURVEY_USER, ADD INDEX IDX_9621D0D4A76ED395 (user_id)');
    }
}
