'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  createArtwork,
  addArtworkImages,
  setArtworkCover,
  deleteArtworkImage,
  submitArtwork,
  uploadImage,
} from '@/lib/artwork-api';
import { Button } from '@/components/ui/button/button';
import type { IArtworkImage } from '@/shared/types/community';
import Image from 'next/image';
import styles from './page.module.css';

const TECHNIQUES = ['镂刻', '印花', '染色', '烙烫', '浮雕', '编织', '镶嵌', '彩绘'];
const MATERIALS = ['牛皮', '羊皮', '马皮', '猪皮', '植鞣皮', '铬鞣皮'];
const CATEGORIES = ['壮锦', '瑶族', '喀斯特', '现代融合', '传统经典', '创意实验'];

export default function CreateArtworkPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [techniques, setTechniques] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [story, setStory] = useState('');
  const [images, setImages] = useState<IArtworkImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [artworkId, setArtworkId] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<{ file: File; url: string }[]>([]);

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (images.length + files.length > 9) {
      setError('最多上传 9 张图片');
      return;
    }

    // Show local previews immediately
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    setError('');
  };

  const removePreview = (index: number) => {
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('请输入作品标题');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Create artwork
      const res = await createArtwork({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        techniques,
        materials,
        story: story.trim() || undefined,
      });

      const newArtworkId = res.data!.id;
      setArtworkId(newArtworkId);

      // Upload images if any
      if (previewUrls.length > 0) {
        setUploading(true);
        const uploadedUrls: string[] = [];
        for (const preview of previewUrls) {
          const { url } = await uploadImage(preview.file, 'artwork');
          uploadedUrls.push(url);
        }

        const imgRes = await addArtworkImages(newArtworkId, uploadedUrls);
        setImages(imgRes.data ?? []);
        setUploading(false);
      }

      // Submit for review
      await submitArtwork(newArtworkId);
      router.push('/my-artworks');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message || '发布失败，请重试');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    if (!artworkId) return;
    try {
      await deleteArtworkImage(artworkId, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {}
  };

  const handleSetCover = async (imageId: string) => {
    if (!artworkId) return;
    try {
      await setArtworkCover(artworkId, imageId);
    } catch {}
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.heading}>发布作品</h1>

        {/* Image Upload */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>作品图片</h2>
          <p className={styles.sectionHint}>最多 9 张，第一张默认为封面</p>

          <div className={styles.imageGrid}>
            {/* Existing uploaded images */}
            {images.map((img) => (
              <div key={img.id} className={styles.imageItem} style={{ position: 'relative' }}>
                <Image src={img.url} alt="" className={styles.imageThumb} fill unoptimized />
                <div className={styles.imageActions}>
                  <button
                    type="button"
                    onClick={() => handleSetCover(img.id)}
                    className={styles.imageActionBtn}
                  >
                    设为封面
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(img.id)}
                    className={styles.imageDeleteBtn}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}

            {/* Local previews */}
            {previewUrls.map((p, idx) => (
              <div key={idx} className={styles.imageItem} style={{ position: 'relative' }}>
                <Image src={p.url} alt="" className={styles.imageThumb} fill unoptimized />
                <button
                  type="button"
                  onClick={() => removePreview(idx)}
                  className={styles.removePreviewBtn}
                >
                  &times;
                </button>
              </div>
            ))}

            {/* Upload button */}
            {(images.length + previewUrls.length) < 9 && (
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>添加图片</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className={styles.hiddenInput}
          />
        </section>

        {/* Basic Info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>基本信息</h2>

          <div className={styles.field}>
            <label className={styles.label}>作品标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="为你的作品起个名字"
              className={styles.input}
              maxLength={200}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>作品描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述你的作品"
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>分类</label>
            <div className={styles.chipGroup}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.chip} ${category === cat ? styles.chipActive : ''}`}
                  onClick={() => setCategory(category === cat ? '' : cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Techniques & Materials */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>技法与材料</h2>

          <div className={styles.field}>
            <label className={styles.label}>技法（可多选）</label>
            <div className={styles.chipGroup}>
              {TECHNIQUES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.chip} ${techniques.includes(t) ? styles.chipActive : ''}`}
                  onClick={() => setTechniques(toggleArrayItem(techniques, t))}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>材料（可多选）</label>
            <div className={styles.chipGroup}>
              {MATERIALS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`${styles.chip} ${materials.includes(m) ? styles.chipActive : ''}`}
                  onClick={() => setMaterials(toggleArrayItem(materials, m))}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>创作故事</h2>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="分享你的创作灵感和过程..."
            className={styles.textarea}
            rows={6}
          />
        </section>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button
            variant="primary"
            fullWidth
            loading={submitting || uploading}
            onClick={handleCreate}
          >
            {uploading ? '上传图片中...' : '发布作品'}
          </Button>
        </div>
      </div>
    </div>
  );
}
