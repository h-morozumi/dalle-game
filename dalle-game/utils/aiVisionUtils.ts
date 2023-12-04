import { useRuntimeConfig } from '#imports'
import fetch from 'node-fetch';
import type { VectorizeImageResponse } from '~/types/vectorizeImage';

const config = useRuntimeConfig();
// AI Vision
const endpoint = config.aiVisionEndpoint; // AI Vision Endpoint URL
const key = config.aiVisionApiKey; // AI Vision API Key
const apiUrl = `${endpoint}computervision/retrieval:vectorizeImage?api-version=2023-02-01-preview&modelVersion=latest`;

export async function imageToVector(imageString: string): Promise<number[]> {
    // 引数のBase64文字列をバイナリに変換
    const buffer = Buffer.from(imageString, 'base64');
    // Azure VisionにバイナリをPOSTしてベクトルを取得
    const data = await postToAzureVision(buffer);
    return data.vector;
}

// Calculate the cosine similarity between two vectors
export function getCosineSimilarity(vector1: number[], vector2: number[]): number {
    const dotProduct = vector1.reduce((sum, value, i) => sum + value * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, x) => sum + x * x, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, x) => sum + x * x, 0));
    return dotProduct / (magnitude1 * magnitude2);
}

// Post binary data to Azure Vision and get the vector response
async function postToAzureVision(buffer: ArrayBuffer): Promise<VectorizeImageResponse> {
 
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': key,
      },
      body: Buffer.from(buffer),
    });
  
    const azureResponse = (await response.json()) as VectorizeImageResponse;
    return azureResponse;
}

// Post url to Azure Vision and get the vector response
async function postUrlToAzureVision(url: string): Promise<VectorizeImageResponse> {
  
  const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": key
      },
      body: JSON.stringify({
          url: url
      })
  });
  const azureResponse = (await response.json()) as VectorizeImageResponse;
  return azureResponse;
}