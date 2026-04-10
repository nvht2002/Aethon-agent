import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AETHON — Autonomous AI Operating System",
  description:
    "AETHON is an AI Agent Platform with real tool calling, streaming chat, task automation, and self-mutation capabilities. Built by Nguyễn Văn Hoài Thương.",
  keywords: ["AI", "Agent", "AIOS", "Autonomous", "Gemini", "Next.js"],
  authors: [{ name: "Nguyễn Văn Hoài Thương" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  openGraph: {
    title: "AETHON — Autonomous AI Operating System",
    description: "The most powerful AI Agent platform. Real tools. No demos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
