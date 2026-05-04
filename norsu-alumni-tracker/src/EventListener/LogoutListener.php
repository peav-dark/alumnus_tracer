<?php

namespace App\EventListener;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Security\Http\Event\LogoutEvent;

#[AsEventListener(event: LogoutEvent::class)]
class LogoutListener
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function __invoke(LogoutEvent $event): void
    {
        $token = $event->getToken();
        if ($token === null) {
            return;
        }

        $user = $token->getUser();

        if (!$user instanceof User) {
            return;
        }

        // Update last activity timestamp on logout (do NOT change accountStatus)
        $user->setLastActivity(new \DateTime());
        $this->em->flush();
    }
}
