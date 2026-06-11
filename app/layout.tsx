import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

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
    <html lang="en">
      <body className={`${poppins.className} antialiased bg-[#faf9f7] text-[#45132c] min-h-screen`}>
        {children}
        <Toaster
          theme="light"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e8d5c4',
              color: '#45132c',
            },
          }}
        />
      </body>
    </html>
  );
}
