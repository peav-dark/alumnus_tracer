<?php

namespace App\Controller;

use App\Repository\AlumniRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class DashboardController extends AbstractController
{
    #[Route('/dashboard', name: 'app_dashboard')]
    public function index(AlumniRepository $alumniRepository): Response
    {
        $employmentLabelsJson = json_encode([]);
        $employmentDataJson = json_encode([]);

        if ($this->isGranted('ROLE_STAFF') || $this->isGranted('ROLE_ADMIN')) {
            $employmentStats = $alumniRepository->getEmploymentStats();
            $employmentLabelsJson = json_encode(array_keys($employmentStats));
            $employmentDataJson = json_encode(array_values($employmentStats));
        }

        return $this->render('dashboard/index.html.twig', [
            'employmentLabelsJson' => $employmentLabelsJson,
            'employmentDataJson' => $employmentDataJson,
            'canViewEmploymentStats' => $this->isGranted('ROLE_STAFF') || $this->isGranted('ROLE_ADMIN'),
        ]);
    }
}
