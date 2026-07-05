import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhoneFind",
  description: "Anti-theft tracking and protection for Android",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
