import type { Metadata } from "next";
import "./globals.css";
import { BackgroundBlobs } from "@/components/layout/BackgroundBlobs";

export const metadata: Metadata = {
  title: "Table Tennis",
  description: "Tournament & League Manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BackgroundBlobs />
        {children}
      </body>
    </html>
  );
}
