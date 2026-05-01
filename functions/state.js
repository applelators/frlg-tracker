// Cloudflare Pages Function — overlay state relay
// Binds to KV namespace: TRACKER_KV
// POST /state  — tracker pushes current state
// GET  /state  — overlay polls for current state

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      await env.TRACKER_KV.put('state', JSON.stringify(body));
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
  }

  if (request.method === 'GET') {
    const state = await env.TRACKER_KV.get('state');
    return new Response(state ?? 'null', {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405, headers: CORS });
}
