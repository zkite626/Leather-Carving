import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProductBySlug } from '@/lib/product-api';
import { ProductDetailSection } from './product-detail-section';
import styles from './page.module.css';

/* ============================================
   SEO Metadata
   ============================================ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return { title: '商品未找到 | 艺育皮韵' };
    }

    return {
      title: `${product.name} | 艺育皮韵`,
      description:
        product.description?.slice(0, 160) ||
        `${product.name} - 艺育皮韵非遗皮雕商城`,
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 200),
        images: product.coverImage
          ? [{ url: product.coverImage, width: 1200, height: 900 }]
          : [],
        type: 'website',
      },
    };
  } catch {
    return { title: '商品详情 | 艺育皮韵' };
  }
}

/* ============================================
   Page Component (Server)
   ============================================ */

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  const categoryName = product.category?.name ?? '';

  return (
    <div className={styles.page}>
      {/* ========== Breadcrumb ========== */}
      <nav className={styles.breadcrumb} aria-label="面包屑导航">
        <Link href="/" className={styles.breadcrumbLink}>首页</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link href="/shop" className={styles.breadcrumbLink}>商城</Link>
        {categoryName && (
          <>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{categoryName}</span>
          </>
        )}
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      {/* ========== Client Interactive Section ========== */}
      <ProductDetailSection product={product} />
    </div>
  );
}
