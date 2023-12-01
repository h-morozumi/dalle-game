
export interface GenerateImagesResponse {
    id: string;
    status: string;
}

export interface OperationResponse {
    created: number;
    expires: number;
    id: string;
    result: OperationResult;
    status: string;
}

export interface OperationResult {
    created: number;
    data: OperationResultData[];
}

export interface OperationResultData {
    url: string;
}