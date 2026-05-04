export type SurveyInvitationEmailProps = {
  firstName: string;
  lastName: string;
  emailBody: string;
  emailSubject: string;
  invitationUrl: string;
  expiresAt?: string | null;
};

export function SurveyInvitationEmail({
  firstName,
  lastName,
  emailBody,
  invitationUrl,
  expiresAt,
}: SurveyInvitationEmailProps) {
  const bodyLines = emailBody
    .split("\n")
    .map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));

  const expiryLabel = expiresAt
    ? new Date(expiresAt).toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>NORSU Survey Invitation</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f0f4f8", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

        {/* Outer wrapper */}
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#f0f4f8", padding: "40px 16px" }}>
          <tbody>
            <tr>
              <td align="center">

                {/* Card */}
                <table width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 600, backgroundColor: "#ffffff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>
                  <tbody>

                    {/* Header */}
                    <tr>
                      <td style={{ backgroundColor: "#1c3fb7", padding: "36px 40px 30px", textAlign: "center" }}>
                        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.65)" }}>
                          Negros Oriental State University
                        </p>
                        <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: "#ffffff", lineHeight: 1.3 }}>
                          Graduate Tracer Survey
                        </h1>
                        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                          Survey Invitation for NORSU Alumni
                        </p>
                      </td>
                    </tr>

                    {/* Accent bar */}
                    <tr>
                      <td style={{ height: 4, backgroundColor: "#5475e5" }} />
                    </tr>

                    {/* Body */}
                    <tr>
                      <td style={{ padding: "36px 40px 24px" }}>
                        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>
                          Hello,
                        </p>
                        <p style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 700, color: "#1e293b" }}>
                          {firstName} {lastName}
                        </p>

                        <div style={{ fontSize: 15, lineHeight: 1.8, color: "#374151" }}>
                          {bodyLines}
                        </div>

                        {/* Divider */}
                        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "28px 0" }} />

                        {/* CTA */}
                        <table cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td align="center" style={{ paddingBottom: 24 }}>
                                <a
                                  href={invitationUrl}
                                  style={{
                                    display: "inline-block",
                                    backgroundColor: "#1c3fb7",
                                    color: "#ffffff",
                                    textDecoration: "none",
                                    padding: "15px 40px",
                                    borderRadius: 8,
                                    fontSize: 15,
                                    fontWeight: 700,
                                    letterSpacing: "0.3px",
                                  }}
                                >
                                  Open Survey Invitation →
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Fallback link */}
                        <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", margin: "0 0 6px" }}>
                          If the button does not work, copy and paste this link into your browser:
                        </p>
                        <p style={{ fontSize: 12, textAlign: "center", margin: 0, wordBreak: "break-all" }}>
                          <a href={invitationUrl} style={{ color: "#1c3fb7", textDecoration: "underline" }}>
                            {invitationUrl}
                          </a>
                        </p>
                      </td>
                    </tr>

                    {/* Expiry notice */}
                    {expiryLabel && (
                      <tr>
                        <td style={{ padding: "0 40px 24px" }}>
                          <table cellPadding={0} cellSpacing={0} width="100%">
                            <tbody>
                              <tr>
                                <td style={{ backgroundColor: "#fefce8", border: "1px solid #fde047", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#854d0e" }}>
                                  ⚠️ &nbsp;This invitation expires on <strong>{expiryLabel}</strong>. Please complete the survey before the deadline.
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* Footer */}
                    <tr>
                      <td style={{ backgroundColor: "#f8fafc", borderTop: "1px solid #e5e7eb", padding: "24px 40px", textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                          NORSU Alumni Tracker
                        </p>
                        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>
                          This email was sent to your registered alumni account as part of the<br />
                          NORSU Graduate Tracer Study. Please do not reply to this email.
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: "#d1d5db" }}>
                          © {new Date().getFullYear()} Negros Oriental State University · All rights reserved
                        </p>
                      </td>
                    </tr>

                  </tbody>
                </table>

              </td>
            </tr>
          </tbody>
        </table>

      </body>
    </html>
  );
}
