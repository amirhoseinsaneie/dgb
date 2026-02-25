import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { ThemeProvider } from "@/components/providers";
import { DirectionProvider } from "@/components/ui/direction";
import { Toaster } from "@/components/ui/sonner";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "هیئت حاکمیت تصمیم",
  description: "ثبت، استانداردسازی و پیگیری تصمیمات کلیدی در تیم‌های چابک",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.className} ${vazirmatn.variable} font-sans antialiased`}>
        <DirectionProvider direction="rtl">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppProvider>
              {children}
              <Toaster />
            </AppProvider>
          </ThemeProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
