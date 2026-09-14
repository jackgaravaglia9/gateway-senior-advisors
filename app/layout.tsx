import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID } from "@/lib/gtag";
import SiteHeader from "@/components/SiteHeader";
import PostHogProvider from "@/components/PostHogProvider";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Find the Right Senior Living in St. Louis | Gateway Senior Advisors",
  description:
    "Helping families find assisted living and memory care options in St. Louis that fit their parent's needs, budget, and location. Free, no obligation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-body">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
            ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ""}
          `}
        </Script>
        <PostHogProvider>
          <SiteHeader />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
