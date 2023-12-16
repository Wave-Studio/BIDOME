import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
export * from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { Database } from "../assets/db/database.types.ts";
export type { Database };

export const supabase = createClient<Database>(
	Deno.env.get("PROJECT_URL")!,
	Deno.env.get("SERVICE_ROLE_KEY")!,
);
