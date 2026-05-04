<?php

namespace App\EventListener;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;

#[AsEventListener(event: 'security.interactive_login')]
class LoginListener
{
    public function __construct(
        private EntityManagerInterface $em,
    ) {}

    public function __invoke(InteractiveLoginEvent $event): void
    {
        $user = $event->getAuthenticationToken()->getUser();

        if (!$user instanceof User) {
            return;
        }

        // Record last login timestamp (do NOT auto-activate pending accounts)
        $user->setLastLogin(new \DateTime());

        $this->em->flush();
    }
}
