'use client';

import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '@/stores/notification-store';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { notifications, isLoading, fetchNotifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchNotifications(1).then((res) => {
      setHasMore(page < (res.pagination?.totalPages ?? 1));
    });
  }, [isAuthenticated, fetchNotifications, router, page]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const res = await fetchNotifications(nextPage);
    setHasMore(nextPage < (res.pagination?.totalPages ?? 1));
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>通知中心</h1>
          <div className={styles.headerActions}>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={markAllAsRead}>
                全部标记已读
              </button>
            )}
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            className={`${styles.tab} ${filter === 'unread' ? styles.tabActive : ''}`}
            onClick={() => setFilter('unread')}
          >
            未读 {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        <div className={styles.list}>
          {filtered.length === 0 && !isLoading && (
            <div className={styles.empty}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <p>{filter === 'unread' ? '没有未读通知' : '暂无通知'}</p>
            </div>
          )}

          {filtered.map((n) => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.isRead ? styles.itemUnread : ''}`}
              onClick={() => handleNotificationClick(n)}
            >
              <div className={styles.itemIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {n.type === 'community' ? (
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  ) : n.type === 'order' ? (
                    <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>
                  ) : n.type === 'course' ? (
                    <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>
                  ) : (
                    <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>
                  )}
                </svg>
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemTitleRow}>
                  <h3 className={styles.itemTitle}>{n.title}</h3>
                  {!n.isRead && <span className={styles.unreadDot} />}
                </div>
                <p className={styles.itemText}>{n.content}</p>
                <p className={styles.itemTime}>{new Date(n.createdAt).toLocaleString('zh-CN')}</p>
              </div>
            </div>
          ))}

          {isLoading && <div className={styles.loading}>加载中...</div>}
        </div>

        {hasMore && !isLoading && filtered.length > 0 && (
          <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
            加载更多
          </button>
        )}
      </div>
    </div>
  );
}
