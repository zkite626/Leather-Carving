export declare enum PostType {
    DISCUSSION = "DISCUSSION",
    SHOWCASE = "SHOWCASE",
    QUESTION = "QUESTION",
    TUTORIAL = "TUTORIAL",
    CHALLENGE = "CHALLENGE"
}
export declare class CreatePostDto {
    type: PostType;
    title: string;
    content: string;
    images?: string[];
    tags?: string[];
}
