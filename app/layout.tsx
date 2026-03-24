import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plots & Prosper — Grow Your Wealth Together",
  description:
    "Our platform for tracking contributions, managing investments, and building a transparent financial future as a group.",
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
