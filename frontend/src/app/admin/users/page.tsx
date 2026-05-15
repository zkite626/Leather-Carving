'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { getAdminUsers, createUser, updateAdminUser, updateUserRole, updateUserStatus, deleteAdminUser, uploadImage, type AdminUser, type PaginatedResult } from '@/lib/admin-api';
import styles from './page.module.css';

const ROLE_OPTIONS = ['LEARNER', 'TEACHER', 'MERCHANT', 'ADMIN'];
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'BANNED'];

const roleLabels: Record<string, string> = { LEARNER: '学员', TEACHER: '教师', MERCHANT: '商家', ADMIN: '管理员', SUPER_ADMIN: '超管' };
const statusLabels: Record<string, string> = { ACTIVE: '正常', INACTIVE: '未激活', BANNED: '已封禁' };

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

interface UserForm {
  email: string; password: string; nickname: string; role: string; phone: string;
  editNickname: string; editPhone: string; editBio: string;
  editEmail: string; editRole: string; editAvatar: string;
}

const emptyForm: UserForm = {
  email: '', password: '', nickname: '', role: 'LEARNER', phone: '',
  editNickname: '', editPhone: '', editBio: '',
  editEmail: '', editRole: 'LEARNER', editAvatar: '',
};

export default function AdminUsersPage() {
  const [data, setData] = useState<PaginatedResult<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ userId: string; action: string; label: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = { page, pageSize: 20 };
      if (keyword) params.keyword = keyword;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      setData(await getAdminUsers(params));
    } catch { /* */ } finally { setLoading(false); }
  }, [page, keyword, roleFilter, statusFilter]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try { await updateUserRole(userId, newRole); fetchData(); } catch { /* */ }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try { await updateUserStatus(userId, newStatus); setConfirmModal(null); fetchData(); } catch { /* */ }
  };

  const handleCreate = async () => {
    if (!form.email || !form.password || !form.nickname) return;
    try {
      setSaving(true);
      await createUser({ email: form.email, password: form.password, nickname: form.nickname, role: form.role, phone: form.phone || undefined });
      setShowCreateModal(false);
      setForm({ ...emptyForm });
      fetchData();
    } catch { /* */ } finally { setSaving(false); }
  };

  const openEdit = async (userId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''}` },
      });
      const json = await res.json();
      const u = json.data;
      if (u) {
        setForm({
          ...emptyForm,
          editNickname: u.nickname ?? '',
          editPhone: u.phone ?? '',
          editBio: u.bio ?? '',
          editEmail: u.email ?? '',
          editRole: u.role ?? 'LEARNER',
          editAvatar: u.avatar ?? '',
        });
        setShowEditModal(userId);
      }
    } catch { /* */ }
  };

  const handleEdit = async () => {
    if (!showEditModal) return;
    try {
      setSaving(true);
      await Promise.all([
        updateAdminUser(showEditModal, {
          nickname: form.editNickname,
          phone: form.editPhone || null,
          bio: form.editBio || null,
          avatar: form.editAvatar || null,
        }),
        updateUserRole(showEditModal, form.editRole),
      ]);
      setShowEditModal(null);
      fetchData();
    } catch { /* */ } finally { setSaving(false); }
  };

  const handleDelete = async (userId: string, nickname: string) => {
    if (!confirm(`确认删除用户「${nickname}」？此操作不可恢复。`)) return;
    try { await deleteAdminUser(userId); fetchData(); } catch { /* */ }
  };

  const users = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--lc-space-3)' }}>
          <h1 className={styles.pageTitle}>用户管理</h1>
          <span style={{ fontSize: 'var(--lc-text-sm)', color: 'var(--lc-text-muted)' }}>共 {total} 位用户</span>
        </div>
        <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={() => { setForm({ ...emptyForm }); setShowCreateModal(true); }}>
          + 新建用户
        </button>
      </div>

      <div className={styles.filters}>
        <input className={styles.searchInput} placeholder="搜索昵称、邮箱..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
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
              <th style={{ textAlign: 'center' }}>统计</th>
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
                      <div className={styles.userAvatar} style={{ position: 'relative' }}>
                        {u.avatar ? <Image src={u.avatar} alt={u.nickname} fill unoptimized /> : u.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{u.nickname}</span>
                        <span className={styles.userEmail}>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select className={styles.roleSelect} value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} disabled={u.role === 'SUPER_ADMIN'}>
                      {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                    </select>
                  </td>
                  <td>
                    <span className={`${styles.tag} ${u.status === 'ACTIVE' ? styles.tagActive : u.status === 'BANNED' ? styles.tagBanned : styles.tagInactive}`}>
                      {statusLabels[u.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <span className={styles.statPill} title="作品">{u._count.artworks}<span className={styles.statLabel}>作</span></span>
                      <span className={styles.statPill} title="订单">{u._count.orders}<span className={styles.statLabel}>订</span></span>
                      <span className={styles.statPill} title="课程">{u._count.enrollments}<span className={styles.statLabel}>课</span></span>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--lc-text-xs)', color: 'var(--lc-text-muted)', whiteSpace: 'nowrap' }}>{formatDate(u.createdAt)}</td>
                  <td style={{ fontSize: 'var(--lc-text-xs)', color: 'var(--lc-text-muted)', whiteSpace: 'nowrap' }}>{formatDate(u.lastLoginAt)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={`${styles.iconBtn} ${styles.iconBtnPrimary}`} title="编辑" onClick={() => openEdit(u.id)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      {u.status === 'BANNED' ? (
                        <button className={`${styles.iconBtn} ${styles.iconBtnSuccess}`} title="解封" onClick={() => handleStatusChange(u.id, 'ACTIVE')} disabled={u.role === 'SUPER_ADMIN'}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </button>
                      ) : (
                        <button className={`${styles.iconBtn} ${styles.iconBtnWarn}`} title="封禁" onClick={() => setConfirmModal({ userId: u.id, action: 'BANNED', label: `封禁用户 ${u.nickname}?` })} disabled={u.role === 'SUPER_ADMIN'}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                        </button>
                      )}
                      <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="删除" onClick={() => handleDelete(u.id, u.nickname)} disabled={u.role === 'SUPER_ADMIN'}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>第 {page} / {totalPages} 页，共 {total} 条</span>
            <div className={styles.paginationBtns}>
              <button className={styles.paginationBtn} disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p > totalPages) return null;
                return <button key={p} className={`${styles.paginationBtn} ${p === page ? styles.paginationBtnActive : ''}`} onClick={() => setPage(p)}>{p}</button>;
              })}
              <button className={styles.paginationBtn} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</button>
            </div>
          </div>
        )}
      </div>

      {/* 封禁确认弹窗 */}
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

      {/* 新建用户弹窗 */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>新建用户</h3>
            <div style={{ display: 'grid', gap: 'var(--lc-space-3)', marginBottom: 'var(--lc-space-4)' }}>
              <div>
                <label className={styles.formLabel}>邮箱 *</label>
                <input className={styles.formInput} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" />
              </div>
              <div>
                <label className={styles.formLabel}>密码 *</label>
                <input className={styles.formInput} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="至少6位" />
              </div>
              <div>
                <label className={styles.formLabel}>昵称 *</label>
                <input className={styles.formInput} value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
              </div>
              <div>
                <label className={styles.formLabel}>角色</label>
                <select className={styles.formSelect} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.formLabel}>手机号</label>
                <input className={styles.formInput} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="可选" />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalBtn} onClick={() => setShowCreateModal(false)}>取消</button>
              <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={handleCreate} disabled={saving}>{saving ? '创建中...' : '创建'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑用户弹窗 */}
      {showEditModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(null)}>
          <div className={styles.modalContent} style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>编辑用户</h3>
            <div style={{ display: 'grid', gap: 'var(--lc-space-3)', marginBottom: 'var(--lc-space-4)' }}>
              {/* 头像 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--lc-space-3)' }}>
                <div className={styles.userAvatar} style={{ width: 56, height: 56, fontSize: 'var(--lc-text-xl)', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                  onClick={() => document.getElementById('avatar-upload')?.click()}>
                  {form.editAvatar ? <Image src={form.editAvatar} alt="avatar" fill unoptimized /> : form.editNickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <button className={styles.modalBtn} onClick={() => document.getElementById('avatar-upload')?.click()}>更换头像</button>
                  {form.editAvatar && <button className={styles.modalBtn} style={{ marginLeft: 8 }} onClick={() => setForm({ ...form, editAvatar: '' })}>移除</button>}
                  <input id="avatar-upload" type="file" accept="image/*" hidden onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try { const result = await uploadImage(file, 'avatar'); setForm({ ...form, editAvatar: result.url }); } catch { /* */ }
                  }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--lc-space-3)' }}>
                <div>
                  <label className={styles.formLabel}>邮箱</label>
                  <input className={styles.formInput} value={form.editEmail} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label className={styles.formLabel}>昵称 *</label>
                  <input className={styles.formInput} value={form.editNickname} onChange={(e) => setForm({ ...form, editNickname: e.target.value })} />
                </div>
                <div>
                  <label className={styles.formLabel}>手机号</label>
                  <input className={styles.formInput} value={form.editPhone} onChange={(e) => setForm({ ...form, editPhone: e.target.value })} />
                </div>
                <div>
                  <label className={styles.formLabel}>角色</label>
                  <select className={styles.formSelect} value={form.editRole} onChange={(e) => setForm({ ...form, editRole: e.target.value })}>
                    {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={styles.formLabel}>简介</label>
                <textarea className={styles.formTextarea} value={form.editBio} onChange={(e) => setForm({ ...form, editBio: e.target.value })} rows={3} />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalBtn} onClick={() => setShowEditModal(null)}>取消</button>
              <button className={`${styles.modalBtn} ${styles.modalBtnPrimary}`} onClick={handleEdit} disabled={saving}>{saving ? '保存中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
