export async function onRequestPost(context: any) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { provider, model, sourceText, systemInstruction, stream = true } = body;

    if (provider === 'gemini') {
      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
      
      const url = stream 
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sourceText }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: 0.3 }
        })
      });
      
      if (!response.ok) throw new Error(`Gemini API Error: ${await response.text()}`);
      
      if (stream) {
        return new Response(response.body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });
      }

      const resData = await response.json();
      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini.');
      
      return Response.json({ text: text.trim() });
    } else {
      // OpenAI Compatible Endpoints
      let endpoint = '';
      let apiKey = '';
      
      switch(provider) {
        case 'ark':
          endpoint = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
          apiKey = env.ARK_API_KEY;
          break;
        case 'qwen':
          endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
          apiKey = env.QWEN_API_KEY;
          break;
        case 'nvidia':
          endpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';
          apiKey = env.NVIDIA_API_KEY;
          break;
        case 'kilo':
          endpoint = 'https://api.kilo.ai/api/gateway/chat/completions';
          apiKey = env.KILO_API_KEY;
          break;
        default:
          throw new Error('Invalid provider');
      }

      if (!apiKey) throw new Error(`${provider.toUpperCase()}_API_KEY is not configured.`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: sourceText }
          ],
          temperature: 0.3,
          stream: stream
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} ${errorData}`);
      }

      if (stream) {
        return new Response(response.body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      
      if (!text) throw new Error('Invalid response format from provider.');
      
      return Response.json({ text: text.trim() });
    }
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
