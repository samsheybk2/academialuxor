import { createBrowserClient } from "@supabase/ssr"

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    if (typeof window === "undefined") {
      return {
        auth: {
          onAuthStateChange: () => ({
            data: {
              subscription: {
                unsubscribe() {},
              },
            },
          }),
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
        },
        from: () => ({
          select: () => ({ data: null, error: null }),
          insert: () => ({ data: null, error: null }),
          update: () => ({ data: null, error: null }),
          delete: () => ({ data: null, error: null }),
        }),
      } as any
    }

    return createBrowserClient("https://placeholder.supabase.co", "placeholder")
  }

  return createBrowserClient(url, anonKey)
}
