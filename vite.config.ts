import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const mockDb: any[] = [];
const mockApiPlugin = (env: Record<string, string>) => ({
  name: 'mock-api',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url?.startsWith('/api/ai')) {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => body += chunk.toString());
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { provider, model, sourceText, systemInstruction } = data;
              
              if (provider === 'gemini') {
                const apiKey = env.GEMINI_API_KEY;
                if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
                
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: sourceText }] }],
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    generationConfig: { temperature: 0.3 }
                  })
                });
                
                if (!response.ok) throw new Error(`Gemini API Error: ${await response.text()}`);
                const resData = await response.json();
                const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) throw new Error('Empty response from Gemini.');
                
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ text: text.trim() }));
              } else {
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
                    temperature: 0.3
                  })
                });

                if (!response.ok) throw new Error(`API Error: ${response.status} ${await response.text()}`);
                const resData = await response.json();
                const text = resData.choices?.[0]?.message?.content;
                if (!text) throw new Error('Invalid response format from provider.');
                
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ text: text.trim() }));
              }
            } catch (e: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }
      }

      if (req.url?.startsWith('/api/prompts')) {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => body += chunk.toString());
          req.on('end', () => {
            const data = JSON.parse(body);
            mockDb.unshift({ ...data, id: Date.now(), created_at: new Date().toISOString() });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          });
          return;
        }
        if (req.method === 'GET') {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const password = url.searchParams.get('password');
          if (password !== (env.PASSWORD || 'admin')) {
            res.statusCode = 401;
            res.end('Unauthorized');
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(mockDb));
          return;
        }
        if (req.method === 'DELETE') {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const password = url.searchParams.get('password');
          const id = url.searchParams.get('id');
          if (password !== (env.PASSWORD || 'admin')) {
            res.statusCode = 401;
            res.end('Unauthorized');
            return;
          }
          const index = mockDb.findIndex(p => p.id.toString() === id);
          if (index !== -1) mockDb.splice(index, 1);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }
      }
      next();
    });
  }
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), mockApiPlugin(env)],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.ARK_API_KEY': JSON.stringify(env.ARK_API_KEY),
      'process.env.QWEN_API_KEY': JSON.stringify(env.QWEN_API_KEY),
      'process.env.NVIDIA_API_KEY': JSON.stringify(env.NVIDIA_API_KEY),
      'process.env.KILO_API_KEY': JSON.stringify(env.KILO_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
