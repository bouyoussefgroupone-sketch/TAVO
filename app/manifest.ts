import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TAVO",
    short_name: "TAVO",
    description: "Les plats et expériences qui valent le détour, sélectionnés à Rabat.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f3efe6",
    theme_color: "#cf3f27",
    icons: [
      { src: "/icons/tavo-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/tavo-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/tavo-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
