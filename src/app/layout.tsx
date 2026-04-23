import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sole Vault | Premium Sneaker Resell",
  description: "100% authentic sneakers sourced from official drops. Elevate your collection today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased text-black bg-white`}>
        <AnnouncementBar />
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        <WhatsAppButton />
        <Toaster position="bottom-center" toastOptions={{ className: 'text-sm font-bold uppercase tracking-wide' }} />
      </body>
    </html>
  );
}

