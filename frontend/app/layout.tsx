import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ChatWidget } from "@/components/bots/ChatWidget";
import { Toaster } from "@/components/ui/Toaster";

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
    <html lang="ru" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0A1F0A] text-[#F5F5F0]">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <ChatWidget />
        <Toaster />
      </body>
    </html>
  );
}
