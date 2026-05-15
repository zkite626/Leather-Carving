'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { uploadImage } from '@/lib/admin-api';
import { authApi } from '@/lib/auth-api';
import styles from './page.module.css';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: '超级管理员', ADMIN: '管理员', TEACHER: '教师', MERCHANT: '商家', LEARNER: '学员',
};

export default function AdminProfilePage() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nickname: '', phone: '', bio: '', avatar: '',
  });

  const startEdit = () => {
    setForm({
      nickname: user?.nickname ?? '',
      phone: user?.phone ?? '',
      bio: user?.bio ?? '',
      avatar: user?.avatar ?? '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile({
        nickname: form.nickname,
        avatar: form.avatar || undefined,
        bio: form.bio || undefined,
      });
      // phone 需要通过 admin API 更新
      if (user?.id) {
        const { updateAdminUser } = await import('@/lib/admin-api');
        await updateAdminUser(user.id, { phone: form.phone || null });
      }
      await refreshUser();
      setEditing(false);
    } catch { /* */ } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadImage(file, 'avatar');
      setForm((prev) => ({ ...prev, avatar: result.url }));
    } catch { /* */ } finally { setUploading(false); }
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>个人信息</h1>
          {!editing && (
            <button className={styles.editBtn} onClick={startEdit}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              编辑
            </button>
          )}
        </div>

        <div className={styles.body}>
          {/* 头像 */}
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {editing && form.avatar ? (
                <Image src={form.avatar} alt="avatar" fill unoptimized />
              ) : user.avatar ? (
                <Image src={user.avatar} alt={user.nickname} fill unoptimized />
              ) : (
                user.nickname.charAt(0).toUpperCase()
              )}
            </div>
            {editing && (
              <div className={styles.avatarActions}>
                <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? '上传中...' : '更换头像'}
                </button>
                {form.avatar && (
                  <button className={styles.removeBtn} onClick={() => setForm({ ...form, avatar: '' })}>移除</button>
                )}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAvatarUpload(f);
                }} />
              </div>
            )}
          </div>

          {/* 信息 */}
          <div className={styles.infoGrid}>
            <div className={styles.field}>
              <label className={styles.label}>邮箱</label>
              <div className={styles.value}>{user.email}</div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>角色</label>
              <div className={styles.value}>{roleLabels[user.role] ?? user.role}</div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>昵称</label>
              {editing ? (
                <input className={styles.input} value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
              ) : (
                <div className={styles.value}>{user.nickname}</div>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>手机号</label>
              {editing ? (
                <input className={styles.input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="未设置" />
              ) : (
                <div className={styles.value}>{user.phone || '未设置'}</div>
              )}
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>简介</label>
              {editing ? (
                <textarea className={styles.textarea} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="介绍一下自己..." />
              ) : (
                <div className={styles.value}>{user.bio || '暂无简介'}</div>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>注册时间</label>
              <div className={styles.value}>{new Date(user.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>邮箱验证</label>
              <div className={styles.value}>{user.emailVerified ? '已验证' : '未验证'}</div>
            </div>
          </div>

          {/* 操作按钮 */}
          {editing && (
            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={() => setEditing(false)}>取消</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
