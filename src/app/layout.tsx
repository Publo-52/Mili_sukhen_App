import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { WhatsAppMessenger } from "@/components/chat/WhatsAppMessenger";

export const metadata: Metadata = {
  title: "Mili ❤️ — A Digital Universe Made For You",
  description: "A cinematic personal digital world dedicated to Mili. A collection of every website, Python turtle artwork, memory, and love note created by Sukhen.",
  authors: [{ name: "Sukhen" }],
  keywords: ["Mili", "Love App", "Portfolio", "Python Turtle", "Memories", "Vercel Projects", "Romantic Web App"],
  openGraph: {
    title: "Mili ❤️ — A Digital Universe Made For You",
    description: "Everything I created, I created with you in mind.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
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

