import path from 'path';
import { defineConfig, loadEnv, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname), '');
  const anthropicKey = env.ANTHROPIC_API_KEY ?? '';
  const anthropicEntry = {
    target: 'https://api.anthropic.com',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/api\/anthropic/, ''),
    configure(proxy: { on: (ev: string, fn: (req: unknown, ...rest: unknown[]) => void) => void }) {
      proxy.on('proxyReq', (req: unknown) => {
        const proxyReq = req as { setHeader: (k: string, v: string) => void };
        proxyReq.setHeader('x-api-key', anthropicKey);
        proxyReq.setHeader('anthropic-version', '2023-06-01');
      });
    },
  } as ProxyOptions;

  const anthropicProxy = anthropicKey
    ? ({
        '/api/anthropic': anthropicEntry,
      } as Record<string, string | ProxyOptions>)
    : undefined;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
      ...(anthropicProxy ? { proxy: anthropicProxy } : {}),
    },
    preview: {
      ...(anthropicProxy ? { proxy: anthropicProxy } : {}),
    },
  };
});
