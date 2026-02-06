import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoupleOps - Fix Systems, Not People",
  description: "Transform your relationship with structured decision-making, role clarity, and transparent communication.",
  keywords: ["CoupleOps", "relationship", "decision-making", "communication", "roles", "finances"],
  authors: [{ name: "CoupleOps Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "CoupleOps - Fix Systems, Not People",
    description: "Transform your relationship with structured decision-making, role clarity, and transparent communication.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoupleOps - Fix Systems, Not People",
    description: "Transform your relationship with structured decision-making, role clarity, and transparent communication.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
