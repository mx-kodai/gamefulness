import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, M_PLUS_Rounded_1c, Geist } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SeedBoot from "@/components/SeedBoot";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const mplusRounded = M_PLUS_Rounded_1c({
  variable: "--font-rounded",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const SITE_URL = "https://gamefulness.vercel.app";
const SITE_TITLE = "ゲームフルネス | あそびで、こころ満たされる毎日を";
const SITE_DESC =
  "年齢も障がいもこえて、誰もがあそべる。ひと駒1〜3分のやさしいミニゲームが、毎日に小さな元気を。施設・ご家庭・ひとりで、どこでも。";

export const viewport: Viewport = {
  themeColor: "#F6F1E4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | ゲームフルネス",
  },
  description: SITE_DESC,
  applicationName: "ゲームフルネス",
  keywords: [
    "ゲームフルネス",
    "ミニゲーム",
    "ウェルネス",
    "介護",
    "福祉",
    "高齢者",
    "脳トレ",
    "リハビリ",
    "インクルーシブ",
    "ユニバーサル",
  ],
  authors: [{ name: "Zorge" }],
  creator: "Zorge",
  publisher: "Zorge",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: "ゲームフルネス",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [
      { url: "/og.svg", width: 1200, height: 630, alt: "ゲームフルネス" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ["/og.svg"],
  },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  category: "games",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJp.variable} ${mplusRounded.variable} ${geist.variable}`}
    >
      <body className="min-h-screen">
        <SeedBoot />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
