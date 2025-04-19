import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Julian Oostwal | Front-End Developer Portfolio",
    description: "Discover the portfolio of Julian Oostwal, a skilled front-end developer specializing in modern web development. Explore projects showcasing expertise in building responsive, high-performance applications using Next.js, and Tailwind CSS. Let's connect to bring your digital ideas to life.",
    keywords: "Julian Oostwal, Front-End Developer, Portfolio, Web Development, Next.js, Tailwind CSS",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                    <Providers>
                            <Navbar />
                            {children}
                            <SpeedInsights />
                            <Script
                                async
                                src="https://stats.quixly.xyz/script.js"
                                data-website-id="d31f6458-d505-4e13-b2df-3c68c6f33566"
                            />
                            <Footer />
                            <Toaster />
                    </Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}
