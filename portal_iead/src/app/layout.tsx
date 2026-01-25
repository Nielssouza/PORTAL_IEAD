/* eslint-disable @next/next/no-page-custom-font */
import type { ReactNode } from "react";
import "./globals.css";
import Preloader from "@/components/Preloader";

export const metadata = {
  title: "IEAD  Jardim Das Oliveiras",
  description: "Frontend do Portal IEAD",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Preloader />
        {children}
      </body>
    </html>
  );
}
