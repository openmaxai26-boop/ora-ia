import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ora AI — Automatisez votre entreprise avec l'IA",
  description:
    "Ora AI est la première plateforme d'agents IA conçue pour les entreprises de Polynésie française. Automatisez vos réseaux sociaux, service client, SEO et plus encore.",
  keywords: ["IA", "Polynésie", "automatisation", "agents IA", "Tahiti", "SaaS"],
  openGraph: {
    title: "Ora AI — L'IA au service du fenua",
    description:
      "Automatisez votre entreprise avec des agents IA pensés pour la Polynésie.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
