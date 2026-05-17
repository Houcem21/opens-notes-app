import { handleOptions, jsonResponse } from "../_shared/responses.ts";
import { createServiceClient } from "../_shared/client.ts";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sendEmail({ to, subject, html }: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("FROM_EMAIL");

  if (!apiKey || !from) {
    throw new Error("Email service is not configured.");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to send email.");
  }
}

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { email, organizationName } = await req.json();

    if (!email || typeof email !== "string") {
      return jsonResponse({ error: "Email is required" }, 400);
    }

    if (!organizationName || typeof organizationName !== "string") {
      return jsonResponse({ error: "Organization name is required" }, 400);
    }

    const siteUrl = Deno.env.get("SITE_URL");
    if (!siteUrl) throw new Error("SITE_URL is not configured.");

    const supabase = createServiceClient();

    const slug = slugify(organizationName);
    const token = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = await sha256(token);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

    const { error } = await supabase
      .from("organization_registration_requests")
      .insert({
        email: email.trim().toLowerCase(),
        organization_name: organizationName.trim(),
        organization_slug: slug,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (error) throw error;

    const verifyUrl = `${siteUrl}/register/confirm?token=${encodeURIComponent(token)}`;

    await sendEmail({
      to: email.trim().toLowerCase(),
      subject: "Verify your organization registration",
      html: `
        <h2>Verify your organization</h2>
        <p>Click the link below to create your organization.</p>
        <p><a href="${verifyUrl}">Verify and create organization</a></p>
        <p>This link expires in 30 minutes.</p>
      `,
    });

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});