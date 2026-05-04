<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        if ($user->getAccountStatus() === 'pending') {
            throw new CustomUserMessageAccountStatusException(
                'Your account is pending approval. Please wait for an administrator to activate it.'
            );
        }

        if ($user->getAccountStatus() === 'suspended') {
            throw new CustomUserMessageAccountStatusException(
                'Your account has been suspended. Please contact an administrator.'
            );
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
        // No post-auth checks needed
    }
}
