import type { Metadata } from "next";
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { ToastProvider } from '@/contexts/ToastContext'
import "./globals.css";

export const metadata: Metadata = {
  title: "GADZOO - Redefining Technology Experience",
  description: "Shop our newest range of audio speakers, earphones, watches, and more. Each gadget is designed to redefine how you experience technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                {children}
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
