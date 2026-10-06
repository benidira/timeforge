"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type Prompt = {
  id: string;
  ai_model: string;
  role: string;
  title: string;
  prompt_text: string;
  tags: string[];
  created_at: string;
};

export async function getPrompts(
  page: number = 1,
  limit: number = 20,
  search: string = "",
  aiFilter: string = "All",
  roleFilter: string = "All"
) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored if called from a Server Component
          }
        },
      },
    }
  );

  let query = supabase.from("prompts").select("*", { count: "exact" });

  if (aiFilter !== "All") {
    query = query.eq("ai_model", aiFilter);
  }

  if (roleFilter !== "All") {
    query = query.eq("role", roleFilter);
  }

  if (search.trim() !== "") {
    // using text search or simple ilike
    query = query.or(`title.ilike.%${search}%,prompt_text.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to).order("created_at", { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching prompts:", error);
    return { data: [] as Prompt[], count: 0, error: error.message };
  }

  return { data: data as Prompt[], count: count || 0, error: null };
}
