'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPostDetail } from '@/lib/community-api';
import { toggleFavorite, checkFavorite } from '@/lib/favorite-api';
import { getPostComments, createPostComment, deleteComment } from '@/lib/comment-api';
import { useAuth } from '@/contexts/auth-context';
import type { IPost, IComment, PostType } from '@/shared/types/community';
import styles from './page.module.css';

const POST_TYPE_LABELS: Record<PostType, string> = {
  DISCUSSION: '讨论',
  SHOWCASE: '展示',
  QUESTION: '提问',
  TUTORIAL: '教程',
  CHALLENGE: '挑战',
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const postId = params.id as string;

  const [post, setPost] = useState<IPost | null>(null);
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    const load = async () => {
      setLoading(true);
      try {
        const [postRes, commentsRes] = await Promise.all([
          getPostDetail(postId),
          getPostComments(postId),
        ]);
        if (postRes.data) {
          setPost(postRes.data);
          setLikeCount(postRes.data.likeCount);
        }
        setComments(commentsRes.data ?? []);

        if (isAuthenticated) {
          try {
            const favRes = await checkFavorite('post', postId);
            setIsLiked(favRes.data?.favorited ?? false);
          } catch {
            // ignore
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [postId, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      const res = await toggleFavorite('post', postId);
      const favorited = res.data?.favorited ?? false;
      setIsLiked(favorited);
      setLikeCount((prev) => prev + (favorited ? 1 : -1));
    } catch {
      // silently fail
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setSubmitting(true);
    try {
      const res = await createPostComment(postId, {
        content: newComment.trim(),
        parentId: replyTo || undefined,
      });
      if (res.data) {
        if (replyTo) {
          // Add reply to the parent comment's replies
          setComments((prev) =>
            prev.map((c) =>
              c.id === replyTo
                ? { ...c, replies: [...(c.replies || []), res.data!] }
                : c,
            ),
          );
        } else {
          setComments((prev) => [res.data!, ...prev]);
        }
        setNewComment('');
        setReplyTo(null);
        if (post) {
          setPost({ ...post, commentCount: post.commentCount + 1 });
        }
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      if (post) {
        setPost({ ...post, commentCount: Math.max(0, post.commentCount - 1) });
      }
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return <div className={styles.page}><div className={styles.loading}>加载中...</div></div>;
  }

  if (!post) {
    return <div className={styles.page}><div className={styles.empty}>帖子不存在</div></div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/community">社区</Link>
          <span>/</span>
          <span>{POST_TYPE_LABELS[post.type]}</span>
        </div>

        {/* Post Content */}
        <article className={styles.post}>
          <div className={styles.postHeader}>
            <div className={styles.author}>
              <div className={styles.avatar}>
                {post.author.avatar ? (
                  <img src={post.author.avatar} alt={post.author.nickname} />
                ) : (
                  <span>{post.author.nickname?.[0] || '?'}</span>
                )}
              </div>
              <div>
                <div className={styles.authorName}>{post.author.nickname}</div>
                <div className={styles.postTime}>
                  {new Date(post.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
            <span className={styles.typeBadge}>{POST_TYPE_LABELS[post.type]}</span>
          </div>

          <h1 className={styles.title}>{post.title}</h1>

          {/* Content */}
          <div className={styles.content}>
            {post.content.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className={styles.images}>
              {post.images.map((img, i) => (
                <div key={i} className={styles.imageItem} onClick={() => setLightboxImg(img)}>
                  <img src={img} alt={`图片 ${i + 1}`} />
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <Link key={tag} href={`/community?keyword=${tag}`} className={styles.tag}>
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`} onClick={handleLike}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {likeCount} 赞
            </button>
            <span className={styles.actionBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {post.viewCount} 浏览
            </span>
            <span className={styles.actionBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {post.commentCount} 评论
            </span>
          </div>
        </article>

        {/* Comments Section */}
        <section className={styles.commentsSection}>
          <h2 className={styles.commentsTitle}>评论 ({post.commentCount})</h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form className={styles.commentForm} onSubmit={handleSubmitComment}>
              {replyTo && (
                <div className={styles.replyIndicator}>
                  回复评论
                  <button type="button" onClick={() => setReplyTo(null)}>取消</button>
                </div>
              )}
              <textarea
                className={styles.commentInput}
                placeholder={replyTo ? '写下你的回复...' : '写下你的评论...'}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <button type="submit" className={styles.submitBtn} disabled={submitting || !newComment.trim()}>
                {submitting ? '发送中...' : '发表评论'}
              </button>
            </form>
          ) : (
            <div className={styles.loginPrompt}>
              <Link href="/login">登录</Link> 后参与讨论
            </div>
          )}

          {/* Comments List */}
          <div className={styles.commentsList}>
            {comments.map((comment) => (
              <div key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAuthor}>
                    <div className={styles.commentAvatar}>
                      {comment.user.avatar ? (
                        <img src={comment.user.avatar} alt={comment.user.nickname} />
                      ) : (
                        <span>{comment.user.nickname?.[0] || '?'}</span>
                      )}
                    </div>
                    <span className={styles.commentAuthorName}>{comment.user.nickname}</span>
                  </div>
                  <span className={styles.commentTime}>
                    {new Date(comment.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
                <div className={styles.commentActions}>
                  <button className={styles.replyBtn} onClick={() => setReplyTo(comment.id)}>回复</button>
                  {user?.id === comment.userId && (
                    <button className={styles.deleteBtn} onClick={() => handleDeleteComment(comment.id)}>删除</button>
                  )}
                </div>

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className={styles.replies}>
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className={styles.reply}>
                        <div className={styles.commentHeader}>
                          <div className={styles.commentAuthor}>
                            <div className={styles.commentAvatarSmall}>
                              {reply.user.avatar ? (
                                <img src={reply.user.avatar} alt={reply.user.nickname} />
                              ) : (
                                <span>{reply.user.nickname?.[0] || '?'}</span>
                              )}
                            </div>
                            <span className={styles.commentAuthorName}>{reply.user.nickname}</span>
                          </div>
                          <span className={styles.commentTime}>
                            {new Date(reply.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <p className={styles.commentContent}>{reply.content}</p>
                        {user?.id === reply.userId && (
                          <button className={styles.deleteBtn} onClick={() => handleDeleteComment(reply.id)}>删除</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {comments.length === 0 && <div className={styles.emptyComments}>暂无评论，快来发表第一条评论吧</div>}
          </div>
        </section>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div className={styles.lightbox} onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="" />
        </div>
      )}
    </div>
  );
}
