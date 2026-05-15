import { PostType } from './create-post.dto';
export declare class UpdatePostDto {
    type?: PostType;
    title?: string;
    content?: string;
    images?: string[];
    tags?: string[];
}
