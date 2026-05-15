import type { IUserPublic } from './user';
export type PostType = 'DISCUSSION' | 'SHOWCASE' | 'QUESTION' | 'TUTORIAL' | 'CHALLENGE';
export type PostStatus = 'PUBLISHED' | 'HIDDEN' | 'DELETED';
export interface IArtwork {
    id: string;
    userId: string;
    title: string;
    description?: string;
    coverImage: string;
    category?: string;
    tags: string[];
    techniques: string[];
    materials: string[];
    status: 'DRAFT' | 'REVIEWING' | 'PUBLISHED' | 'REJECTED';
    viewCount: number;
    likeCount: number;
    is3D: boolean;
    modelUrl?: string;
    story?: string;
    images: IArtworkImage[];
    user: IUserPublic;
    createdAt: string;
    updatedAt: string;
}
export interface IArtworkImage {
    id: string;
    url: string;
    caption?: string;
    sortOrder: number;
}
export interface IPost {
    id: string;
    type: PostType;
    title: string;
    content: string;
    images: string[];
    tags: string[];
    author: IUserPublic;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    isPinned: boolean;
    status: PostStatus;
    createdAt: string;
}
export interface IComment {
    id: string;
    userId: string;
    content: string;
    likeCount: number;
    parentId?: string;
    user: IUserPublic;
    replies?: IComment[];
    createdAt: string;
}
export interface IReview {
    id: string;
    userId: string;
    courseId?: string;
    productId?: string;
    rating: number;
    content?: string;
    images: string[];
    user: IUserPublic;
    createdAt: string;
}
export interface INotification {
    id: string;
    type: string;
    title: string;
    content: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
}
