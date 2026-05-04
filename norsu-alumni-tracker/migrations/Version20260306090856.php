<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260306090856 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE college (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, code VARCHAR(100) NOT NULL, description VARCHAR(500) DEFAULT NULL, is_active TINYINT DEFAULT NULL, UNIQUE INDEX UNIQ_AADA87025E237E06 (name), UNIQUE INDEX UNIQ_AADA870277153098 (code), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE department (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, code VARCHAR(100) NOT NULL, description VARCHAR(500) DEFAULT NULL, is_active TINYINT DEFAULT NULL, college_id INT NOT NULL, UNIQUE INDEX UNIQ_CD1DE18A77153098 (code), INDEX IDX_CD1DE18A770124B2 (college_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE department ADD CONSTRAINT FK_CD1DE18A770124B2 FOREIGN KEY (college_id) REFERENCES college (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE department DROP FOREIGN KEY FK_CD1DE18A770124B2');
        $this->addSql('DROP TABLE college');
        $this->addSql('DROP TABLE department');
    }
}
