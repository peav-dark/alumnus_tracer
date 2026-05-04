<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260220093040 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE audit_log (id INT AUTO_INCREMENT NOT NULL, action VARCHAR(50) NOT NULL, entity_type VARCHAR(255) NOT NULL, entity_id INT DEFAULT NULL, details LONGTEXT DEFAULT NULL, ip_address VARCHAR(45) DEFAULT NULL, created_at DATETIME NOT NULL, performed_by_id INT NOT NULL, INDEX IDX_F6E1C0F52E65C292 (performed_by_id), INDEX idx_audit_action (action), INDEX idx_audit_date (created_at), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE job_posting (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, company_name VARCHAR(255) NOT NULL, location VARCHAR(500) DEFAULT NULL, description LONGTEXT NOT NULL, requirements LONGTEXT DEFAULT NULL, salary_range VARCHAR(100) DEFAULT NULL, employment_type VARCHAR(100) DEFAULT NULL, industry VARCHAR(255) DEFAULT NULL, related_course VARCHAR(255) DEFAULT NULL, contact_email VARCHAR(255) DEFAULT NULL, application_link VARCHAR(255) DEFAULT NULL, deadline DATE DEFAULT NULL, is_active TINYINT NOT NULL, date_posted DATETIME NOT NULL, date_updated DATETIME DEFAULT NULL, posted_by_id INT DEFAULT NULL, INDEX IDX_27C8EAE85A6D2235 (posted_by_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE audit_log ADD CONSTRAINT FK_F6E1C0F52E65C292 FOREIGN KEY (performed_by_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE job_posting ADD CONSTRAINT FK_27C8EAE85A6D2235 FOREIGN KEY (posted_by_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE audit_log DROP FOREIGN KEY FK_F6E1C0F52E65C292');
        $this->addSql('ALTER TABLE job_posting DROP FOREIGN KEY FK_27C8EAE85A6D2235');
        $this->addSql('DROP TABLE audit_log');
        $this->addSql('DROP TABLE job_posting');
    }
}
