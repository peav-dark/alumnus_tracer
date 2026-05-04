import { SurveyInvitationEmail } from "@/components/email/SurveyInvitationEmail";
import { NextResponse } from "next/server";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * POST /api/email/survey-invitation
 *
 * Called by the PHP backend to get a rendered HTML email.
 *
 * Body:
 * {
 *   firstName:     string
 *   lastName:      string
 *   emailBody:     string   (plain-text body written by admin in campaign)
 *   emailSubject:  string
 *   invitationUrl: string
 *   expiresAt?:    string   (ISO 8601 date string, optional)
 *   secret:        string   (must match EMAIL_RENDER_SECRET env var)
 * }
 *
 * Returns: { html: string }
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    firstName?: string;
    lastName?: string;
    emailBody?: string;
    emailSubject?: string;
    invitationUrl?: string;
    expiresAt?: string | null;
    secret?: string;
  } | null;

  // Simple shared-secret guard so only the backend can call this endpoint.
  const expectedSecret = process.env.EMAIL_RENDER_SECRET;
  if (expectedSecret && body?.secret !== expectedSecret) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  if (!body?.firstName || !body?.invitationUrl || !body?.emailBody) {
    return NextResponse.json(
      { message: "firstName, emailBody, and invitationUrl are required." },
      { status: 422 },
    );
  }

  const html = renderToStaticMarkup(
    SurveyInvitationEmail({
      firstName: body.firstName,
      lastName: body.lastName ?? "",
      emailBody: body.emailBody,
      emailSubject: body.emailSubject ?? "Survey Invitation",
      invitationUrl: body.invitationUrl,
      expiresAt: body.expiresAt ?? null,
    }),
  );

  return NextResponse.json({ html: `<!DOCTYPE html>${html}` });
}
