<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\MySQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260408164000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add school_id column to user table for registration form';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof MySQLPlatform,
            'Migration can only be executed safely on mysql.'
        );

        $this->addSql('ALTER TABLE `user` ADD school_id VARCHAR(50) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649F6716D38 ON `user` (school_id)');
    }

    public function down(Schema $schema): void
    {
        $this->abortIf(
            !$this->connection->getDatabasePlatform() instanceof MySQLPlatform,
            'Migration can only be executed safely on mysql.'
        );

        $this->addSql('DROP INDEX UNIQ_8D93D649F6716D38 ON `user`');
        $this->addSql('ALTER TABLE `user` DROP school_id');
    }
}
