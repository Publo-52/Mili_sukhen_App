import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { WhatsAppMessenger } from "@/components/chat/WhatsAppMessenger";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://mili-universe.vercel.app')
  ),
  title: "Suksharmi ❤️ — A Digital Universe Made For You",
  description: "Suksharmi — A cinematic personal digital universe dedicated to Mili & Sukhen. A collection of every website, Python turtle artwork, memory, and love note.",
  authors: [{ name: "Sukhen" }],
  keywords: ["Suksharmi", "Sukhen", "Mili", "Love App", "Portfolio", "Python Turtle", "Memories", "Romantic Web App"],
  openGraph: {
    title: "Suksharmi ❤️ — A Digital Universe Made For You",
    description: "Everything I created, I created with you in mind.",
    type: "website",
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: "#06040a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#06040a] text-slate-100 selection:bg-roseGlow-600 selection:text-white">
        <AuthProvider>
          {children}
          <WhatsAppMessenger />
        </AuthProvider>
      </body>
    </html>
  );
}

