<?php

namespace App\MessageHandler;

use App\Entity\Notification;
use App\Entity\SurveyInvitation;
use App\Message\SendSurveyInvitationBatchMessage;
use App\Repository\SurveyCampaignRepository;
use App\Repository\SurveyInvitationRepository;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
<<<<<<< HEAD
=======
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mime\Address;
>>>>>>> f177e4c3d6fc13bd04615706178b5f29b105da89
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

#[AsMessageHandler]
final class SendSurveyInvitationBatchMessageHandler
{
    public function __construct(
        private MailerInterface $mailer,
        private SurveyCampaignRepository $campaignRepository,
        private SurveyInvitationRepository $invitationRepository,
        private EntityManagerInterface $entityManager,
        private NotificationService $notificationService,
    ) {
    }

    public function __invoke(SendSurveyInvitationBatchMessage $message): void
    {
        $campaign = $this->campaignRepository->find($message->getCampaignId());
        if ($campaign === null) {
            return;
        }

        $baseUrl = rtrim($this->resolveFrontendBaseUrl($message->getBaseUrl()), '/');
        $targetBatchYear = $campaign->getTargetBatchYear();
        $failedCount = 0;
        $sentCount = 0;

        foreach ($message->getInvitationIds() as $invitationId) {
            $invitation = $this->invitationRepository->find($invitationId);
            if (!$invitation instanceof SurveyInvitation) {
                ++$failedCount;
                continue;
            }

            if ($invitation->getStatus() !== SurveyInvitation::STATUS_QUEUED) {
                continue;
            }

            $recipient = $invitation->getUser();
            $alumni = $recipient->getAlumni();
            if ($targetBatchYear === null || $alumni === null || $alumni->getYearGraduated() !== $targetBatchYear) {
                $invitation
                    ->setStatus(SurveyInvitation::STATUS_FAILED)
                    ->setFailedAt(new \DateTimeImmutable())
                    ->setFailureReason('Recipient batch does not match the campaign target batch.');
                ++$failedCount;
                continue;
            }

            $emailAddress = trim((string) ($alumni?->getEmailAddress() ?: $recipient->getEmail()));
            if ($emailAddress === '') {
                $invitation
                    ->setStatus(SurveyInvitation::STATUS_FAILED)
                    ->setFailedAt(new \DateTimeImmutable())
                    ->setFailureReason('Recipient email is missing.');
                ++$failedCount;
                continue;
            }

            try {
<<<<<<< HEAD
                $invitationUrl = $baseUrl . '/survey/invitations/' . $invitation->getToken();

                $htmlBody = $this->renderEmailHtml([
                    'firstName'     => $recipient->getFirstName() ?? $alumni?->getFullName() ?? '',
                    'lastName'      => $recipient->getLastName() ?? '',
                    'emailBody'     => $campaign->getEmailBody(),
                    'emailSubject'  => $campaign->getEmailSubject(),
                    'invitationUrl' => $invitationUrl,
                    'expiresAt'     => $invitation->getExpiresAt()?->format(\DateTimeInterface::ATOM),
                ], $baseUrl);

                $email = (new Email())
                    ->to(new Address($emailAddress, $alumni?->getFullName() ?: $recipient->getFullName()))
                    ->subject($campaign->getEmailSubject())
                    ->html($htmlBody)
                    ->text($this->renderEmailText($campaign->getEmailBody(), $invitationUrl, $invitation->getExpiresAt()));
=======
                $email = (new TemplatedEmail())
                    ->to(new Address($emailAddress, $alumni?->getFullName() ?: $recipient->getFullName()))
                    ->subject($campaign->getEmailSubject())
                    ->htmlTemplate('emails/survey_invitation.html.twig')
                    ->textTemplate('emails/survey_invitation.txt.twig')
                    ->context([
                        'campaign' => $campaign,
                        'invitation' => $invitation,
                        'invitationUrl' => $baseUrl . '/survey/invitations/' . $invitation->getToken(),
                    ]);
>>>>>>> f177e4c3d6fc13bd04615706178b5f29b105da89

                $this->mailer->send($email);

                $invitation
                    ->setStatus(SurveyInvitation::STATUS_SENT)
                    ->setSentAt(new \DateTimeImmutable())
                    ->setFailedAt(null)
                    ->setFailureReason(null);
                ++$sentCount;
            } catch (\Throwable $exception) {
                $invitation
                    ->setStatus(SurveyInvitation::STATUS_FAILED)
                    ->setFailedAt(new \DateTimeImmutable())
                    ->setFailureReason(substr($exception->getMessage(), 0, 1000));
                ++$failedCount;
            }
        }

        // Flush invitation changes before potentially updating campaign state.
        $this->entityManager->flush();

        if ($this->invitationRepository->countByCampaignAndStatus($campaign, SurveyInvitation::STATUS_QUEUED) === 0) {
            $campaign->setStatus('sent');
            if ($campaign->getSentAt() === null) {
                $campaign->setSentAt(new \DateTimeImmutable());
            }
            $this->entityManager->flush();

            $this->notificationService->createAdminNotification(
                'gts.campaign_sent',
                'GTS campaign sent',
                sprintf('%s finished sending to %d alumni.', $campaign->getName(), $sentCount),
                Notification::SEVERITY_SUCCESS,
                '/gts/campaigns',
                'SurveyCampaign',
                $campaign->getId(),
                actor: null,
                excludeActor: false,
            );
        }

        if ($failedCount > 0) {
            $this->notificationService->createAdminNotification(
                'gts.campaign_send_failed',
                'GTS campaign send failure',
                sprintf('%s had %d invitation failure(s).', $campaign->getName(), $failedCount),
                Notification::SEVERITY_DANGER,
                '/gts/campaigns',
                'SurveyCampaign',
                $campaign->getId(),
                actor: null,
                excludeActor: false,
            );
        }
    }

    private function resolveFrontendBaseUrl(string $fallbackBaseUrl): string
    {
        $configuredUrl = trim((string) ($_ENV['FRONTEND_URL'] ?? $_SERVER['FRONTEND_URL'] ?? ''));

        return $configuredUrl !== '' ? $configuredUrl : $fallbackBaseUrl;
    }
<<<<<<< HEAD

    /**
     * Calls the Next.js /api/email/survey-invitation endpoint to get
     * a fully rendered, branded HTML email string.
     * Calls the Next.js /api/email/survey-invitation endpoint.
     * Falls back to plain inline HTML if Next.js is unreachable.
     *
     * @param array<string,string|null> $data
     */
    private function renderEmailHtml(array $data, string $baseUrl): string
    {
        $frontendUrl = trim((string) ($_ENV['FRONTEND_URL'] ?? $_SERVER['FRONTEND_URL'] ?? $baseUrl));
        $renderUrl   = rtrim($frontendUrl, '/') . '/api/email/survey-invitation';

        // Strip surrounding quotes that dotenv may leave in the raw value.
        $rawSecret = (string) ($_ENV['EMAIL_RENDER_SECRET'] ?? $_SERVER['EMAIL_RENDER_SECRET'] ?? '');
        $secret    = trim($rawSecret, " \t\n\r\0\x0B\"'");

        $payload = $data;
        if ($secret !== '') {
            $payload['secret'] = $secret;
        }

        try {
            $ch = curl_init($renderUrl);
            curl_setopt_array($ch, [
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => json_encode($payload, JSON_THROW_ON_ERROR),
                CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 10,
                CURLOPT_CONNECTTIMEOUT => 5,
            ]);

            $response   = curl_exec($ch);
            $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError  = curl_error($ch);
            curl_close($ch);

            if ($curlError !== '') {
                throw new \RuntimeException("cURL error: $curlError");
            }

            if ($statusCode === 200 && is_string($response)) {
                $json = json_decode($response, true);
                if (is_array($json) && isset($json['html']) && is_string($json['html'])) {
                    return $json['html'];
                }
            }
        } catch (\Throwable) {
            // Fall through to inline fallback below.
        }

        // Inline fallback — used only if Next.js is unreachable.
        $fn  = htmlspecialchars($data['firstName'] ?? '', ENT_QUOTES);
        $ln  = htmlspecialchars($data['lastName'] ?? '', ENT_QUOTES);
        $body = nl2br(htmlspecialchars($data['emailBody'] ?? '', ENT_QUOTES));
        $url  = htmlspecialchars($data['invitationUrl'] ?? '', ENT_QUOTES);

        return <<<HTML
<!DOCTYPE html><html lang="en"><body style="font-family:Arial,sans-serif;background:#f0f4f8;padding:40px 16px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:#1c3fb7;padding:32px 40px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.65);">Negros Oriental State University</p>
    <h1 style="margin:8px 0 4px;font-size:24px;color:#fff;font-weight:800;">Graduate Tracer Survey</h1>
    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.75);">Survey Invitation for NORSU Alumni</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="margin:0 0 24px;font-size:20px;font-weight:700;color:#1e293b;">Hello, {$fn} {$ln}</p>
    <div style="font-size:15px;line-height:1.8;color:#374151;">{$body}</div>
    <div style="text-align:center;margin:28px 0;">
      <a href="{$url}" style="display:inline-block;background:#1c3fb7;color:#fff;text-decoration:none;padding:15px 40px;border-radius:8px;font-size:15px;font-weight:700;">Open Survey Invitation &rarr;</a>
    </div>
    <p style="font-size:12px;text-align:center;word-break:break-all;"><a href="{$url}" style="color:#1c3fb7;">{$url}</a></p>
  </div>
  <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">NORSU Alumni Tracker · Please do not reply to this email.</p>
  </div>
</div></body></html>
HTML;
    }

    private function renderEmailText(string $emailBody, string $invitationUrl, ?\DateTimeInterface $expiresAt): string

    {
        $lines = [
            strip_tags($emailBody),
            '',
            'Open your survey invitation here:',
            $invitationUrl,
        ];

        if ($expiresAt !== null) {
            $lines[] = '';
            $lines[] = 'This invitation expires on ' . $expiresAt->format('F d, Y') . ' at ' . $expiresAt->format('h:i A') . '.';
        }

        $lines[] = '';
        $lines[] = 'This is a NORSU Alumni Tracker survey invitation for your alumni account.';

        return implode("\n", $lines);
    }
=======
>>>>>>> f177e4c3d6fc13bd04615706178b5f29b105da89
}
