<?php

namespace App\Service;

use App\Entity\AuditLog;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Service to log access to sensitive data for Data Privacy Act of 2012 compliance.
 */
class AuditLogger
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security,
        private RequestStack $requestStack,
    ) {}

    public function log(string $action, string $entityType, ?int $entityId = null, ?string $details = null): void
    {
        /** @var User|null $user */
        $user = $this->security->getUser();
        if (!$user) {
            return;
        }

        $log = new AuditLog();
        $log->setPerformedBy($user);
        $log->setAction($action);
        $log->setEntityType($entityType);
        $log->setEntityId($entityId);
        $log->setDetails($details);

        $request = $this->requestStack->getCurrentRequest();
        if ($request) {
            $log->setIpAddress($request->getClientIp());
        }

        $this->em->persist($log);
        $this->em->flush();
    }
}
