<?php

namespace App\Controller;

use App\Entity\ResetPasswordToken;
use App\Repository\ResetPasswordTokenRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class ForgotPasswordController extends AbstractController
{
    private const TOKEN_LIFETIME_HOURS = 1;

    #[Route('/forgot-password', name: 'app_forgot_password', methods: ['GET', 'POST'])]
    public function request(
        Request $request,
        UserRepository $userRepository,
        ResetPasswordTokenRepository $tokenRepository,
        EntityManagerInterface $em,
        MailerInterface $mailer,
    ): Response {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }

        if ($request->isMethod('POST')) {
            if (!$this->isCsrfTokenValid('forgot_password', $request->request->get('_csrf_token'))) {
                $this->addFlash('danger', 'Invalid request. Please try again.');
                return $this->redirectToRoute('app_forgot_password');
            }

            $email = trim((string) $request->request->get('email'));

            // Always redirect to check-email to prevent user enumeration
            $user = $userRepository->findOneBy(['email' => $email]);
            if ($user) {
                // Remove any existing tokens for this user
                $tokenRepository->removeExistingTokensForUser($user);

                // Clean up expired tokens
                $tokenRepository->removeExpiredTokens();

                // Generate a secure token
                $plainToken = bin2hex(random_bytes(32));
                $hashedToken = hash('sha256', $plainToken);

                $expiresAt = new \DateTimeImmutable(sprintf('+%d hours', self::TOKEN_LIFETIME_HOURS));
                $resetToken = new ResetPasswordToken($user, $hashedToken, $expiresAt);

                $em->persist($resetToken);
                $em->flush();

                // Build reset URL
                $resetUrl = $this->generateUrl('app_reset_password', [
                    'token' => $plainToken,
                ], UrlGeneratorInterface::ABSOLUTE_URL);

                // Send email
                $emailMessage = (new Email())
                    ->to($user->getEmail())
                    ->subject('NORSU Alumni Tracker - Password Reset')
                    ->html($this->renderView('security/reset_password_email.html.twig', [
                        'resetUrl' => $resetUrl,
                        'user' => $user,
                        'tokenLifetime' => self::TOKEN_LIFETIME_HOURS,
                    ]));

                $mailer->send($emailMessage);
            }

            return $this->redirectToRoute('app_check_email');
        }

        return $this->render('security/forgot_password_request.html.twig');
    }

    #[Route('/forgot-password/check-email', name: 'app_check_email', methods: ['GET'])]
    public function checkEmail(): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }

        return $this->render('security/check_email.html.twig');
    }

    #[Route('/reset-password/{token}', name: 'app_reset_password', methods: ['GET', 'POST'])]
    public function reset(
        string $token,
        Request $request,
        ResetPasswordTokenRepository $tokenRepository,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em,
    ): Response {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }

        $hashedToken = hash('sha256', $token);
        $resetToken = $tokenRepository->findOneBy(['hashedToken' => $hashedToken]);

        if (!$resetToken || $resetToken->isExpired()) {
            $this->addFlash('danger', 'This password reset link is invalid or has expired. Please request a new one.');
            return $this->redirectToRoute('app_forgot_password');
        }

        if ($request->isMethod('POST')) {
            if (!$this->isCsrfTokenValid('reset_password', $request->request->get('_csrf_token'))) {
                $this->addFlash('danger', 'Invalid request. Please try again.');
                return $this->redirectToRoute('app_reset_password', ['token' => $token]);
            }

            $password = $request->request->get('password', '');
            $confirmPassword = $request->request->get('confirm_password', '');

            if (strlen($password) < 8) {
                $this->addFlash('danger', 'Password must be at least 8 characters.');
                return $this->redirectToRoute('app_reset_password', ['token' => $token]);
            }

            if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $password)) {
                $this->addFlash('danger', 'Password must include uppercase, lowercase, number, and special character.');
                return $this->redirectToRoute('app_reset_password', ['token' => $token]);
            }

            if ($password !== $confirmPassword) {
                $this->addFlash('danger', 'Passwords do not match.');
                return $this->redirectToRoute('app_reset_password', ['token' => $token]);
            }

            $user = $resetToken->getUser();
            $user->setPassword($passwordHasher->hashPassword($user, $password));

            // Remove all tokens for this user
            $tokenRepository->removeExistingTokensForUser($user);

            $em->flush();

            $this->addFlash('success', 'Your password has been reset successfully. You can now sign in.');
            return $this->redirectToRoute('app_login');
        }

        return $this->render('security/reset_password.html.twig', [
            'token' => $token,
        ]);
    }
}
