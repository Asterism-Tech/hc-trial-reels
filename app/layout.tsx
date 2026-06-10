import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Hobbycraft Reel Hub",
  description: "Track, compare, and analyse Trial Reels for Hobbycraft social media team",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0F0F0F] text-[#F5F5F5] min-h-screen">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              color: '#F5F5F5',
            },
          }}
        />
      </body>
    </html>
  );
}
