import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payment Gateway",
  description: "Payment Gateway ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#f6f8fb] text-neutral-950">
        {children}
      </body>
    </html>
  );
}
