<?php

namespace App\Controller;

use App\Entity\AuditLog;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\AuditLogger;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/verification')]
#[IsGranted('ROLE_STAFF')]
class VerificationController extends AbstractController
{
    public function __construct(private AuditLogger $audit, private NotificationService $notifier) {}

    /**
     * Lists all pending registrants awaiting verification.
     */
    #[Route('/', name: 'admin_verification', methods: ['GET'])]
    public function index(Request $request, UserRepository $repo): Response
    {
        $search = $request->query->get('q', '');

        if ($search !== '') {
            $qb = $repo->createQueryBuilder('u')
                ->andWhere('u.firstName LIKE :q OR u.lastName LIKE :q OR u.email LIKE :q')
                ->setParameter('q', '%' . $search . '%');

            $pendingQb = clone $qb;
            $approvedQb = clone $qb;
            $deniedQb = clone $qb;

            $pending = $pendingQb->andWhere('u.accountStatus = :s')->setParameter('s', 'pending')
                ->orderBy('u.dateRegistered', 'DESC')->getQuery()->getResult();
            $approved = $approvedQb->andWhere('u.accountStatus = :s')->setParameter('s', 'active')
                ->orderBy('u.dateRegistered', 'DESC')->setMaxResults(10)->getQuery()->getResult();
            $denied = $deniedQb->andWhere('u.accountStatus = :s')->setParameter('s', 'inactive')
                ->orderBy('u.dateRegistered', 'DESC')->setMaxResults(10)->getQuery()->getResult();
        } else {
            $pending  = $repo->findBy(['accountStatus' => 'pending'], ['dateRegistered' => 'DESC']);
            $approved = $repo->findBy(['accountStatus' => 'active'], ['dateRegistered' => 'DESC'], 10);
            $denied   = $repo->findBy(['accountStatus' => 'inactive'], ['dateRegistered' => 'DESC'], 10);
        }

        return $this->render('admin/verification.html.twig', [
            'pending'  => $pending,
            'approved' => $approved,
            'denied'   => $denied,
            'pendingCount'  => count($pending),
            'approvedCount' => $repo->count(['accountStatus' => 'active']),
            'deniedCount'   => $repo->count(['accountStatus' => 'inactive']),
            'search' => $search,
        ]);
    }

    /**
     * Approve a pending registrant.
     */
    #[Route('/{id}/approve', name: 'admin_verification_approve', methods: ['POST'])]
    public function approve(User $user, Request $request, EntityManagerInterface $em): Response
    {
        if ($this->isCsrfTokenValid('verify' . $user->getId(), $request->request->get('_token'))) {
            $user->setAccountStatus('active');
            $em->flush();

            $this->audit->log(
                AuditLog::ACTION_APPROVE_USER,
                'User',
                $user->getId(),
                'Approved registration for ' . $user->getFullName() . ' (' . $user->getEmail() . ')'
            );

            try {
                $this->notifier->notifyAccountApproved($user);
            } catch (\Throwable) {}

            $this->addFlash('success', $user->getFullName() . ' has been approved and is now active.');
        }

        return $this->redirectToRoute('admin_verification');
    }

    /**
     * Deny/reject a pending registrant.
     */
    #[Route('/{id}/deny', name: 'admin_verification_deny', methods: ['POST'])]
    public function deny(User $user, Request $request, EntityManagerInterface $em): Response
    {
        if ($this->isCsrfTokenValid('verify' . $user->getId(), $request->request->get('_token'))) {
            $user->setAccountStatus('inactive');
            $em->flush();

            $this->audit->log(
                AuditLog::ACTION_DENY_USER,
                'User',
                $user->getId(),
                'Denied registration for ' . $user->getFullName() . ' (' . $user->getEmail() . ')'
            );

            try {
                $this->notifier->notifyAccountDenied($user);
            } catch (\Throwable) {}

            $this->addFlash('warning', $user->getFullName() . ' has been denied.');
        }

        return $this->redirectToRoute('admin_verification');
    }

    /**
     * Bulk approve all pending registrants.
     */
    #[Route('/bulk-approve', name: 'admin_verification_bulk_approve', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function bulkApprove(Request $request, UserRepository $repo, EntityManagerInterface $em): Response
    {
        if ($this->isCsrfTokenValid('bulk_approve', $request->request->get('_token'))) {
            $pending = $repo->findBy(['accountStatus' => 'pending']);
            $count = 0;
            foreach ($pending as $user) {
                $user->setAccountStatus('active');
                $count++;
            }
            $em->flush();

            $this->audit->log(
                AuditLog::ACTION_APPROVE_USER,
                'User',
                null,
                'Bulk approved ' . $count . ' pending registrations'
            );

            $this->addFlash('success', $count . ' pending registration(s) approved.');
        }

        return $this->redirectToRoute('admin_verification');
    }

    /**
     * Export all registrants as CSV.
     */
    #[Route('/export', name: 'admin_verification_export', methods: ['GET'])]
    public function export(UserRepository $repo): StreamedResponse
    {
        $users = $repo->findBy([], ['dateRegistered' => 'DESC']);

        $response = new StreamedResponse(function () use ($users) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Name', 'Email', 'Status', 'Date Registered']);
            foreach ($users as $u) {
                fputcsv($handle, [
                    $u->getFullName(),
                    $u->getEmail(),
                    $u->getAccountStatus(),
                    $u->getDateRegistered()?->format('Y-m-d H:i'),
                ]);
            }
            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="verification_registrants_' . date('Ymd') . '.csv"');

        return $response;
    }
}
