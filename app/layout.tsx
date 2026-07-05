import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrendDrop",
  description: "SNS 기반 트렌드 탐색 웹앱 프로토타입",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

