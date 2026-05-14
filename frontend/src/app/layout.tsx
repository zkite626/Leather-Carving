import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC, Outfit } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '艺育皮韵 — 非遗皮雕数字教育平台',
  description:
    '艺育皮韵是一个致力于非物质文化遗产皮雕技艺的数字化教育与传承平台，提供课程学习、作品展示、社区交流及匠人商城等服务。',
  keywords: ['皮雕', '非遗', '数字化教育', '皮革工艺', '传统文化', '手工艺术'],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('lc-theme')?.value;
  const theme = themeCookie === 'dark' ? 'dark' : 'light';

  return (
    <html
      lang="zh-CN"
      data-theme={theme}
      className={`${inter.variable} ${notoSansSC.variable} ${outfit.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
