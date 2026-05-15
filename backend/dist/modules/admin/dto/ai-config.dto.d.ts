export declare class CreateAiConfigDto {
    capability: string;
    providerType: string;
    displayName: string;
    baseUrl?: string;
    apiKey?: string;
    modelName: string;
    isActive?: boolean;
    extraParams?: Record<string, unknown>;
}
export declare class UpdateAiConfigDto {
    capability?: string;
    providerType?: string;
    displayName?: string;
    baseUrl?: string;
    apiKey?: string;
    modelName?: string;
    isActive?: boolean;
    extraParams?: Record<string, unknown>;
}
export declare class TestAiConfigDto {
    id: string;
}
