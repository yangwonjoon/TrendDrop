import type { Metadata } from "next";

import AppNav from "./app-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrendDrop",
  description: "SNS 기반 트렌드 탐색 웹앱 프로토타입",
};

// 첫 페인트 전에 저장된 테마를 적용해 FOUC(테마 깜빡임)를 막는다.
const themeScript = `try{var t=localStorage.getItem('td-theme');if(t==='warm'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppNav />
        {children}
      </body>
    </html>
  );
}
