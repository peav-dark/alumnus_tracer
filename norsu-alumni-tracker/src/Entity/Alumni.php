<?php

namespace App\Entity;

use App\Repository\AlumniRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: AlumniRepository::class)]
class Alumni
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // ── Personal Information ──
    #[ORM\Column(length: 100, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 100)]
    private string $studentNumber;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    private string $firstName;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $middleName = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    private string $lastName;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $suffix = null;

    #[ORM\Column(length: 10, nullable: true)]
    private ?string $sex = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateOfBirth = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $civilStatus = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $contactNumber = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Email]
    private string $emailAddress;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $homeAddress = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $province = null;

    #[ORM\Column(nullable: true)]
    private ?int $yearGraduated = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $course = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $college = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $honorsReceived = null;

    // ── Academic Information ──
    #[ORM\Column(length: 255, nullable: true)]
    private ?string $degreeProgram = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $major = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateGraduated = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $latinHonor = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $gwa = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $scholarshipGranted = null;

    // ── Employment Information (current snapshot) ──
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $employmentStatus = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $tracerStatus = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $lastTracerSubmissionAt = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $employmentType = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $companyName = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $jobTitle = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $jobLevel = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $industry = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $companyAddress = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateHired = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $monthlySalary = null;

    #[ORM\Column(nullable: true)]
    private ?bool $isFirstJob = null;

    #[ORM\Column(nullable: true)]
    private ?int $yearsInCompany = null;

    #[ORM\Column(nullable: true)]
    private ?bool $workAbroad = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $countryOfEmployment = null;

    // ── Career Tracking ──
    #[ORM\Column(nullable: true)]
    private ?bool $jobRelatedToCourse = null;

    #[ORM\Column(nullable: true)]
    private ?bool $promotionReceived = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $datePromoted = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $skillsUsedInJob = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $trainingsAttended = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $licensesObtained = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $certifications = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $careerAchievements = null;

    // ── Feedback & University Contribution ──
    #[ORM\Column(nullable: true)]
    private ?bool $furtherStudies = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $postgraduateDegree = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $schoolForFurtherStudies = null;

    #[ORM\Column(nullable: true)]
    private ?bool $recommendNorsu = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $suggestionsForUniversity = null;

    #[ORM\Column(nullable: true)]
    private ?bool $willingForSeminar = null;

    #[ORM\Column(nullable: true)]
    private ?bool $willingForDonation = null;

    #[ORM\Column(nullable: true)]
    private ?bool $willingForMentorship = null;

    // ── Soft Delete ──
    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $deletedAt = null;

    // ── Relations ──
    #[ORM\OneToOne(inversedBy: 'alumni', targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?User $user = null;

    #[ORM\OneToMany(mappedBy: 'alumni', targetEntity: Employment::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $employments;

    #[ORM\OneToMany(mappedBy: 'alumni', targetEntity: Education::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $educations;

    #[ORM\OneToMany(mappedBy: 'alumni', targetEntity: Feedback::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $feedbacks;

    #[ORM\OneToMany(mappedBy: 'alumni', targetEntity: Document::class, cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $documents;

    public function __construct()
    {
        $this->employments = new ArrayCollection();
        $this->educations = new ArrayCollection();
        $this->feedbacks = new ArrayCollection();
        $this->documents = new ArrayCollection();
    }

    // ── Getters & Setters ──

    public function getId(): ?int { return $this->id; }

    public function getStudentNumber(): string { return $this->studentNumber; }
    public function setStudentNumber(string $v): static { $this->studentNumber = $v; return $this; }

    public function getFirstName(): string { return $this->firstName; }
    public function setFirstName(string $v): static { $this->firstName = $v; return $this; }

    public function getMiddleName(): ?string { return $this->middleName; }
    public function setMiddleName(?string $v): static { $this->middleName = $v; return $this; }

    public function getLastName(): string { return $this->lastName; }
    public function setLastName(string $v): static { $this->lastName = $v; return $this; }

    public function getSuffix(): ?string { return $this->suffix; }
    public function setSuffix(?string $v): static { $this->suffix = $v; return $this; }

    public function getSex(): ?string { return $this->sex; }
    public function setSex(?string $v): static { $this->sex = $v; return $this; }

    public function getDateOfBirth(): ?\DateTimeInterface { return $this->dateOfBirth; }
    public function setDateOfBirth(?\DateTimeInterface $v): static { $this->dateOfBirth = $v; return $this; }

    public function getCivilStatus(): ?string { return $this->civilStatus; }
    public function setCivilStatus(?string $v): static { $this->civilStatus = $v; return $this; }

    public function getContactNumber(): ?string { return $this->contactNumber; }
    public function setContactNumber(?string $v): static { $this->contactNumber = $v; return $this; }

    public function getEmailAddress(): string { return $this->emailAddress; }
    public function setEmailAddress(string $v): static { $this->emailAddress = $v; return $this; }

    public function getHomeAddress(): ?string { return $this->homeAddress; }
    public function setHomeAddress(?string $v): static { $this->homeAddress = $v; return $this; }

    public function getProvince(): ?string { return $this->province; }
    public function setProvince(?string $v): static { $this->province = $v; return $this; }

    public function getYearGraduated(): ?int { return $this->yearGraduated; }
    public function setYearGraduated(?int $v): static { $this->yearGraduated = $v; return $this; }

    public function getCourse(): ?string { return $this->course; }
    public function setCourse(?string $v): static { $this->course = $v; return $this; }

    public function getCollege(): ?string { return $this->college; }
    public function setCollege(?string $v): static { $this->college = $v; return $this; }

    public function getHonorsReceived(): ?string { return $this->honorsReceived; }
    public function setHonorsReceived(?string $v): static { $this->honorsReceived = $v; return $this; }

    public function getDegreeProgram(): ?string { return $this->degreeProgram; }
    public function setDegreeProgram(?string $v): static { $this->degreeProgram = $v; return $this; }

    public function getMajor(): ?string { return $this->major; }
    public function setMajor(?string $v): static { $this->major = $v; return $this; }

    public function getDateGraduated(): ?\DateTimeInterface { return $this->dateGraduated; }
    public function setDateGraduated(?\DateTimeInterface $v): static { $this->dateGraduated = $v; return $this; }

    public function getLatinHonor(): ?string { return $this->latinHonor; }
    public function setLatinHonor(?string $v): static { $this->latinHonor = $v; return $this; }

    public function getGwa(): ?string { return $this->gwa; }
    public function setGwa(?string $v): static { $this->gwa = $v; return $this; }

    public function getScholarshipGranted(): ?string { return $this->scholarshipGranted; }
    public function setScholarshipGranted(?string $v): static { $this->scholarshipGranted = $v; return $this; }

    public function getEmploymentStatus(): ?string { return $this->employmentStatus; }
    public function setEmploymentStatus(?string $v): static { $this->employmentStatus = $v; return $this; }

    public function getTracerStatus(): ?string { return $this->tracerStatus; }
    public function setTracerStatus(?string $v): static { $this->tracerStatus = $v; return $this; }

    public function getLastTracerSubmissionAt(): ?\DateTimeInterface { return $this->lastTracerSubmissionAt; }
    public function setLastTracerSubmissionAt(?\DateTimeInterface $v): static { $this->lastTracerSubmissionAt = $v; return $this; }

    public function getEmploymentType(): ?string { return $this->employmentType; }
    public function setEmploymentType(?string $v): static { $this->employmentType = $v; return $this; }

    public function getCompanyName(): ?string { return $this->companyName; }
    public function setCompanyName(?string $v): static { $this->companyName = $v; return $this; }

    public function getJobTitle(): ?string { return $this->jobTitle; }
    public function setJobTitle(?string $v): static { $this->jobTitle = $v; return $this; }

    public function getJobLevel(): ?string { return $this->jobLevel; }
    public function setJobLevel(?string $v): static { $this->jobLevel = $v; return $this; }

    public function getIndustry(): ?string { return $this->industry; }
    public function setIndustry(?string $v): static { $this->industry = $v; return $this; }

    public function getCompanyAddress(): ?string { return $this->companyAddress; }
    public function setCompanyAddress(?string $v): static { $this->companyAddress = $v; return $this; }

    public function getDateHired(): ?\DateTimeInterface { return $this->dateHired; }
    public function setDateHired(?\DateTimeInterface $v): static { $this->dateHired = $v; return $this; }

    public function getMonthlySalary(): ?string { return $this->monthlySalary; }
    public function setMonthlySalary(?string $v): static { $this->monthlySalary = $v; return $this; }

    public function isFirstJob(): ?bool { return $this->isFirstJob; }
    public function setIsFirstJob(?bool $v): static { $this->isFirstJob = $v; return $this; }

    public function getYearsInCompany(): ?int { return $this->yearsInCompany; }
    public function setYearsInCompany(?int $v): static { $this->yearsInCompany = $v; return $this; }

    public function isWorkAbroad(): ?bool { return $this->workAbroad; }
    public function setWorkAbroad(?bool $v): static { $this->workAbroad = $v; return $this; }

    public function getCountryOfEmployment(): ?string { return $this->countryOfEmployment; }
    public function setCountryOfEmployment(?string $v): static { $this->countryOfEmployment = $v; return $this; }

    public function isJobRelatedToCourse(): ?bool { return $this->jobRelatedToCourse; }
    public function setJobRelatedToCourse(?bool $v): static { $this->jobRelatedToCourse = $v; return $this; }

    public function isPromotionReceived(): ?bool { return $this->promotionReceived; }
    public function setPromotionReceived(?bool $v): static { $this->promotionReceived = $v; return $this; }

    public function getDatePromoted(): ?\DateTimeInterface { return $this->datePromoted; }
    public function setDatePromoted(?\DateTimeInterface $v): static { $this->datePromoted = $v; return $this; }

    public function getSkillsUsedInJob(): ?string { return $this->skillsUsedInJob; }
    public function setSkillsUsedInJob(?string $v): static { $this->skillsUsedInJob = $v; return $this; }

    public function getTrainingsAttended(): ?string { return $this->trainingsAttended; }
    public function setTrainingsAttended(?string $v): static { $this->trainingsAttended = $v; return $this; }

    public function getLicensesObtained(): ?string { return $this->licensesObtained; }
    public function setLicensesObtained(?string $v): static { $this->licensesObtained = $v; return $this; }

    public function getCertifications(): ?string { return $this->certifications; }
    public function setCertifications(?string $v): static { $this->certifications = $v; return $this; }

    public function getCareerAchievements(): ?string { return $this->careerAchievements; }
    public function setCareerAchievements(?string $v): static { $this->careerAchievements = $v; return $this; }

    public function isFurtherStudies(): ?bool { return $this->furtherStudies; }
    public function setFurtherStudies(?bool $v): static { $this->furtherStudies = $v; return $this; }

    public function getPostgraduateDegree(): ?string { return $this->postgraduateDegree; }
    public function setPostgraduateDegree(?string $v): static { $this->postgraduateDegree = $v; return $this; }

    public function getSchoolForFurtherStudies(): ?string { return $this->schoolForFurtherStudies; }
    public function setSchoolForFurtherStudies(?string $v): static { $this->schoolForFurtherStudies = $v; return $this; }

    public function isRecommendNorsu(): ?bool { return $this->recommendNorsu; }
    public function setRecommendNorsu(?bool $v): static { $this->recommendNorsu = $v; return $this; }

    public function getSuggestionsForUniversity(): ?string { return $this->suggestionsForUniversity; }
    public function setSuggestionsForUniversity(?string $v): static { $this->suggestionsForUniversity = $v; return $this; }

    public function isWillingForSeminar(): ?bool { return $this->willingForSeminar; }
    public function setWillingForSeminar(?bool $v): static { $this->willingForSeminar = $v; return $this; }

    public function isWillingForDonation(): ?bool { return $this->willingForDonation; }
    public function setWillingForDonation(?bool $v): static { $this->willingForDonation = $v; return $this; }

    public function isWillingForMentorship(): ?bool { return $this->willingForMentorship; }
    public function setWillingForMentorship(?bool $v): static { $this->willingForMentorship = $v; return $this; }

    public function getDeletedAt(): ?\DateTimeInterface { return $this->deletedAt; }
    public function setDeletedAt(?\DateTimeInterface $v): static { $this->deletedAt = $v; return $this; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $v): static { $this->user = $v; return $this; }

    /** @return Collection<int, Employment> */
    public function getEmployments(): Collection { return $this->employments; }
    public function addEmployment(Employment $e): static { if (!$this->employments->contains($e)) { $this->employments->add($e); $e->setAlumni($this); } return $this; }
    public function removeEmployment(Employment $e): static { if ($this->employments->removeElement($e) && $e->getAlumni() === $this) { $e->setAlumni(null); } return $this; }

    /** @return Collection<int, Education> */
    public function getEducations(): Collection { return $this->educations; }
    public function addEducation(Education $e): static { if (!$this->educations->contains($e)) { $this->educations->add($e); $e->setAlumni($this); } return $this; }
    public function removeEducation(Education $e): static { if ($this->educations->removeElement($e) && $e->getAlumni() === $this) { $e->setAlumni(null); } return $this; }

    /** @return Collection<int, Feedback> */
    public function getFeedbacks(): Collection { return $this->feedbacks; }
    public function addFeedback(Feedback $f): static { if (!$this->feedbacks->contains($f)) { $this->feedbacks->add($f); $f->setAlumni($this); } return $this; }
    public function removeFeedback(Feedback $f): static { if ($this->feedbacks->removeElement($f) && $f->getAlumni() === $this) { $f->setAlumni(null); } return $this; }

    /** @return Collection<int, Document> */
    public function getDocuments(): Collection { return $this->documents; }
    public function addDocument(Document $d): static { if (!$this->documents->contains($d)) { $this->documents->add($d); $d->setAlumni($this); } return $this; }
    public function removeDocument(Document $d): static { if ($this->documents->removeElement($d) && $d->getAlumni() === $this) { $d->setAlumni(null); } return $this; }

    public function getFullName(): string
    {
        $parts = [$this->firstName];
        if ($this->middleName) { $parts[] = $this->middleName; }
        $parts[] = $this->lastName;
        if ($this->suffix) { $parts[] = $this->suffix; }
        return implode(' ', $parts);
    }
}
