import { handleOptions, jsonResponse } from "../_shared/responses.ts";
import { createServiceClient } from "../_shared/client.ts";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createCode(prefix: string) {
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 10);
  return `${prefix}-${random}`;
}

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { organizationName } = await req.json();

    if (!organizationName || typeof organizationName !== "string") {
      return jsonResponse({ error: "Organization name is required" }, 400);
    }

    const supabase = createServiceClient();

    const baseSlug = slugify(organizationName);
    const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 4)}`;

    const accessCode = createCode("org");
    const adminCode = createCode("admin");

    const { data: organization, error } = await supabase.rpc(
      "create_registered_organization",
      {
        org_name: organizationName.trim(),
        org_slug: slug,
        access_code: accessCode,
        admin_code: adminCode,
      }
    );

    if (error) throw error;

    return jsonResponse({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      accessCode,
      adminCode,
    });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});