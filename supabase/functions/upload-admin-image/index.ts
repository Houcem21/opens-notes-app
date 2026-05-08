import { handleOptions, jsonResponse } from "../_shared/responses.ts";
import { createServiceClient } from "../_shared/client.ts";
import { getValidSession } from "../_shared/sessions.ts";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() || "bin";
}

Deno.serve(async (req) => {
  const optionsResponse = handleOptions(req);
  if (optionsResponse) return optionsResponse;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const formData = await req.formData();

    const adminToken = formData.get("adminToken");
    const file = formData.get("file");

    if (!adminToken || typeof adminToken !== "string") {
      return jsonResponse({ error: "Admin token is required" }, 400);
    }

    if (!(file instanceof File)) {
      return jsonResponse({ error: "Image file is required" }, 400);
    }

    if (!file.type.startsWith("image/")) {
      return jsonResponse({ error: "Only image files are allowed" }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonResponse({ error: "Image must be smaller than 2MB" }, 400);
    }

    const supabase = createServiceClient();
    const session = await getValidSession(supabase, adminToken, "admin");

    const extension = getExtension(file.name);
    const path = `${session.organization_id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("post-images").getPublicUrl(path);

    return jsonResponse({
      url: data.publicUrl,
      path,
    });
  } catch (err) {
    return jsonResponse({ error: err.message || "Unexpected error" }, 500);
  }
});