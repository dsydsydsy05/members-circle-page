// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      // Images uploaded in Lovable live under /__l5e/, which only Lovable's hosting serves.
      // In local dev, fetch them from the project's Lovable domain so stored URLs still load.
      proxy: {
        "/__l5e": {
          target: "https://18c20231-b1b3-4854-ac83-3daa9bef7587.lovableproject.com",
          changeOrigin: true,
        },
      },
    },
  },
});
