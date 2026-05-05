<?php

namespace App\Service;

use App\Entity\RegistrationDraft;
use App\Entity\User;
use App\Repository\RegistrationDraftRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class RegistrationDraftService
{
    public const SESSION_KEY = 'registration_draft_id';

    public function __construct(
        private EntityManagerInterface $entityManager,
        private RegistrationDraftRepository $draftRepository,
        private UserRepository $userRepository,
        private RegistrationOtpService $otpService,
        private UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    /**
     * Create a simplified registration draft (email + password only).
     *
     * @param array{
     *     email: string,
     *     plainPassword: string,
     *     dpaConsent?: bool
     * } $registration
     *
     * @return array{draft: RegistrationDraft, otpCode: string}
     */
    public function createManualDraft(array $registration): array
    {
        $email = strtolower(trim($registration['email']));
        $plainPassword = trim($registration['plainPassword']);
        $dpaConsent = (bool) ($registration['dpaConsent'] ?? true);

        // Validate
        $errors = [];

        if ($email === '') {
            $errors['email'] = 'Please enter your email address.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Please enter a valid email address.';
        } elseif ($this->userRepository->findOneBy(['email' => $email]) !== null) {
            $errors['email'] = 'This email address is already associated with an account.';
        }

        if ($plainPassword === '') {
            $errors['password'] = 'Please enter a password.';
        } elseif (strlen($plainPassword) < 8) {
            $errors['password'] = 'Password must be at least 8 characters.';
        }

        if ($errors !== []) {
            throw new RegistrationValidationException($errors);
        }

        // Resolve or create draft
        $draft = $this->draftRepository->findOneBy(['email' => $email]) ?? new RegistrationDraft();
        $draft
            ->setFlowType(RegistrationDraft::FLOW_MANUAL)
            ->setEmail($email)
            ->setDpaConsent($dpaConsent)
            ->setPasswordHashTemp($this->hashPasswordForDraft($email, $plainPassword))
            ->setResendCount(0)
            ->setVerifiedAt(null);

        $otpCode = $this->otpService->issueOtp($draft);

        $this->entityManager->persist($draft);
        $this->entityManager->flush();

        return [
            'draft' => $draft,
            'otpCode' => $otpCode,
        ];
    }

    public function findPendingDraftById(?int $draftId): ?RegistrationDraft
    {
        if ($draftId === null || $draftId <= 0) {
            return null;
        }

        $draft = $this->draftRepository->find($draftId);

        if (!$draft instanceof RegistrationDraft || $draft->getVerifiedAt() !== null) {
            return null;
        }

        return $draft;
    }

    public function save(RegistrationDraft $draft): void
    {
        $this->entityManager->persist($draft);
        $this->entityManager->flush();
    }

    public function reissueOtp(RegistrationDraft $draft): string
    {
        $otpCode = $this->otpService->issueOtp($draft, true);
        $this->save($draft);

        return $otpCode;
    }

    /**
     * Finalize a verified draft: create the User account.
     *
     * No Alumni record is created at this stage — the user must link
     * to a StudentRecord via the post-login modal.
     */
    public function finalizeManualDraft(RegistrationDraft $draft): User
    {
        $email = $draft->getEmail();

        // Double-check no user exists with this email
        if ($this->userRepository->findOneBy(['email' => $email]) !== null) {
            throw new RegistrationValidationException([
                'email' => 'This email address is already associated with an account.',
            ]);
        }

        $user = (new User())
            ->setEmail($email)
            ->setFirstName('Alumni')   // Placeholder — updated after student linking
            ->setLastName('User')       // Placeholder — updated after student linking
            ->setRoles([User::ROLE_ALUMNI])
            ->setAccountStatus('active')
            ->setNeedsStudentLink(true)
            ->setDpaConsent($draft->isDpaConsent())
            ->setDpaConsentDate($draft->isDpaConsent() ? new \DateTime() : null)
            ->setEmailVerifiedAt(new \DateTimeImmutable());

        $user->setPassword($draft->getPasswordHashTemp());

        $this->entityManager->persist($user);
        $this->entityManager->remove($draft);
        $this->entityManager->flush();

        return $user;
    }

    private function hashPasswordForDraft(string $email, string $plainPassword): string
    {
        $user = (new User())->setEmail($email);

        return $this->passwordHasher->hashPassword($user, $plainPassword);
    }
}
