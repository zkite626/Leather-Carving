import dynamic from 'next/dynamic';

/**
 * Dynamically imported heavy client components.
 * These are lazy-loaded to reduce initial JS bundle size and improve FCP/LCP.
 */

export const DynamicAIChatWidget = dynamic(
  () => import('@/components/ai/ai-chat-widget').then((m) => ({ default: m.AIChatWidget })),
  { ssr: false, loading: () => null },
);

export const DynamicVideoPlayer = dynamic(
  () => import('@/components/course/video-player').then((m) => ({ default: m.VideoPlayer })),
  {
    ssr: false,
    loading: () => <div style={{ aspectRatio: '16/9', background: 'var(--lc-bg-secondary)' }} />,
  },
);

export const DynamicPatternGallery = dynamic(
  () => import('@/components/pattern/pattern-gallery').then((m) => ({ default: m.PatternGallery })),
  { ssr: false },
);
