import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '作品画廊',
  description: '欣赏精美皮雕艺术作品，展示壮锦纹样、喀斯特灵感和现代融合设计的皮革艺术品。',
  openGraph: {
    title: '作品画廊 | 艺育皮韵',
    description: '欣赏精美皮雕艺术作品，展示壮锦纹样和现代融合设计的皮革艺术品。',
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
