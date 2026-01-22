import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SupabaseProvider from "@/providers/SupabaseProvider";
import UserProvider from "@/providers/UserProvider";
import ModalProvider from "@/providers/ModalProvider";
import ToasterProvider from "@/providers/ToasterProvider";
import getSongsByUserId from "@/actions/getSongsByUserId";
import Player from "@/components/Player";
import GreetingModal from "@/components/GreetingModal";

const geistSans = localFont({
  src: "./fonts/Figtree-Regular.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/Figtree-Regular.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Glorify - Soren Family Worship Music Platform",
  description: "Stream and discover worship music created by Soren family members. A dedicated platform for sharing worship songs and spiritual music.",
  keywords: ["worship music", "streaming", "music platform", "praise and worship", "Soren family"],
  authors: [{ name: "Jack Pritom Soren" }],
  creator: "Jack Pritom Soren",
  publisher: "Glorify",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://glorifyworship.vercel.app",
    siteName: "Glorify",
    title: "Glorify - Soren Family Worship Music Platform",
    description: "Stream worship music created by Soren family members on Glorify.",
    images: [
      {
        url: "https://glorifyworship.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Glorify - Soren Family Worship Music",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glorify - Worship Music by Soren Family",
    description: "Stream worship music created by Soren family members",
    creator: "@glorify",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification",
  },
  metadataBase: new URL("https://glorifyworship.vercel.app"),
};

export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userSongs = await getSongsByUserId();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ToasterProvider />
        <GreetingModal />
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider />
            <Sidebar songs={userSongs}>{children}</Sidebar>
            <Player />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
