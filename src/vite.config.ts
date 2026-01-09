import path from 'path';
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cjsInterop } from 'vite-plugin-cjs-interop';

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    cjsInterop({
      dependencies: ['@walletconnect/logger'],
    }),
  ],
  resolve: {
    alias: {
      '@walletconnect/logger': path.resolve(__dirname, 'shims/walletconnect-logger.js'),
    },
  },
  ssr: {
    noExternal: ['@walletconnect/logger', '@reown/appkit-wallet'],
  },
  optimizeDeps: {
    include: ['@walletconnect/logger', '@reown/appkit-wallet'],
  },
});