import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SessionProvider } from "@/components/SessionProvider";
import { CartProvider } from "@/context/CartContext";

import { NotificationProvider } from "@/context/NotificationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import SessionManager from "@/components/SessionManager";
import ClientErrorHandler from "@/components/ClientErrorHandler";

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
  other: {
    "color-scheme": "light",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff9fc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ClientErrorHandler />
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
