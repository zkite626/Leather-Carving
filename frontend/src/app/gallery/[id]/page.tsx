'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getArtworkById, getRelatedArtworks } from '@/lib/artwork-api';
import { toggleFavorite, checkFavorite } from '@/lib/favorite-api';
import { getArtworkComments, createArtworkComment, deleteComment } from '@/lib/comment-api';
import { ArtworkCard } from '@/components/artwork/artwork-card/artwork-card';
import type { IArtwork, IComment } from '@/shared/types/community';
import styles from './page.module.css';

export default function ArtworkDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [artwork, setArtwork] = useState<IArtwork | null>(null);
  const [related, setRelated] = useState<IArtwork[]>([]);
  const [comments, setComments] = useState<IComment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<IComment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchArtwork = useCallback(async () => {
    try {
      const res = await getArtworkById(id);
      setArtwork(res.data);
    } catch {
      // handle error
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await getArtworkComments(id);
      const data = res.data as unknown as { data: IComment[]; pagination: { total: number } };
      setComments(data.data ?? []);
      setCommentTotal(data.pagination?.total ?? 0);
    } catch {}
  }, [id]);

  const fetchRelated = useCallback(async () => {
    try {
      const res = await getRelatedArtworks(id);
      setRelated(res.data ?? []);
    } catch {}
  }, [id]);

  const fetchFavorite = useCallback(async () => {
    try {
      const res = await checkFavorite('artwork', id);
      setIsFavorited(res.data?.favorited ?? false);
    } catch {}
  }, [id]);

  useEffect(() => {
    void fetchArtwork(); // eslint-disable-line react-hooks/set-state-in-effect -- data fetching pattern
    void fetchComments();
    void fetchRelated();
    void fetchFavorite();
  }, [fetchArtwork, fetchComments, fetchRelated, fetchFavorite]);

  const handleToggleFavorite = async () => {
    setLikeAnimating(true);
    try {
      const res = await toggleFavorite('artwork', id);
      setIsFavorited(res.data?.favorited ?? false);
      setArtwork((prev) =>
        prev
          ? { ...prev, likeCount: prev.likeCount + (res.data?.favorited ? 1 : -1) }
          : prev,
      );
    } catch {}
    setTimeout(() => setLikeAnimating(false), 400);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    try {
      await createArtworkComment(id, {
        content: commentText.trim(),
        parentId: replyTo?.id,
      });
      setCommentText('');
      setReplyTo(null);
      fetchComments();
    } catch {}
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      fetchComments();
    } catch {}
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const navigateLightbox = (dir: number) => {
    if (!artwork?.images) return;
    const next = lightboxIndex + dir;
    if (next >= 0 && next < artwork.images.length) {
      setLightboxIndex(next);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  });

  if (!artwork) {
    return <div className={styles.loading}>加载中...</div>;
  }

  const images = artwork.images ?? [];
  const has3D = artwork.is3D && artwork.modelUrl;

  return (
    <div className={styles.page}>
      {/* Image Gallery */}
      <div className={styles.gallery}>
        <div className={styles.mainImage} onClick={() => openLightbox(0)}>
          <img
            src={images[0]?.url || artwork.coverImage || '/images/placeholders/artwork-placeholder.png'}
            alt={artwork.title}
            className={styles.heroImage}
          />
        </div>
        {images.length > 1 && (
          <div className={styles.thumbnails}>
            {images.map((img, idx) => (
              <button
                key={img.id}
                className={styles.thumbnail}
                onClick={() => openLightbox(idx)}
              >
                <img src={img.url} alt={img.caption || ''} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.infoSection}>
        <div className={styles.infoMain}>
          <h1 className={styles.title}>{artwork.title}</h1>

          <div className={styles.authorBar}>
            {artwork.user?.avatar ? (
              <img src={artwork.user.avatar} alt="" className={styles.authorAvatar} />
            ) : (
              <div className={styles.authorAvatarPlaceholder}>
                {artwork.user?.nickname?.[0] ?? '?'}
              </div>
            )}
            <span className={styles.authorName}>{artwork.user?.nickname}</span>
            <span className={styles.date}>
              {new Date(artwork.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>

          {artwork.description && (
            <p className={styles.description}>{artwork.description}</p>
          )}

          {/* Tags */}
          <div className={styles.tagSection}>
            {artwork.techniques?.length > 0 && (
              <div className={styles.tagGroup}>
                <span className={styles.tagLabel}>技法</span>
                {artwork.techniques.map((t) => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            )}
            {artwork.materials?.length > 0 && (
              <div className={styles.tagGroup}>
                <span className={styles.tagLabel}>材料</span>
                {artwork.materials.map((m) => (
                  <span key={m} className={styles.tag}>{m}</span>
                ))}
              </div>
            )}
          </div>

          {/* Story */}
          {artwork.story && (
            <div className={styles.story}>
              <h3 className={styles.storyTitle}>创作故事</h3>
              <div className={styles.storyContent}>{artwork.story}</div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              className={`${styles.actionBtn} ${isFavorited ? styles.actionBtnActive : ''} ${likeAnimating ? styles.likeAnim : ''}`}
              onClick={handleToggleFavorite}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{artwork.likeCount}</span>
            </button>
          </div>
        </div>

        {/* 3D Viewer placeholder */}
        {has3D && (
          <div className={styles.viewer3d}>
            <h3 className={styles.sectionTitle}>3D 模型预览</h3>
            <div className={styles.viewer3dPlaceholder}>
              <p>3D 模型加载中...</p>
              <p className={styles.viewer3dNote}>
                支持 glTF/GLB 格式，可通过鼠标旋转/缩放查看
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Comments */}
      <section className={styles.commentsSection}>
        <h3 className={styles.sectionTitle}>评论 ({commentTotal})</h3>

        <form onSubmit={handleSubmitComment} className={styles.commentForm}>
          {replyTo && (
            <div className={styles.replyIndicator}>
              回复 {replyTo.user?.nickname}
              <button type="button" onClick={() => setReplyTo(null)} className={styles.replyCancel}>
                取消
              </button>
            </div>
          )}
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="写下你的评论..."
            className={styles.commentTextarea}
            rows={3}
          />
          <button type="submit" disabled={!commentText.trim() || submitting} className={styles.commentSubmit}>
            发表评论
          </button>
        </form>

        <div className={styles.commentList}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              onReply={setReplyTo}
              onDelete={handleDeleteComment}
            />
          ))}
          {comments.length === 0 && (
            <p className={styles.noComments}>暂无评论，快来第一个留言吧</p>
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <h3 className={styles.sectionTitle}>相关作品</h3>
          <div className={styles.relatedGrid}>
            {related.map((art) => (
              <ArtworkCard key={art.id} artwork={art} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={closeLightbox}>
              &times;
            </button>
            <img
              src={images[lightboxIndex]?.url}
              alt=""
              className={styles.lightboxImage}
            />
            {lightboxIndex > 0 && (
              <button
                className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                onClick={() => navigateLightbox(-1)}
              >
                &#8249;
              </button>
            )}
            {lightboxIndex < images.length - 1 && (
              <button
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={() => navigateLightbox(1)}
              >
                &#8250;
              </button>
            )}
            <div className={styles.lightboxCounter}>
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  depth,
  onReply,
  onDelete,
}: {
  comment: IComment;
  depth: number;
  onReply: (c: IComment) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`${styles.comment} ${depth > 0 ? styles.commentNested : ''}`}>
      <div className={styles.commentHeader}>
        {comment.user?.avatar ? (
          <img src={comment.user.avatar} alt="" className={styles.commentAvatar} />
        ) : (
          <div className={styles.commentAvatarPlaceholder}>
            {comment.user?.nickname?.[0] ?? '?'}
          </div>
        )}
        <span className={styles.commentAuthor}>{comment.user?.nickname}</span>
        <span className={styles.commentDate}>
          {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
        </span>
      </div>
      <p className={styles.commentContent}>{comment.content}</p>
      <div className={styles.commentActions}>
        {depth < 2 && (
          <button className={styles.commentAction} onClick={() => onReply(comment)}>
            回复
          </button>
        )}
        <button className={styles.commentAction} onClick={() => onDelete(comment.id)}>
          删除
        </button>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
