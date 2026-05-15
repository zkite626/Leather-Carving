import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '匠人商城',
  description: '选购手工皮雕精品，壮锦纹样钱包、皮雕工具、广西非遗特色工艺品，传承匠心之美。',
  openGraph: {
    title: '匠人商城 | 艺育皮韵',
    description: '选购手工皮雕精品，壮锦纹样钱包、皮雕工具、广西非遗特色工艺品。',
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
