import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhoneFind | Hardware Security Console",
  description: "Anti-theft tracking, telemetry, and remote security protection for Android",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" }
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
