<?php

namespace App\EventListener;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * On every request, update the current user's lastActivity timestamp.
 * accountStatus is managed only by admin actions (approve/suspend), NOT by presence tracking.
 */
#[AsEventListener(event: KernelEvents::TERMINATE, priority: -10)]
class ActivityListener
{
    public function __construct(
        private Security $security,
        private EntityManagerInterface $em,
    ) {}

    public function __invoke(\Symfony\Component\HttpKernel\Event\TerminateEvent $event): void
    {
        $user = $this->security->getUser();

        if (!$user instanceof User) {
            return;
        }

        if (!$this->em->isOpen() || !$this->em->contains($user)) {
            return;
        }

        // Throttle: only update if last activity was more than 5 minutes ago
        $last = $user->getLastActivity();
        if ($last instanceof \DateTimeInterface && (time() - $last->getTimestamp()) < 300) {
            return;
        }

        // Only update lastActivity timestamp — do NOT touch accountStatus
        $user->setLastActivity(new \DateTime());

        try {
            $this->em->flush();
        } catch (\Throwable) {
            // Ignore terminate-time persistence errors to avoid masking the original response.
        }
    }
}
