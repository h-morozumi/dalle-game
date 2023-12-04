export interface GenerateImagesResponse  {
    created: number;
    data: GenerateImagesResponseData[];
}
export interface GenerateImagesResponseData {
    url: string;
    revised_prompt: string;
}