import { SurveyInvitationEmail } from "@/components/email/SurveyInvitationEmail";

/**
 * Preview page — visit /email-preview in the browser to see the email design.
 * This is a dev/admin tool, not shown in the public app.
 */
export default function EmailPreviewPage() {
  return (
    <SurveyInvitationEmail
      firstName="Genderson"
      lastName="Vergara"
      emailSubject="Graduate Tracer Survey Invitation"
      emailBody={`Good day!\n\nYou are invited to complete the Graduate Tracer Survey. Please log in using your alumni account and submit your response before the invitation expires.\n\nThank you.`}
      invitationUrl="http://localhost:3000/survey/invitations/SAMPLE-TOKEN-12345"
      expiresAt={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}
    />
  );
}
