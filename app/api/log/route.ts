export async function POST(req: Request) {
  const body = await req.json();
  console.log('[Client Log]', body);
  return new Response('Logged', { status: 200 });
}
