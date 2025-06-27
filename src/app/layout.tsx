import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/components/SessionProvider";
import { CartProvider } from "@/context/CartContext";

import { NotificationProvider } from "@/context/NotificationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import SessionManager from "@/components/SessionManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Царевна Ткани - Магазин высококачественных тканей",
  description: "Магазин тканей Царевна: широкий выбор качественных тканей для пошива одежды, штор и других изделий.",
  keywords: "ткани, магазин тканей, ткани для одежды, ткани для штор, купить ткань",
  themeColor: "#fff9fc",
  other: {
    "color-scheme": "light",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    await getServerSession(authOptions);
  } catch (error) {
    console.error('Ошибка при получении сессии:', error);
  }

  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ErrorBoundary>
          <SessionProvider>
            <SessionManager />
            <NotificationProvider>
              <CartProvider>
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
              </CartProvider>
            </NotificationProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
