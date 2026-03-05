import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Pass VITE_TARGET=electron when building for desktop
// e.g.  VITE_TARGET=electron npm run build
const isElectron = process.env.VITE_TARGET === "electron";

export default defineConfig({
  base: "./", // keeps asset paths relative — required for both Electron (file://) and PWA

  plugins: [
    react(),
    tailwindcss(),

    // PWA only for web builds — service workers break on file:// (Electron)
    !isElectron && VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Nexus Quiz",
        short_name: "Quiz",
        description: "Online Quiz Examination System by @ArcheType20s",
        start_url: "./",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2563eb",
        icons: [
          {
            src: "/icon-1921.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-5121.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ].filter(Boolean), // removes the `false` entry when building for Electron

  build: {
    outDir: "dist",
  },
});