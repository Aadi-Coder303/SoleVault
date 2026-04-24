import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BuyerShell from "@/components/BuyerShell";
import AuthSync from "@/components/AuthSync";
import VisitorTracker from "@/components/VisitorTracker";
import ThemeProvider from "@/components/ThemeProvider";
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased text-black bg-white dark:text-neutral-100 dark:bg-neutral-950 transition-colors duration-300`}>
        <ThemeProvider>
          <Navbar />
          <AuthSync />
          <VisitorTracker />
          <BuyerShell>
            <div className="flex-1">
              {children}
            </div>
          </BuyerShell>
          <Toaster position="bottom-center" toastOptions={{ className: 'text-sm font-bold uppercase tracking-wide !bg-white !text-black dark:!bg-neutral-800 dark:!text-white' }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
