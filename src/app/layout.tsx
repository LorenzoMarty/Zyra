import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "ZYRA",
    template: "%s | ZYRA"
  },
  description:
    "Busque produtos do Mercado Livre com filtros inteligentes. Organize sua compra e finalize com segurança no Mercado Livre.",
  metadataBase: new URL("https://example.com"),
  icons: {
    icon: "/zyra-icon.png",
    shortcut: "/zyra-icon.png",
    apple: "/zyra-icon.png"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans text-ink`}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
