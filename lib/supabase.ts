import { createBrowserClient } from '@supabase/ssr';
import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase-config";

export function supabaseBrowser(): SupabaseClient {
  const { url, publishableKey } = getSupabaseConfig();
	return createBrowserClient<Database>(
		url,
		publishableKey,
		{ auth: { flowType: "pkce", autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } },
	) as unknown as SupabaseClient;
}
