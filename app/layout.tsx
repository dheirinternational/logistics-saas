import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { DheirToastProvider } from "@/components/ui/DheirToastProvider";
import { buildRootMetadata } from "@/lib/marketing/siteMetadata";

export const metadata: Metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG" className="h-full antialiased">
      <body className="max-h-dvh h-dvh bg-primary text-primary-text ">
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-X9V0ZWTYZJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X9V0ZWTYZJ');
          `}
        </Script>
        {children}
        <DheirToastProvider />
      </body>
    </html>
  );
}
