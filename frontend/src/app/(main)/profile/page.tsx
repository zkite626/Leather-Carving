'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, LockKeyhole, Save, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/lib/auth-api';
import { uploadImage } from '@/lib/upload-api';
import { Button } from '@/components/ui/button/button';
import { PageHero } from '@/components/ui/page-hero/page-hero';
import styles from './page.module.css';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: '超级管理员',
  ADMIN: '管理员',
  TEACHER: '教师',
  MERCHANT: '商家',
  LEARNER: '学员',
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    nickname: user?.nickname ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
    avatar: user?.avatar ?? '',
  });
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const syncFromUser = () => {
    setProfile({
      nickname: user?.nickname ?? '',
      phone: user?.phone ?? '',
      bio: user?.bio ?? '',
      avatar: user?.avatar ?? '',
    });
  };

  useEffect(() => {
    queueMicrotask(syncFromUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync form when authenticated user changes
  }, [user?.id]);

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    setError('');
    setMessage('');
    try {
      const result = await uploadImage(file, 'avatar');
      setProfile((prev) => ({ ...prev, avatar: result.url }));
    } catch {
      setError('头像上传失败，请稍后重试');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    setError('');
    setMessage('');
    try {
      await authApi.updateProfile({
        nickname: profile.nickname.trim(),
        phone: profile.phone.trim() || undefined,
        bio: profile.bio.trim() || undefined,
        avatar: profile.avatar || undefined,
      });
      await refreshUser();
      setMessage('个人信息已保存');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? '保存失败，请检查填写内容');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingPassword(true);
    setError('');
    setMessage('');
    try {
      if (password.newPassword !== password.confirmPassword) {
        setError('两次输入的新密码不一致');
        return;
      }
      await authApi.changePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('密码已更新');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? '密码修改失败');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <PageHero title="个人中心" subtitle="查看资料、更新联系方式与维护账号安全" />

      <main className={styles.container}>
        <section className={styles.summary}>
          <div className={styles.avatar}>
            {profile.avatar ? (
              <Image src={profile.avatar} alt={user.nickname} fill unoptimized />
            ) : (
              <span>{user.nickname.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className={styles.eyebrow}>{roleLabels[user.role] ?? user.role}</p>
            <h2 className={styles.name}>{user.nickname}</h2>
            <p className={styles.email}>{user.email}</p>
          </div>
        </section>

        {(message || error) && (
          <div className={`${styles.notice} ${error ? styles.noticeError : styles.noticeSuccess}`}>
            {error || message}
          </div>
        )}

        <div className={styles.grid}>
          <form className={styles.card} onSubmit={handleProfileSubmit}>
            <div className={styles.cardHeader}>
              <UserRound size={20} />
              <h3>个人信息</h3>
            </div>

            <div className={styles.avatarRow}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Camera />}
                loading={uploading}
                onClick={() => fileRef.current?.click()}
              >
                更换头像
              </Button>
              {profile.avatar && (
                <Button
                  type="button"
                  variant="text"
                  size="sm"
                  onClick={() => setProfile((prev) => ({ ...prev, avatar: '' }))}
                >
                  移除头像
                </Button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleAvatarUpload(file);
                }}
              />
            </div>

            <label className={styles.field}>
              <span>昵称</span>
              <input
                value={profile.nickname}
                onChange={(event) => setProfile({ ...profile, nickname: event.target.value })}
                maxLength={50}
                required
              />
            </label>
            <label className={styles.field}>
              <span>手机号</span>
              <input
                value={profile.phone}
                onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                placeholder="未设置"
                inputMode="tel"
              />
            </label>
            <label className={styles.field}>
              <span>简介</span>
              <textarea
                value={profile.bio}
                onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
                maxLength={500}
                rows={5}
                placeholder="介绍一下自己..."
              />
            </label>

            <div className={styles.actions}>
              <Button type="button" variant="ghost" size="sm" onClick={syncFromUser}>
                重置
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<Save />} loading={savingProfile}>
                保存资料
              </Button>
            </div>
          </form>

          <form className={styles.card} onSubmit={handlePasswordSubmit}>
            <div className={styles.cardHeader}>
              <LockKeyhole size={20} />
              <h3>修改密码</h3>
            </div>
            <label className={styles.field}>
              <span>当前密码</span>
              <input
                type="password"
                value={password.currentPassword}
                onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })}
                required
              />
            </label>
            <label className={styles.field}>
              <span>新密码</span>
              <input
                type="password"
                value={password.newPassword}
                onChange={(event) => setPassword({ ...password, newPassword: event.target.value })}
                minLength={8}
                required
              />
            </label>
            <label className={styles.field}>
              <span>确认新密码</span>
              <input
                type="password"
                value={password.confirmPassword}
                onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })}
                minLength={8}
                required
              />
            </label>
            <div className={styles.passwordHint}>
              密码至少 8 位，并包含大写字母、小写字母和数字。
            </div>
            <div className={styles.actions}>
              <Button type="submit" variant="primary" size="sm" icon={<LockKeyhole />} loading={savingPassword}>
                更新密码
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
