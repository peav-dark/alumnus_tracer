<?php

namespace App\Controller;

use App\Entity\Alumni;
use App\Entity\User;
use App\Repository\CollegeRepository;
use App\Repository\DepartmentRepository;
use App\Repository\StudentRecordRepository;
use App\Service\SurveyInvitationAssignmentService;
use App\Service\AccountSettingsService;
use App\Service\GoogleOnboardingService;
use App\Service\RegistrationValidationException;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/account')]
#[IsGranted('ROLE_USER')]
class AccountApiController extends AbstractController
{
    public function __construct(
        private AccountSettingsService $accountSettingsService,
        private GoogleOnboardingService $googleOnboardingService,
        private EntityManagerInterface $entityManager,
    ) {}

    #[Route('/settings', name: 'api_account_settings_show', methods: ['GET'])]
    public function settings(Request $request): JsonResponse
    {
        return $this->json(
            $this->accountSettingsService->getSettings($this->currentUser(), $this->baseUrl($request))
        );
    }

    #[Route('/settings', name: 'api_account_settings_update', methods: ['PATCH'])]
    public function updateSettings(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        $result = $this->accountSettingsService->updateSettings(
            $this->currentUser(),
            is_array($payload) ? $payload : [],
            $this->baseUrl($request)
        );

        return $this->json($result, isset($result['errors']) ? 422 : 200);
    }

    #[Route('/photo', name: 'api_account_photo_update', methods: ['POST'])]
    public function updatePhoto(Request $request): JsonResponse
    {
        $result = $this->accountSettingsService->updatePhoto(
            $this->currentUser(),
            $request->files->get('photo'),
            $this->baseUrl($request)
        );

        return $this->json($result, isset($result['errors']) ? 422 : 200);
    }

    #[Route('/photo', name: 'api_account_photo_delete', methods: ['DELETE'])]
    public function removePhoto(Request $request): JsonResponse
    {
        return $this->json(
            $this->accountSettingsService->removePhoto($this->currentUser(), $this->baseUrl($request))
        );
    }

    #[Route('/google-onboarding', name: 'api_account_google_onboarding_show', methods: ['GET'])]
    public function googleOnboarding(): JsonResponse
    {
        $user = $this->currentUser();

        if (!$this->googleOnboardingService->hasAlumniMatchForOnboarding($user)) {
            return $this->json([
                'message' => $this->googleOnboardingService->onboardingBlockedMessage(),
            ], 409);
        }

        return $this->json([
            'needsOnboarding' => $this->googleOnboardingService->needsOnboarding($user),
            ...$this->googleOnboardingService->buildFrontendContext($user),
        ]);
    }

    #[Route('/google-onboarding', name: 'api_account_google_onboarding_complete', methods: ['PATCH'])]
    public function completeGoogleOnboarding(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        $user = $this->currentUser();

        if (!$this->googleOnboardingService->hasAlumniMatchForOnboarding($user)) {
            return $this->json([
                'message' => $this->googleOnboardingService->onboardingBlockedMessage(),
                'errors' => [
                    'form' => $this->googleOnboardingService->onboardingBlockedMessage(),
                ],
            ], 409);
        }

        try {
            $user = $this->googleOnboardingService->completeOnboarding(
                $user,
                is_array($payload) ? $payload : [],
            );

            return $this->json([
                'message' => 'Your Google profile is complete.',
                ...$this->accountSettingsService->getSettings($user, $this->baseUrl($request)),
            ]);
        } catch (RegistrationValidationException $exception) {
            return $this->json([
                'message' => 'Please complete the required Google account details.',
                'errors' => $exception->getFieldErrors(),
            ], 422);
        }
    }

    #[Route('/password', name: 'api_account_password_update', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        $result = $this->accountSettingsService->changePassword(
            $this->currentUser(),
            is_array($payload) ? $payload : [],
            $this->baseUrl($request)
        );

        return $this->json($result, isset($result['errors']) ? 422 : 200);
    }

    private function currentUser(): User
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            throw $this->createAccessDeniedException('Authenticated account is required.');
        }

        return $user;
    }

    private function baseUrl(Request $request): string
    {
        return $request->getSchemeAndHttpHost();
    }

    // ══════════════════════════════════════════════════════════════
    //  STUDENT RECORD LINKING (Post-Login Modal)
    // ══════════════════════════════════════════════════════════════

    /**
     * GET /api/account/search-student-records?q=202200123
     *
     * Search unclaimed student records by student ID.
     * Only accessible to users who still need to link.
     */
    #[Route('/search-student-records', name: 'api_account_search_student_records', methods: ['GET'])]
    public function searchStudentRecords(
        Request $request,
        StudentRecordRepository $studentRecordRepo,
    ): JsonResponse {
        $this->currentUser(); // Ensure authenticated

        $query = trim((string) $request->query->get('q', ''));

        if (strlen($query) < 2) {
            return $this->json(['items' => [], 'message' => 'Enter at least 2 characters to search.']);
        }

        // Search by student ID or name
        $records = $studentRecordRepo->createQueryBuilder('sr')
            ->where('sr.claimedByUser IS NULL')
            ->andWhere('sr.studentId LIKE :q OR sr.firstName LIKE :q OR sr.lastName LIKE :q')
            ->setParameter('q', '%' . $query . '%')
            ->orderBy('sr.studentId', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();

        return $this->json([
            'items' => array_map(static fn ($sr) => [
                'id' => $sr->getId(),
                'studentId' => $sr->getStudentId(),
                'fullName' => $sr->getFullName(),
                'firstName' => $sr->getFirstName(),
                'middleName' => $sr->getMiddleName(),
                'lastName' => $sr->getLastName(),
                'batchYear' => $sr->getBatchYear(),
            ], $records),
            'totalUnclaimed' => $studentRecordRepo->countUnclaimed(),
        ]);
    }

    /**
     * GET /api/account/academic-options
     *
     * Returns colleges and departments for the linking modal dropdowns.
     */
    #[Route('/academic-options', name: 'api_account_academic_options', methods: ['GET'])]
    public function academicOptions(
        CollegeRepository $collegeRepo,
        DepartmentRepository $departmentRepo,
    ): JsonResponse {
        $colleges = $collegeRepo->findBy([], ['name' => 'ASC']);
        $departments = $departmentRepo->findBy([], ['name' => 'ASC']);

        return $this->json([
            'colleges' => array_map(static fn ($c) => [
                'id' => $c->getId(),
                'name' => $c->getName(),
                'code' => $c->getCode(),
            ], $colleges),
            'departments' => array_map(static fn ($d) => [
                'id' => $d->getId(),
                'name' => $d->getName(),
                'collegeName' => $d->getCollege()?->getName(),
                'collegeId' => $d->getCollege()?->getId(),
            ], $departments),
        ]);
    }

    /**
     * POST /api/account/claim-student-record
     *
     * Payload: { "studentRecordId": 42, "collegeId": 1, "departmentId": 3 }
     *
     * Claims a StudentRecord for the logged-in user.
     * Creates/updates the Alumni entity, sets needsStudentLink = false.
     */
    #[Route('/claim-student-record', name: 'api_account_claim_student_record', methods: ['POST'])]
    public function claimStudentRecord(
        Request $request,
        StudentRecordRepository $studentRecordRepo,
        CollegeRepository $collegeRepo,
        DepartmentRepository $departmentRepo,
        SurveyInvitationAssignmentService $invitationAssignmentService,
    ): JsonResponse {
        $user = $this->currentUser();

        if (!$user->getNeedsStudentLink()) {
            return $this->json(['message' => 'Your account is already linked to a student record.'], 409);
        }

        $payload = json_decode($request->getContent(), true);
        $recordId = is_numeric($payload['studentRecordId'] ?? null) ? (int) $payload['studentRecordId'] : 0;
        $collegeId = is_numeric($payload['collegeId'] ?? null) ? (int) $payload['collegeId'] : 0;
        $departmentId = is_numeric($payload['departmentId'] ?? null) ? (int) $payload['departmentId'] : 0;

        if ($recordId <= 0) {
            return $this->json(['message' => 'Please select a student record.'], 422);
        }

        if ($collegeId <= 0) {
            return $this->json(['message' => 'Please select your college.'], 422);
        }

        if ($departmentId <= 0) {
            return $this->json(['message' => 'Please select your department.'], 422);
        }

        $record = $studentRecordRepo->find($recordId);

        if ($record === null) {
            return $this->json(['message' => 'Student record not found.'], 404);
        }

        if ($record->isClaimed()) {
            return $this->json(['message' => 'This student record has already been claimed by another user.'], 409);
        }

        $college = $collegeRepo->find($collegeId);
        $department = $departmentRepo->find($departmentId);

        if ($college === null) {
            return $this->json(['message' => 'Selected college not found.'], 422);
        }

        if ($department === null) {
            return $this->json(['message' => 'Selected department not found.'], 422);
        }

        // Claim the record
        $record->setClaimedByUser($user);
        $record->setClaimedAt(new \DateTimeImmutable());
        $record->setCollege($college->getName());
        $record->setDepartment($department->getName());

        // Update user details from the student record
        $user->setFirstName($record->getFirstName());
        $user->setLastName($record->getLastName());
        $user->setSchoolId($record->getStudentId());
        $user->setNeedsStudentLink(false);

        // Create or update Alumni record
        $alumni = $user->getAlumni();

        if (!$alumni instanceof Alumni) {
            $alumni = new Alumni();
            $alumni->setUser($user);
            $user->setAlumni($alumni);
        }

        $alumni->setStudentNumber($record->getStudentId());
        $alumni->setFirstName($record->getFirstName());
        $alumni->setMiddleName($record->getMiddleName());
        $alumni->setLastName($record->getLastName());
        $alumni->setEmailAddress($user->getEmail());
        $alumni->setCollege($college->getName());
        $alumni->setCourse($department->getName());

        if ($record->getBatchYear() !== null) {
            $alumni->setYearGraduated($record->getBatchYear());
        }

        $this->entityManager->persist($alumni);
        $this->entityManager->flush();

        $invitationAssignmentService->assignForUser($user);

        return $this->json([
            'message' => 'Student record linked successfully. Welcome, ' . $record->getFullName() . '!',
            'studentRecord' => [
                'studentId' => $record->getStudentId(),
                'fullName' => $record->getFullName(),
                'college' => $college->getName(),
                'department' => $department->getName(),
                'batchYear' => $record->getBatchYear(),
            ],
        ]);
    }
}
