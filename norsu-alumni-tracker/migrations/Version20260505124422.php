<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260505124422 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE student_record (id INT AUTO_INCREMENT NOT NULL, student_id VARCHAR(50) NOT NULL, first_name VARCHAR(255) NOT NULL, middle_name VARCHAR(255) DEFAULT NULL, last_name VARCHAR(255) NOT NULL, college VARCHAR(255) DEFAULT NULL, department VARCHAR(255) DEFAULT NULL, batch_year INT DEFAULT NULL, claimed_at DATETIME DEFAULT NULL, imported_at DATETIME NOT NULL, import_batch_label VARCHAR(100) DEFAULT NULL, claimed_by_user_id INT DEFAULT NULL, INDEX IDX_15024711F8310F52 (claimed_by_user_id), UNIQUE INDEX UNIQ_STUDENT_RECORD_STUDENT_ID (student_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE student_record ADD CONSTRAINT FK_15024711F8310F52 FOREIGN KEY (claimed_by_user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE notification CHANGE created_at created_at DATETIME NOT NULL, CHANGE read_at read_at DATETIME DEFAULT NULL, CHANGE expires_at expires_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE notification RENAME INDEX idx_bf5476cabf396750 TO IDX_BF5476CAE92F8F78');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE student_record DROP FOREIGN KEY FK_15024711F8310F52');
        $this->addSql('DROP TABLE student_record');
        $this->addSql('ALTER TABLE notification CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE read_at read_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE expires_at expires_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE notification RENAME INDEX idx_bf5476cae92f8f78 TO IDX_BF5476CABF396750');
    }
}
