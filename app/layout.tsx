import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { ChipiProvider } from "@chipi-stack/nextjs";
import { Providers } from "./providers/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Updated ClashDisplay font configuration to match available files
const clashDisplay = localFont({
  src: [
    {
      path: "../public/fonts/ClashDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/ClashDisplay-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/ClashDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/ClashDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-clash-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Payportz - Nigerian Trade Finance Platform",
  description:
    "Blockchain-powered Nigerian trade platform with NGN to USDC conversion and smart contract escrow",
  icons: "/Payslab-logo.svg",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${clashDisplay.variable} antialiased`}
      >
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <ChipiProvider>
            <Providers>{children}</Providers>
          </ChipiProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
