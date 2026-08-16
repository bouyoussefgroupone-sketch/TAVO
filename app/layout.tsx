import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./pwa.css";
import "./order.css";
import "./login/login.css";
import "./professional.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tavo-eight.vercel.app"),
  title: "TAVO — Qu’est-ce qu’on mange aujourd’hui ?",
  description: "Catalogue visuel de plats et d’expériences culinaires à Rabat.",
  manifest: "/manifest.webmanifest",
  applicationName: "TAVO",
  appleWebApp: { capable: true, title: "TAVO", statusBarStyle: "default" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: [{ url: "/icons/tavo-apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "TAVO — Qu’est-ce qu’on mange aujourd’hui ?",
    description:
      "Les plats et expériences qui valent le détour, sélectionnés à Rabat.",
    images: [
      {
        url: "/og.webp",
        width: 1200,
        height: 630,
        alt: "TAVO — catalogue culinaire",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/og.webp"] },
};

export const viewport: Viewport = {
  themeColor: "#cf3f27",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
