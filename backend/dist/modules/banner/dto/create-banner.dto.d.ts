export declare class CreateBannerDto {
    title: string;
    image: string;
    link?: string;
    position?: string;
    sortOrder?: number;
    isActive?: boolean;
    startAt?: string;
    endAt?: string;
}
export declare class UpdateBannerDto {
    title?: string;
    image?: string;
    link?: string;
    position?: string;
    sortOrder?: number;
    isActive?: boolean;
    startAt?: string;
    endAt?: string;
}
