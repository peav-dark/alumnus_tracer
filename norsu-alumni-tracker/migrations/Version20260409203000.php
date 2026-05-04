<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\MySQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260409203000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add dynamic answers to gts_survey and create gts_survey_question table';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof MySQLPlatform,
            'Migration can only be executed safely on mysql.'
        );

        $this->addSql('ALTER TABLE gts_survey ADD dynamic_answers JSON DEFAULT NULL');
        $this->addSql('CREATE TABLE gts_survey_question (id INT AUTO_INCREMENT NOT NULL, question_text LONGTEXT NOT NULL, input_type VARCHAR(50) NOT NULL, section VARCHAR(120) NOT NULL, options JSON DEFAULT NULL, sort_order INT NOT NULL, is_active TINYINT(1) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof MySQLPlatform,
            'Migration can only be executed safely on mysql.'
        );

        $this->addSql('DROP TABLE gts_survey_question');
        $this->addSql('ALTER TABLE gts_survey DROP dynamic_answers');
    }
}
