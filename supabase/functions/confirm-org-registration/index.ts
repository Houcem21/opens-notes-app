import { handleOptions, jsonResponse } from "../_shared/responses.ts";
import { createServiceClient } from "../_shared/client.ts";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createCode(prefix: string) {
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 10);
  return `${prefix}-${random}`;
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
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return jsonResponse({ error: "Verification token is required" }, 400);
    }

    const supabase = createServiceClient();
    const tokenHash = await sha256(token);

    const { data: request, error: requestError } = await supabase
      .from("organization_registration_requests")
      .select("*")
      .eq("token_hash", tokenHash)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (requestError) throw requestError;

    if (!request) {
      return jsonResponse({ error: "Invalid or expired verification link." }, 400);
    }

    const accessCode = createCode("org");
    const adminCode = createCode("admin");

    const { data: organization, error: createError } = await supabase.rpc(
      "create_registered_organization",
      {
        org_name: request.organization_name,
        org_slug: request.organization_slug,
        access_code: accessCode,
        admin_code: adminCode,
      }
    );

    if (createError) throw createError;

    await supabase
      .from("organization_registration_requests")
      .update({
        status: "completed",
        created_organization_id: organization.id,
      })
      .eq("id", request.id);

    await sendEmail({
      to: request.email,
      subject: "Your organization is ready",
      html: `
        <h2>${organization.name} is ready</h2>
        <p>Your organization has been created.</p>

        <p><strong>Organization access code:</strong></p>
        <code>${accessCode}</code>

        <p><strong>Admin code:</strong></p>
        <code>${adminCode}</code>

        <p>Keep these codes safe. The admin code gives editing access.</p>
      `,
    });

    return jsonResponse({
      ok: true,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});