<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260311124949 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add unique constraint to department name';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE UNIQUE INDEX UNIQ_CD1DE18A5E237E06 ON department (name)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_CD1DE18A5E237E06 ON department');
    }
}
