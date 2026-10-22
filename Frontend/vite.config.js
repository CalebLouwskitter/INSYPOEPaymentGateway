import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Check if dev SSL certificates exist for HTTPS support
const certFile = path.resolve(__dirname, process.env.SSL_CRT_FILE || '../certs/localhost+2.pem');
const keyFile = path.resolve(__dirname, process.env.SSL_KEY_FILE || '../certs/localhost+2-key.pem');
const useHttps = process.env.HTTPS === 'true' && fs.existsSync(certFile) && fs.existsSync(keyFile);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    https: useHttps
      ? {
          cert: fs.readFileSync(certFile),
          key: fs.readFileSync(keyFile),
        }
      : false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
  },
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
});
