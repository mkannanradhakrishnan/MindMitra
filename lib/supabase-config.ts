const requiredVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

type RequiredVariable = (typeof requiredVariables)[number];

export function getSupabaseConfig() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const missing = [
    !rawUrl?.trim() ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !rawPublishableKey?.trim() ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" : null,
  ].filter((name): name is RequiredVariable => name !== null);

  if (missing.length > 0) {
    throw new Error(
      `MindMitra Supabase configuration is missing: ${missing.join(
        ", ",
      )}. Create .env.local at the project root, beside package.json, using .env.example as the template, then restart npm run dev.`,
    );
  }

  if (!rawUrl || !rawPublishableKey) {
    throw new Error(
      "MindMitra Supabase configuration is unavailable. Check the root .env.local file and restart npm run dev.",
    );
  }
  const url = rawUrl.trim();
  const publishableKey = rawPublishableKey.trim();

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname.endsWith(".supabase.co")) {
      throw new Error("invalid Supabase URL");
    }
  } catch {
    throw new Error(
      "MindMitra Supabase configuration is invalid: NEXT_PUBLIC_SUPABASE_URL must be an HTTPS Supabase project URL. Check the root .env.local file and restart npm run dev.",
    );
  }

  if (!publishableKey.startsWith("sb_publishable_") && !publishableKey.startsWith("eyJ")) {
    throw new Error(
      "MindMitra Supabase configuration is invalid: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be a Supabase publishable key (sb_publishable_...) or standard anon key (eyJ...). Check the environment variables and restart.",
    );
  }

  return { url, publishableKey };
}

export function getMissingSupabaseVariables(): RequiredVariable[] {
  return [
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
      ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
      : null,
  ].filter((name): name is RequiredVariable => name !== null);
}
