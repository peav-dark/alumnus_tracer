<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260224141255 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE gts_survey (id INT AUTO_INCREMENT NOT NULL, institution_code VARCHAR(100) DEFAULT NULL, control_code VARCHAR(100) DEFAULT NULL, name VARCHAR(255) NOT NULL, permanent_address LONGTEXT DEFAULT NULL, email_address VARCHAR(255) DEFAULT NULL, telephone_number VARCHAR(100) DEFAULT NULL, mobile_number VARCHAR(100) DEFAULT NULL, civil_status VARCHAR(50) DEFAULT NULL, sex VARCHAR(10) DEFAULT NULL, birthday DATE DEFAULT NULL, region_of_origin VARCHAR(50) DEFAULT NULL, province VARCHAR(100) DEFAULT NULL, location_of_residence VARCHAR(50) DEFAULT NULL, educational_attainment JSON DEFAULT NULL, professional_exams JSON DEFAULT NULL, reasons_for_course_undergrad JSON DEFAULT NULL, reasons_for_course_grad JSON DEFAULT NULL, reasons_for_course_other VARCHAR(255) DEFAULT NULL, trainings JSON DEFAULT NULL, reasons_advance_study JSON DEFAULT NULL, reason_advance_study_other VARCHAR(255) DEFAULT NULL, presently_employed VARCHAR(30) DEFAULT NULL, reasons_not_employed JSON DEFAULT NULL, reason_not_employed_other VARCHAR(255) DEFAULT NULL, present_employment_status VARCHAR(50) DEFAULT NULL, present_occupation VARCHAR(255) DEFAULT NULL, company_name_address LONGTEXT DEFAULT NULL, line_of_business VARCHAR(255) DEFAULT NULL, place_of_work VARCHAR(20) DEFAULT NULL, is_first_job_after_college TINYINT DEFAULT NULL, reasons_for_staying JSON DEFAULT NULL, reason_for_staying_other VARCHAR(255) DEFAULT NULL, first_job_related_to_course TINYINT DEFAULT NULL, reasons_for_accepting JSON DEFAULT NULL, reason_for_accepting_other VARCHAR(255) DEFAULT NULL, reasons_for_changing JSON DEFAULT NULL, reason_for_changing_other VARCHAR(255) DEFAULT NULL, duration_first_job VARCHAR(50) DEFAULT NULL, duration_first_job_other VARCHAR(255) DEFAULT NULL, how_found_first_job JSON DEFAULT NULL, how_found_first_job_other VARCHAR(255) DEFAULT NULL, time_to_land_first_job VARCHAR(50) DEFAULT NULL, time_to_land_first_job_other VARCHAR(255) DEFAULT NULL, job_level_first_job VARCHAR(100) DEFAULT NULL, job_level_current_job VARCHAR(100) DEFAULT NULL, initial_monthly_earning VARCHAR(100) DEFAULT NULL, curriculum_relevant TINYINT DEFAULT NULL, competencies_useful JSON DEFAULT NULL, competencies_useful_other VARCHAR(255) DEFAULT NULL, suggestions LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, user_id INT DEFAULT NULL, INDEX IDX_9621D0D4A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE gts_survey ADD CONSTRAINT FK_9621D0D4A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE user CHANGE role role SMALLINT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE gts_survey DROP FOREIGN KEY FK_9621D0D4A76ED395');
        $this->addSql('DROP TABLE gts_survey');
        $this->addSql('ALTER TABLE `user` CHANGE role role SMALLINT DEFAULT 3 NOT NULL');
    }
}
