import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Halyard Display Variable is an Adobe Typekit face and cannot be self-hosted
// freely; Inter is the design reference's sanctioned structural substitute.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-halyard",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PS2GAT — Markerless Gait & Balance Analyzer",
  description:
    "Physics-informed, symmetry-attentive markerless gait pathology and fall-risk assessment. Client-side pose estimation, no backend.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
