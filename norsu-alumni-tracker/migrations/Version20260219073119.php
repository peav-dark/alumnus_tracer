<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260219073119 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE alumni ADD CONSTRAINT FK_FD567018A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE announcement ADD CONSTRAINT FK_4DB9D91C5A6D2235 FOREIGN KEY (posted_by_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A76D943BA32 FOREIGN KEY (alumni_id) REFERENCES alumni (id)');
        $this->addSql('ALTER TABLE education ADD CONSTRAINT FK_DB0A5ED2D943BA32 FOREIGN KEY (alumni_id) REFERENCES alumni (id)');
        $this->addSql('ALTER TABLE employment ADD CONSTRAINT FK_BF089C98D943BA32 FOREIGN KEY (alumni_id) REFERENCES alumni (id)');
        $this->addSql('ALTER TABLE feedback ADD CONSTRAINT FK_D2294458D943BA32 FOREIGN KEY (alumni_id) REFERENCES alumni (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE alumni DROP FOREIGN KEY FK_FD567018A76ED395');
        $this->addSql('ALTER TABLE announcement DROP FOREIGN KEY FK_4DB9D91C5A6D2235');
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A76D943BA32');
        $this->addSql('ALTER TABLE education DROP FOREIGN KEY FK_DB0A5ED2D943BA32');
        $this->addSql('ALTER TABLE employment DROP FOREIGN KEY FK_BF089C98D943BA32');
        $this->addSql('ALTER TABLE feedback DROP FOREIGN KEY FK_D2294458D943BA32');
    }
}
