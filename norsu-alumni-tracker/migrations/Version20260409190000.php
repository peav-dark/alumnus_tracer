<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\MySQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260409190000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create communication table for admin email module';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof MySQLPlatform,
            'Migration can only be executed safely on mysql.'
        );

        $this->addSql('CREATE TABLE communication (id INT AUTO_INCREMENT NOT NULL, subject VARCHAR(255) NOT NULL, message LONGTEXT NOT NULL, channel VARCHAR(100) NOT NULL, recipient_count INT NOT NULL, target_year VARCHAR(255) DEFAULT NULL, sent_at DATETIME NOT NULL, sent_by VARCHAR(100) DEFAULT NULL, INDEX IDX_87A00AE3D1606510 (sent_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof MySQLPlatform,
            'Migration can only be executed safely on mysql.'
        );

        $this->addSql('DROP TABLE communication');
    }
}
