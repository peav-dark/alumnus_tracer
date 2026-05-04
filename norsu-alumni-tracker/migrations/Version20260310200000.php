<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260310200000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add performance indexes and soft-delete column to alumni table';
    }

    public function up(Schema $schema): void
    {
        // Soft delete column
        $this->addSql('ALTER TABLE alumni ADD deleted_at DATETIME DEFAULT NULL');

        // DPA consent columns on user table
        $this->addSql('ALTER TABLE `user` ADD dpa_consent TINYINT(1) NOT NULL DEFAULT 0');
        $this->addSql('ALTER TABLE `user` ADD dpa_consent_date DATETIME DEFAULT NULL');

        // Performance indexes for frequently filtered/grouped columns
        $this->addSql('CREATE INDEX IDX_alumni_course ON alumni (course)');
        $this->addSql('CREATE INDEX IDX_alumni_year_graduated ON alumni (year_graduated)');
        $this->addSql('CREATE INDEX IDX_alumni_employment_status ON alumni (employment_status)');
        $this->addSql('CREATE INDEX IDX_alumni_college ON alumni (college)');
        $this->addSql('CREATE INDEX IDX_alumni_province ON alumni (province)');
        $this->addSql('CREATE INDEX IDX_alumni_deleted_at ON alumni (deleted_at)');

        // User table indexes
        $this->addSql('CREATE INDEX IDX_user_account_status ON `user` (account_status)');
        $this->addSql('CREATE INDEX IDX_user_last_activity ON `user` (last_activity)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE alumni DROP deleted_at');
        $this->addSql('ALTER TABLE `user` DROP dpa_consent');
        $this->addSql('ALTER TABLE `user` DROP dpa_consent_date');
        $this->addSql('DROP INDEX IDX_alumni_course ON alumni');
        $this->addSql('DROP INDEX IDX_alumni_year_graduated ON alumni');
        $this->addSql('DROP INDEX IDX_alumni_employment_status ON alumni');
        $this->addSql('DROP INDEX IDX_alumni_college ON alumni');
        $this->addSql('DROP INDEX IDX_alumni_province ON alumni');
        $this->addSql('DROP INDEX IDX_alumni_deleted_at ON alumni');
        $this->addSql('DROP INDEX IDX_user_account_status ON `user`');
        $this->addSql('DROP INDEX IDX_user_last_activity ON `user`');
    }
}
