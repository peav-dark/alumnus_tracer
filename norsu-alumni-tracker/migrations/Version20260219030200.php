<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260219030200 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE alumni (id INT AUTO_INCREMENT NOT NULL, student_id VARCHAR(100) NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, course VARCHAR(100) NOT NULL, batch_year INT NOT NULL, current_employment_status VARCHAR(100) DEFAULT NULL, email VARCHAR(180) NOT NULL, phone VARCHAR(255) DEFAULT NULL, current_position VARCHAR(255) DEFAULT NULL, company_name VARCHAR(255) DEFAULT NULL, salary_range VARCHAR(255) DEFAULT NULL, location VARCHAR(255) DEFAULT NULL, skills VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_FD567018CB944F1A (student_id), UNIQUE INDEX UNIQ_FD567018E7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE work_history (id INT AUTO_INCREMENT NOT NULL, position VARCHAR(255) NOT NULL, company VARCHAR(255) DEFAULT NULL, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL, alumni_id INT NOT NULL, INDEX IDX_F271C869D943BA32 (alumni_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 (queue_name, available_at, delivered_at, id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE work_history ADD CONSTRAINT FK_F271C869D943BA32 FOREIGN KEY (alumni_id) REFERENCES alumni (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE work_history DROP FOREIGN KEY FK_F271C869D943BA32');
        $this->addSql('DROP TABLE alumni');
        $this->addSql('DROP TABLE work_history');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
