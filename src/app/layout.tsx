import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/Footer";
import Script from "next/script";
import { generateSiteMetadata, generatePersonSchema, generateWebsiteSchema, viewport as siteViewport } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  return generateSiteMetadata();
}

export const viewport: Viewport = siteViewport;

async function JsonLdSchemas() {
  const [personSchema, websiteSchema] = await Promise.all([
    generatePersonSchema(),
    generateWebsiteSchema(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootLayoutInner>{children}</RootLayoutInner>;
}

async function RootLayoutInner({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName?.trim() || "Portfolio";
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID?.trim() || "";

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <JsonLdSchemas />
        {googleAnalyticsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}');
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Providers>
            <Navbar siteName={siteName} />
            {children}
            <Footer siteName={siteName} />
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
