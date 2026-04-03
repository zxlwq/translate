export async function onRequestGet(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const password = url.searchParams.get('password');

  if (password !== env.PASSWORD) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { results } = await env.DB.prepare('SELECT * FROM prompts ORDER BY created_at DESC').all();
    return Response.json(results);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function onRequestPost(context: any) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { source_text, target_text, model, provider } = body;

    await env.DB.prepare(
      'INSERT INTO prompts (source_text, target_text, model, provider) VALUES (?, ?, ?, ?)'
    ).bind(source_text, target_text, model, provider).run();

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function onRequestDelete(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const password = url.searchParams.get('password');

  if (password !== env.PASSWORD) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await env.DB.prepare('DELETE FROM prompts WHERE id = ?').bind(id).run();
    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
