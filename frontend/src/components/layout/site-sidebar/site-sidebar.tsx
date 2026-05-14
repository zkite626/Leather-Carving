'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './site-sidebar.module.css';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: string | number;
  children?: SidebarItem[];
}

interface SiteSidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  className?: string;
}

function SidebarMenuItem({
  item,
  collapsed,
}: {
  item: SidebarItem;
  collapsed: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li className={styles.item}>
      {hasChildren ? (
        <>
          <button
            className={`${styles.link} ${styles.expandable}`}
            onClick={() => setExpanded(!expanded)}
            title={collapsed ? item.label : undefined}
            type="button"
          >
            <span className={styles.icon}>{item.icon}</span>
            {!collapsed && (
              <>
                <span className={styles.label}>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={styles.badge}>{item.badge}</span>
                )}
                <svg
                  className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
          {!collapsed && expanded && item.children && (
            <ul className={styles.subList}>
              {item.children.map((child) => (
                <SidebarMenuItem key={child.href} item={child} collapsed={collapsed} />
              ))}
            </ul>
          )}
        </>
      ) : (
        <Link
          href={item.href}
          className={styles.link}
          title={collapsed ? item.label : undefined}
        >
          <span className={styles.icon}>{item.icon}</span>
          {!collapsed && (
            <>
              <span className={styles.label}>{item.label}</span>
              {item.badge !== undefined && (
                <span className={styles.badge}>{item.badge}</span>
              )}
            </>
          )}
        </Link>
      )}
    </li>
  );
}

export function SiteSidebar({
  items,
  collapsed = false,
  className = '',
}: SiteSidebarProps) {
  const classNames = [
    styles.sidebar,
    collapsed ? styles.collapsed : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={classNames}>
      <nav aria-label="Sidebar navigation">
        <ul className={styles.list}>
          {items.map((item) => (
            <SidebarMenuItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
