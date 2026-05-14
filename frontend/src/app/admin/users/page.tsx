'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getAdminUsers, updateUserRole, updateUserStatus, type AdminUser, type PaginatedResult } from '@/lib/admin-api';
import styles from './page.module.css';

const ROLE_OPTIONS = ['LEARNER', 'TEACHER', 'MERCHANT', 'ADMIN'];
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'BANNED'];

const roleLabels: Record<string, string> = { LEARNER: '学员', TEACHER: '教师', MERCHANT: '商家', ADMIN: '管理员', SUPER_ADMIN: '超管' };
const statusLabels: Record<string, string> = { ACTIVE: '正常', INACTIVE: '未激活', BANNED: '已封禁' };

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function AdminUsersPage() {
  const [data, setData] = useState<PaginatedResult<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ userId: string; action: string; label: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = { page, pageSize: 20 };
      if (keyword) params.keyword = keyword;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const result = await getAdminUsers(params);
      setData(result);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  }, [page, keyword, roleFilter, statusFilter]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching pattern
  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      fetchData();
    } catch { /* handled */ }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await updateUserStatus(userId, newStatus);
      setConfirmModal(null);
      fetchData();
    } catch { /* handled */ }
  };

  const users = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>用户管理</h1>
        <span style={{ fontSize: 'var(--lc-text-sm)', color: 'var(--lc-text-muted)' }}>共 {total} 位用户</span>
      </div>

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="搜索昵称、邮箱..."
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
        />
        <select className={styles.select} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">全部角色</option>
          {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
        </select>
        <select className={styles.select} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">全部状态</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>用户</th>
              <th>角色</th>
              <th>状态</th>
              <th>作品/订单/课程</th>
              <th>注册时间</th>
              <th>最后登录</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--lc-text-muted)' }}>加载中...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--lc-text-muted)' }}>暂无数据</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>
                        {u.avatar ? <img src={u.avatar} alt={u.nickname} /> : u.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{u.nickname}</span>
                        <span className={styles.userEmail}>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      className={styles.roleSelect}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.role === 'SUPER_ADMIN'}
                    >
                      {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                    </select>
                  </td>
                  <td>
                    <span className={`${styles.tag} ${u.status === 'ACTIVE' ? styles.tagActive : u.status === 'BANNED' ? styles.tagBanned : styles.tagInactive}`}>
                      {statusLabels[u.status]}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--lc-text-xs)', color: 'var(--lc-text-secondary)' }}>
                    {u._count.artworks} / {u._count.orders} / {u._count.enrollments}
                  </td>
                  <td style={{ fontSize: 'var(--lc-text-xs)', color: 'var(--lc-text-muted)' }}>{formatDate(u.createdAt)}</td>
                  <td style={{ fontSize: 'var(--lc-text-xs)', color: 'var(--lc-text-muted)' }}>{formatDate(u.lastLoginAt)}</td>
                  <td>
                    <div className={styles.actions}>
                      {u.status === 'BANNED' ? (
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                          disabled={u.role === 'SUPER_ADMIN'}
                        >
                          解封
                        </button>
                      ) : (
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => setConfirmModal({ userId: u.id, action: 'BANNED', label: `封禁用户 ${u.nickname}?` })}
                          disabled={u.role === 'SUPER_ADMIN'}
                        >
                          封禁
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              第 {page} / {totalPages} 页，共 {total} 条
            </span>
            <div className={styles.paginationBtns}>
              <button className={styles.paginationBtn} disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    className={`${styles.paginationBtn} ${p === page ? styles.paginationBtnActive : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button className={styles.paginationBtn} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</button>
            </div>
          </div>
        )}
      </div>

      {confirmModal && (
        <div className={styles.modalOverlay} onClick={() => setConfirmModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>确认操作</h3>
            <p className={styles.modalText}>{confirmModal.label}</p>
            <div className={styles.modalActions}>
              <button className={styles.modalBtn} onClick={() => setConfirmModal(null)}>取消</button>
              <button className={`${styles.modalBtn} ${styles.modalBtnDanger}`} onClick={() => handleStatusChange(confirmModal.userId, confirmModal.action)}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
