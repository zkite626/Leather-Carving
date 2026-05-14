import React from 'react';
import Link from 'next/link';
import styles from './footer.module.css';

const QUICK_LINKS = [
  { label: '关于我们', href: '/about' },
  { label: '课程中心', href: '/courses' },
  { label: '作品展览', href: '/works' },
  { label: '匠人商城', href: '/shop' },
  { label: '社区论坛', href: '/community' },
];

const SUPPORT_LINKS = [
  { label: '帮助中心', href: '/help' },
  { label: '联系客服', href: '/contact' },
  { label: '隐私政策', href: '/privacy' },
  { label: '服务条款', href: '/terms' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.brandLogo}>
              <span className={styles.brandName}>艺育皮韵</span>
            </div>
            <p className={styles.brandDesc}>
              致力于非物质文化遗产皮雕技艺的数字化教育与传承，让传统工艺在数字时代焕发新的生命力。
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>快速导航</h3>
            <ul className={styles.linkList}>
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>帮助与支持</h3>
            <ul className={styles.linkList}>
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>联系我们</h3>
            <div className={styles.contactInfo}>
              <p>邮箱: contact@leather-art.edu</p>
              <p>电话: 400-000-0000</p>
              <p>工作时间: 周一至周五 9:00-18:00</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {year} 艺育皮韵. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>
  );
}
