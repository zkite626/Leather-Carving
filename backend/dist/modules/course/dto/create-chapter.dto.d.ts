export declare class CreateChapterDto {
    title: string;
    sortOrder?: number;
}
export declare class UpdateChapterDto {
    title?: string;
    sortOrder?: number;
}
export declare class ReorderChaptersDto {
    chapterIds: string[];
}
