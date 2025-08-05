import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
