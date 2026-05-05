<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class SecurityController extends AbstractController
{
    #[Route(path: '/login', name: 'app_login')]
    public function login(Request $request, AuthenticationUtils $authenticationUtils): Response
    {
        $switchAccount = $request->query->getBoolean('switch_account');

        // If already logged in, redirect to dashboard
        if ($this->getUser() && !$switchAccount) {
            return $this->redirectToRoute('app_home');
        }

        // For API/JSON requests, return a JSON response
        if ($request->getPreferredFormat() === 'json' || str_contains((string) $request->headers->get('Accept', ''), 'application/json')) {
            return $this->json([
                'message' => 'Authentication required.',
            ], 401);
        }

        // For browser requests, redirect to the landing page (which has the login modal)
        return $this->redirect('http://localhost:3000/');
    }

    #[Route(path: '/logout', name: 'app_logout')]
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}
