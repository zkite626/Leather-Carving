'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getAdminDashboard, getRecentActivities, type AdminDashboardData, type RecentActivity } from '@/lib/admin-api';
import styles from './page.module.css';

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function formatAmount(n: number): string {
  return '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} 小时前`;
  const days = Math.floor(hrs / 24);
  return `${days} 天前`;
}

type Period = 'day' | 'week' | 'month';

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('day');

  const fetchData = useCallback(async (p: Period) => {
    try {
      setLoading(true);
      const [dashboard, acts] = await Promise.all([
        getAdminDashboard(p),
        getRecentActivities(),
      ]);
      setData(dashboard);
      setActivities(Array.isArray(acts) ? acts : []);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(period); // eslint-disable-line react-hooks/set-state-in-effect -- data fetching pattern
  }, [period, fetchData]);

  if (loading && !data) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
        <div className={styles.skeletonGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className={styles.skeletonChart} />
          <div className={styles.skeletonChart} />
        </div>
      </div>
    );
  }

  const stats = data ?? {
    userCount: 0, courseCount: 0, orderCount: 0, revenue: 0,
    todayNewUsers: 0, todayOrders: 0, todayRevenue: 0,
    userGrowthChart: [], revenueChart: [], topCourses: [],
  };

  const statsCards = [
    { label: '用户总数', value: formatNumber(stats.userCount), icon: '👥', iconClass: styles.statIconUsers, today: stats.todayNewUsers, todayLabel: '今日新增' },
    { label: '课程总数', value: formatNumber(stats.courseCount), icon: '📚', iconClass: styles.statIconCourses, today: 0, todayLabel: '' },
    { label: '订单总数', value: formatNumber(stats.orderCount), icon: '🛒', iconClass: styles.statIconOrders, today: stats.todayOrders, todayLabel: '今日订单' },
    { label: '总收入', value: formatAmount(stats.revenue), icon: '💰', iconClass: styles.statIconRevenue, today: stats.todayRevenue, todayLabel: '今日收入', isCurrency: true },
  ];

  return (
    <div className={styles.page}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {statsCards.map((card) => (
          <div key={card.label} className={styles.statCard}>
            <div className={`${styles.statIcon} ${card.iconClass}`}>
              <span style={{ fontSize: 24 }}>{card.icon}</span>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{card.value}</span>
              <span className={styles.statLabel}>{card.label}</span>
              {card.todayLabel && (
                <span className={`${styles.statGrowth} ${card.today >= 0 ? styles.growthUp : styles.growthDown}`}>
                  {card.today >= 0 ? '↑' : '↓'} {card.isCurrency ? formatAmount(card.today) : card.today} {card.todayLabel}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>用户增长趋势</h3>
            <div className={styles.chartToggle}>
              {(['day', 'week', 'month'] as Period[]).map((p) => (
                <button
                  key={p}
                  className={`${styles.chartToggleBtn} ${period === p ? styles.chartToggleBtnActive : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p === 'day' ? '日' : p === 'week' ? '周' : '月'}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <LineChart data={stats.userGrowthChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--lc-divider)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--lc-text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--lc-text-muted)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--lc-bg)', border: '1px solid var(--lc-border)', borderRadius: 'var(--lc-radius-md)' }}
                />
                <Line type="monotone" dataKey="count" name="新增用户" stroke="var(--lc-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>收入趋势</h3>
            <div className={styles.chartToggle}>
              {(['day', 'week', 'month'] as Period[]).map((p) => (
                <button
                  key={p}
                  className={`${styles.chartToggleBtn} ${period === p ? styles.chartToggleBtnActive : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p === 'day' ? '日' : p === 'week' ? '周' : '月'}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <LineChart data={stats.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--lc-divider)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--lc-text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--lc-text-muted)' }} tickFormatter={(v) => `¥${v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--lc-bg)', border: '1px solid var(--lc-border)', borderRadius: 'var(--lc-radius-md)' }}
                  formatter={(value) => [formatAmount(Number(value)), '收入']}
                />
                <Line type="monotone" dataKey="amount" name="收入" stroke="var(--lc-sage)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom: Top Courses + Activity Feed */}
      <div className={styles.topSection}>
        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <h3 className={styles.listTitle}>课程报名 TOP 10</h3>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <BarChart data={stats.topCourses} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--lc-divider)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--lc-text-muted)' }} />
                <YAxis type="category" dataKey="title" width={120} tick={{ fontSize: 11, fill: 'var(--lc-text-muted)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--lc-bg)', border: '1px solid var(--lc-border)', borderRadius: 'var(--lc-radius-md)' }}
                  formatter={(value) => [value, '报名人数']}
                />
                <Bar dataKey="enrollCount" name="报名人数" fill="var(--lc-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <h3 className={styles.listTitle}>近期系统活动</h3>
          </div>
          <div className={styles.listContent}>
            {activities.length > 0 ? (
              activities.slice(0, 12).map((act) => (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityDot} />
                  <div>
                    <div className={styles.activityText}>
                      <strong>{act.user?.nickname ?? '系统'}</strong> 执行了 {act.action}
                    </div>
                    <div className={styles.activityTime}>{formatDate(act.createdAt)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--lc-text-muted)', fontSize: 'var(--lc-text-sm)' }}>
                暂无系统活动
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
