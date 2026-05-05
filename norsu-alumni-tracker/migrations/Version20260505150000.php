<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\MySQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260505150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create college and department tables for academic management';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof MySQLPlatform,
            'Migration can only be executed safely on MySQL.'
        );

        $this->addSql(
            'CREATE TABLE college (
                id          INT AUTO_INCREMENT NOT NULL,
                name        VARCHAR(255) NOT NULL,
                code        VARCHAR(100) NOT NULL,
                description VARCHAR(500) DEFAULT NULL,
                is_active   TINYINT(1) DEFAULT NULL,
                UNIQUE INDEX UNIQ_COL_NAME (name),
                UNIQUE INDEX UNIQ_COL_CODE (code),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB'
        );

        $this->addSql(
            'CREATE TABLE department (
                id          INT AUTO_INCREMENT NOT NULL,
                college_id  INT NOT NULL,
                name        VARCHAR(255) NOT NULL,
                code        VARCHAR(100) NOT NULL,
                description VARCHAR(500) DEFAULT NULL,
                is_active   TINYINT(1) DEFAULT NULL,
                UNIQUE INDEX UNIQ_DEP_NAME (name),
                UNIQUE INDEX UNIQ_DEP_CODE (code),
                INDEX IDX_DEP_COLLEGE (college_id),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB'
        );

        $this->addSql(
            'ALTER TABLE department
                ADD CONSTRAINT FK_DEP_COLLEGE
                FOREIGN KEY (college_id) REFERENCES college (id)'
        );
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof MySQLPlatform,
            'Migration can only be executed safely on MySQL.'
        );

        $this->addSql('ALTER TABLE department DROP FOREIGN KEY FK_DEP_COLLEGE');
        $this->addSql('DROP TABLE department');
        $this->addSql('DROP TABLE college');
    }
}
