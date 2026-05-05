<?php

namespace App\Service;

use App\Entity\SurveyCampaign;
use App\Entity\SurveyInvitation;
use App\Entity\User;
use App\Repository\SurveyCampaignRepository;
use App\Repository\SurveyInvitationRepository;
use Doctrine\ORM\EntityManagerInterface;

class SurveyInvitationAssignmentService
{
    public function __construct(
        private SurveyCampaignRepository $campaignRepository,
        private SurveyInvitationRepository $invitationRepository,
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function assignForUser(User $user): int
    {
        if ($user->getAccountStatus() !== 'active') {
            return 0;
        }

        $alumni = $user->getAlumni();
        if ($alumni === null) {
            return 0;
        }

        $batchYear = $alumni->getYearGraduated();
        if ($batchYear === null) {
            return 0;
        }

        $campaigns = $this->campaignRepository->createQueryBuilder('c')
            ->andWhere('c.status IN (:statuses)')
            ->andWhere('c.targetGraduationYears LIKE :batchYearNeedle')
            ->setParameter('statuses', ['sending', 'sent'])
            ->setParameter('batchYearNeedle', '%"' . $batchYear . '"%')
            ->orderBy('c.createdAt', 'DESC')
            ->getQuery()
            ->getResult();

        if ($campaigns === []) {
            return 0;
        }

        $now = new \DateTimeImmutable();
        $createdCount = 0;

        foreach ($campaigns as $campaign) {
            if (!$campaign instanceof SurveyCampaign) {
                continue;
            }

            if (!$this->campaignMatchesAlumni($campaign->getTargetCollege(), $alumni->getCollege())) {
                continue;
            }

            if (!$this->campaignMatchesAlumni($campaign->getTargetCourse(), $alumni->getCourse())) {
                continue;
            }

            $existing = $this->invitationRepository->findOneBy([
                'campaign' => $campaign,
                'user' => $user,
            ]);

            if ($existing instanceof SurveyInvitation) {
                continue;
            }

            $sentAt = $campaign->getSentAt() ?? $campaign->getCreatedAt();
            $expiresAt = $sentAt->modify(sprintf('+%d days', max(1, $campaign->getExpiryDays())));

            if ($expiresAt < $now) {
                continue;
            }

            $invitation = (new SurveyInvitation())
                ->setCampaign($campaign)
                ->setUser($user)
                ->setStatus(SurveyInvitation::STATUS_ASSIGNED)
                ->setExpiresAt($expiresAt);

            $this->entityManager->persist($invitation);
            ++$createdCount;
        }

        if ($createdCount > 0) {
            $this->entityManager->flush();
        }

        return $createdCount;
    }

    private function campaignMatchesAlumni(?string $campaignFilter, ?string $alumniValue): bool
    {
        if ($campaignFilter === null || trim($campaignFilter) === '') {
            return true;
        }

        if ($alumniValue === null || trim($alumniValue) === '') {
            return false;
        }

        return mb_stripos($alumniValue, $campaignFilter) !== false;
    }
}
