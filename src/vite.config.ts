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
});
