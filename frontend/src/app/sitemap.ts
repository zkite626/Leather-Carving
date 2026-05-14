import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://leather-art.edu';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/courses', '/gallery', '/patterns', '/shop', '/community'].map(
    (path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: (path === '' ? 'daily' : 'weekly') as 'daily' | 'weekly',
      priority: path === '' ? 1 : 0.8,
    }),
  );

  return [...staticPages];
  // Dynamic pages (courses, products) would be fetched from API in production
}
