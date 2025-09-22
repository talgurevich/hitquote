export async function GET() {
  return new Response(JSON.stringify({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    node_env: process.env.NODE_ENV,
    nextauth_url: process.env.NEXTAUTH_URL
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}