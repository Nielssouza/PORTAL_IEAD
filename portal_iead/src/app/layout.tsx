/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";

export const metadata = {
  title: "Portal IEAD",
  description: "Frontend do Portal IEAD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
