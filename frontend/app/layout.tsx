import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ChatWidget } from "@/components/bots/ChatWidget";
import { Toaster } from "@/components/ui/Toaster";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "MATCH — Бронирование футбольных полей",
  description: "Онлайн-платформа аренды футбольных полей в Алматы. Бронируйте за 2 минуты. match.kz",
  keywords: "футбол, аренда поля, бронирование, Алматы, матч",
  openGraph: {
    title: "MATCH — Твоё поле. Твой матч.",
    description: "Онлайн-бронирование футбольных полей в Алматы",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${dmSans.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0A1F0A] text-[#F5F5F0]">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <ChatWidget />
        <Toaster />
      </body>
    </html>
  );
}
