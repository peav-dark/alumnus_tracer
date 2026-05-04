<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Http\Authorization\AccessDeniedHandlerInterface;

class AccessDeniedHandler implements AccessDeniedHandlerInterface
{
    public function __construct(
        private UrlGeneratorInterface $urlGenerator,
        private AuthorizationCheckerInterface $authorizationChecker,
    ) {
    }

    public function handle(Request $request, AccessDeniedException $accessDeniedException): ?Response
    {
        $targetRoute = 'app_home';

        if ($this->authorizationChecker->isGranted('ROLE_STAFF')) {
            $targetRoute = 'staff_dashboard';
        }

        if (!$this->authorizationChecker->isGranted('IS_AUTHENTICATED_FULLY')) {
            return new RedirectResponse($this->urlGenerator->generate('app_login'));
        }

        return new RedirectResponse($this->urlGenerator->generate($targetRoute));
    }
}
