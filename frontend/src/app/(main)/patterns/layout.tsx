import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '纹样素材库',
  description: '探索壮锦、瑶族等广西非遗纹样素材，支持下载和 AI 纹样生成。',
  openGraph: {
    title: '纹样素材库 | 艺育皮韵',
    description: '探索壮锦、瑶族等广西非遗纹样素材，支持下载和 AI 纹样生成。',
  },
};

export default function PatternsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
