/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";

export const metadata = {
  title: "IEAD Jardim Das Oliveiras",
  description: "Frontend do Portal IEAD",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
