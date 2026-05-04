<?php

namespace App\Controller;

use App\Entity\Feedback;
use App\Form\FeedbackType;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/feedback')]
class FeedbackController extends AbstractController
{
    #[Route('/', name: 'feedback_index', methods: ['GET'])]
    public function index(Request $request, EntityManagerInterface $em): Response
    {
        $this->denyAccessUnlessGranted('ROLE_STAFF');

        $page  = max(1, $request->query->getInt('page', 1));
        $limit = 20;

        $qb = $em->getRepository(Feedback::class)->createQueryBuilder('f')
            ->orderBy('f.dateSubmitted', 'DESC');
        $qb->setFirstResult(($page - 1) * $limit)->setMaxResults($limit);
        $paginator = new Paginator($qb);
        $totalItems = count($paginator);
        $totalPages = (int) ceil($totalItems / $limit);

        return $this->render('feedback/index.html.twig', [
            'feedbacks' => $paginator,
            'currentPage' => $page,
            'totalPages'  => $totalPages,
        ]);
    }

    #[Route('/submit', name: 'feedback_submit', methods: ['GET', 'POST'])]
    public function submit(Request $request, EntityManagerInterface $em): Response
    {
        /** @var \App\Entity\User|null $user */
        $user = $this->getUser();
        $alumni = $user?->getAlumni();

        $feedback = new Feedback();
        if ($alumni) {
            $feedback->setAlumni($alumni);
        }

        $form = $this->createForm(FeedbackType::class, $feedback);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $em->persist($feedback);
            $em->flush();
            $this->addFlash('success', 'Thank you for your feedback!');

            return $this->redirectToRoute('app_home');
        }

        return $this->render('feedback/form.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    #[Route('/{id}', name: 'feedback_show', methods: ['GET'])]
    public function show(Feedback $feedback): Response
    {
        $this->denyAccessUnlessGranted('ROLE_STAFF');

        return $this->render('feedback/show.html.twig', [
            'feedback' => $feedback,
        ]);
    }

    #[Route('/{id}/delete', name: 'feedback_delete', methods: ['POST'])]
    public function delete(Feedback $feedback, Request $request, EntityManagerInterface $em): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        if ($this->isCsrfTokenValid('delete' . $feedback->getId(), $request->request->get('_token'))) {
            $em->remove($feedback);
            $em->flush();
            $this->addFlash('success', 'Feedback deleted.');
        }

        return $this->redirectToRoute('feedback_index');
    }

    #[Route('/export', name: 'feedback_export', methods: ['GET'])]
    public function export(EntityManagerInterface $em): StreamedResponse
    {
        $this->denyAccessUnlessGranted('ROLE_STAFF');

        $feedbacks = $em->getRepository(Feedback::class)->findBy([], ['dateSubmitted' => 'DESC']);

        $response = new StreamedResponse(function () use ($feedbacks) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Alumni', 'Suggestions', 'Recommend University', 'Date Submitted']);
            foreach ($feedbacks as $f) {
                fputcsv($handle, [
                    $f->getAlumni() ? $f->getAlumni()->getFullName() : 'Anonymous',
                    $f->getSuggestions(),
                    $f->isRecommendUniversity() ? 'Yes' : 'No',
                    $f->getDateSubmitted()?->format('Y-m-d'),
                ]);
            }
            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="feedback_' . date('Ymd') . '.csv"');

        return $response;
    }
}
