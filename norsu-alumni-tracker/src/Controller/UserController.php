<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/users')]
class UserController extends AbstractController
{
    #[Route('', name: 'user_index', methods: ['GET'])]
    public function index(): Response
    {
        if ($this->isGranted('ROLE_ADMIN')) {
            return $this->redirectToRoute('admin_users');
        }

        if ($this->isGranted('ROLE_STAFF')) {
            $this->addFlash('warning', 'Manage Users is for Admin accounts only.');
            return $this->redirectToRoute('staff_dashboard');
        }

        $this->addFlash('warning', 'Manage Users is for Admin accounts only.');
        return $this->redirectToRoute('app_home');
    }
}
