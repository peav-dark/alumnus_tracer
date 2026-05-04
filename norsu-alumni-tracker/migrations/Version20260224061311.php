<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260224061311 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Convert roles JSON column to numeric role SMALLINT column (1=Admin, 2=Staff, 3=Student)';
    }

    public function up(Schema $schema): void
    {
        // 1. Add the new integer column with default = 3 (Student)
        $this->addSql('ALTER TABLE `user` ADD role SMALLINT NOT NULL DEFAULT 3');

        // 2. Convert existing JSON roles data to integer
        $this->addSql("UPDATE `user` SET role = 1 WHERE roles LIKE '%ROLE_ADMIN%'");
        $this->addSql("UPDATE `user` SET role = 2 WHERE roles LIKE '%ROLE_STAFF%' AND roles NOT LIKE '%ROLE_ADMIN%'");
        $this->addSql("UPDATE `user` SET role = 3 WHERE roles LIKE '%ROLE_STUDENT%' AND roles NOT LIKE '%ROLE_ADMIN%' AND roles NOT LIKE '%ROLE_STAFF%'");

        // 3. Drop the old JSON column
        $this->addSql('ALTER TABLE `user` DROP roles');
    }

    public function down(Schema $schema): void
    {
        // 1. Re-add the JSON column
        $this->addSql('ALTER TABLE `user` ADD roles JSON NOT NULL');

        // 2. Convert integer back to JSON roles
        $this->addSql("UPDATE `user` SET roles = '[\"ROLE_ADMIN\"]' WHERE role = 1");
        $this->addSql("UPDATE `user` SET roles = '[\"ROLE_STAFF\"]' WHERE role = 2");
        $this->addSql("UPDATE `user` SET roles = '[\"ROLE_STUDENT\"]' WHERE role = 3");

        // 3. Drop the integer column
        $this->addSql('ALTER TABLE `user` DROP role');
    }
}
