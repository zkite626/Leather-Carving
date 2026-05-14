import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '社区',
  description: '加入皮雕爱好者社区，分享创作心得、参与挑战打卡、交流技艺、结识匠友。',
  openGraph: {
    title: '社区 | 艺育皮韵',
    description: '加入皮雕爱好者社区，分享创作心得、参与挑战打卡、交流技艺。',
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
