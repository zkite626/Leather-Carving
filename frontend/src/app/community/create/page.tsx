'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createPost } from '@/lib/community-api';
import { useAuth } from '@/contexts/auth-context';
import type { PostType } from '@/shared/types/community';
import styles from './page.module.css';

const POST_TYPES: { value: PostType; label: string; desc: string }[] = [
  { value: 'DISCUSSION', label: '讨论', desc: '分享观点、交流经验' },
  { value: 'SHOWCASE', label: '展示', desc: '展示你的皮雕作品' },
  { value: 'QUESTION', label: '提问', desc: '寻求帮助和建议' },
  { value: 'TUTORIAL', label: '教程', desc: '分享技法和心得' },
  { value: 'CHALLENGE', label: '挑战', desc: '发起打卡挑战' },
];

const TAG_SUGGESTIONS = ['壮锦', '瑶族', '皮雕', '非遗', '手工', '教程', '入门', '纹样', '染色', '镂刻', '印花', '烙烫'];

export default function CreatePostPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [type, setType] = useState<PostType>('DISCUSSION');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: type, 2: content

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loginRequired}>
            <p>请先登录后发帖</p>
            <button onClick={() => router.push('/login')} className={styles.loginBtn}>去登录</button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddImage = () => {
    const url = imageUrlInput.trim();
    if (url && !imageUrls.includes(url) && imageUrls.length < 9) {
      setImageUrls([...imageUrls, url]);
      setImageUrlInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const res = await createPost({
        type,
        title: title.trim(),
        content: content.trim(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      if (res.data) {
        router.push(`/community/${res.data.id}`);
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>发布帖子</h1>

        {/* Step 1: Choose Type */}
        {step === 1 && (
          <div className={styles.step}>
            <h2 className={styles.stepTitle}>选择帖子类型</h2>
            <div className={styles.typeGrid}>
              {POST_TYPES.map((t) => (
                <button
                  key={t.value}
                  className={`${styles.typeCard} ${type === t.value ? styles.typeCardActive : ''}`}
                  onClick={() => { setType(t.value); setStep(2); }}
                >
                  <span className={styles.typeLabel}>{t.label}</span>
                  <span className={styles.typeDesc}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Write Content */}
        {step === 2 && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.typeIndicator}>
              <span className={styles.typeBadge}>{POST_TYPES.find(t => t.value === type)?.label}</span>
              <button type="button" className={styles.changeTypeBtn} onClick={() => setStep(1)}>更换类型</button>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>标题</label>
              <input
                type="text"
                className={styles.input}
                placeholder="起一个吸引人的标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
              <span className={styles.charCount}>{title.length}/200</span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>内容</label>
              <textarea
                className={styles.textarea}
                placeholder="支持 Markdown 格式..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>标签（最多 5 个）</label>
              <div className={styles.tagInputRow}>
                <input
                  type="text"
                  className={styles.tagInput}
                  placeholder="输入标签..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                />
                <button type="button" className={styles.addTagBtn} onClick={handleAddTag} disabled={tags.length >= 5}>添加</button>
              </div>
              <div className={styles.tagSuggestions}>
                {TAG_SUGGESTIONS.filter(s => !tags.includes(s)).slice(0, 6).map((s) => (
                  <button key={s} type="button" className={styles.suggestionTag} onClick={() => { if (tags.length < 5) setTags([...tags, s]); }}>
                    #{s}
                  </button>
                ))}
              </div>
              {tags.length > 0 && (
                <div className={styles.selectedTags}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.selectedTag}>
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)}>x</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>图片链接（最多 9 张）</label>
              <div className={styles.tagInputRow}>
                <input
                  type="text"
                  className={styles.tagInput}
                  placeholder="粘贴图片 URL..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImage(); } }}
                />
                <button type="button" className={styles.addTagBtn} onClick={handleAddImage} disabled={imageUrls.length >= 9}>添加</button>
              </div>
              {imageUrls.length > 0 && (
                <div className={styles.imagePreviewGrid}>
                  {imageUrls.map((url, i) => (
                    <div key={i} className={styles.imagePreview} style={{ position: 'relative' }}>
                      <Image src={url} alt="" fill unoptimized />
                      <button type="button" className={styles.removeImgBtn} onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}>x</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={() => router.back()}>取消</button>
              <button type="submit" className={styles.submitBtn} disabled={submitting || !title.trim() || !content.trim()}>
                {submitting ? '发布中...' : '发布帖子'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
