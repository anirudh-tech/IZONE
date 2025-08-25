import type { Metadata } from "next";
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SessionProvider } from '@/components/SessionProvider'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import { getSession } from '@/lib/session'
import "./globals.css";

export const metadata: Metadata = {
  title: "TECHSSOUQ - Redefining Technology Experience",
  description: "Shop our newest range of audio speakers, earphones, watches, and more. Each gadget is designed to redefine how you experience technology.",
  icons: {
    icon: [{ url: "/Logo.png", sizes: "any" }],
    shortcut: ["/Logo.png"],
    apple: ["/Logo.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get initial session on the server side
  const initialSession = await getSession()

  return (
    <html lang="en">
      <body className="antialiased">
        {/* Prevent flash of incorrect theme by syncing data-theme early */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var saved = localStorage.getItem('theme');
              var theme = saved || 'system';
              var effective = theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              document.documentElement.setAttribute('data-theme', effective);
            } catch (e) {}
          })();
        `}} />
        <ThemeProvider>
          <ToastProvider>
            <SessionProvider initialSession={initialSession}>
              <AuthProvider>
                <CartProvider>
                  <FavoritesProvider>
                    {children}
                    {/* WhatsApp floating button */}
                    <WhatsAppFloat 
                      phoneNumber="971508024236" 
                      message="Hello! I'm interested in your products from TECHSSOUQ."
                      position="bottom-right"
                      showOnMobile={true}
                    />
                  </FavoritesProvider>
                </CartProvider>
              </AuthProvider>
            </SessionProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
