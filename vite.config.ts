import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 8081,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: false,
        timeout: 30000,
        proxyTimeout: 30000,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[🔄 PROXY] Request:', req.method, req.url, '→ localhost:3000');
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('[✅ PROXY] Response:', proxyRes.statusCode, 'for', req.url);
          });
          proxy.on('error', (err, req) => {
            console.log('[❌ PROXY] Error:', err.message, 'for', req.url);
          });
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
