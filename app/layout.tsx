import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "TAVO — Qu’est-ce qu’on mange aujourd’hui ?",
  description: "Catalogue visuel de plats et d’expériences culinaires à Rabat.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
