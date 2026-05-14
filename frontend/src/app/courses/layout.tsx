import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '课程中心',
  description: '探索非遗皮雕技艺课程，从入门到大师级别，跟随传承人学习传统皮革工艺。',
  openGraph: {
    title: '课程中心 | 艺育皮韵',
    description: '探索非遗皮雕技艺课程，从入门到大师级别，跟随传承人学习传统皮革工艺。',
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
