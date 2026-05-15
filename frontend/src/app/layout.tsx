import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC, Outfit } from 'next/font/google';
import { cookies } from 'next/headers';
import { AuthProvider } from '@/contexts/auth-context';
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
  title: {
    default: '艺育皮韵 — 非遗皮雕数字教育平台',
    template: '%s | 艺育皮韵',
  },
  description:
    '艺育皮韵是一个致力于非物质文化遗产皮雕技艺的数字化教育与传承平台，提供课程学习、作品展示、社区交流及匠人商城等服务。',
  keywords: ['皮雕', '非遗', '数字化教育', '皮革工艺', '传统文化', '手工艺术', '壮锦', '瑶族'],
  openGraph: {
    title: '艺育皮韵 — 非遗皮雕数字教育平台',
    description:
      '艺育皮韵是一个致力于非物质文化遗产皮雕技艺的数字化教育与传承平台，提供课程学习、作品展示、社区交流及匠人商城等服务。',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://leather-art.edu',
    siteName: '艺育皮韵',
    locale: 'zh_CN',
    type: 'website',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '艺育皮韵 — 非遗皮雕数字教育平台',
    description:
      '致力于非物质文化遗产皮雕技艺的数字化教育与传承平台，提供课程学习、作品展示、社区交流及匠人商城等服务。',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://leather-art.edu'),
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
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${notoSansSC.variable} ${outfit.variable}`}
    >
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
