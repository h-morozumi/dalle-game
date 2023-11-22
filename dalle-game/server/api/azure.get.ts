import { defineEventHandler, createError, getQuery } from 'h3';
import { useRuntimeConfig } from '#imports'
import fetch from 'node-fetch';

const config = useRuntimeConfig();
// 比較対象の画像
const url1 = 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbs8z1i%2FbtroWDmAcWU%2F180Dv1tWj54jk0nWpL6gG1%2Fimg.jpg';
// AI Vision
const endpoint = config.public.apiBase; // AI Vision Endpoint URL
const key = config.apiSecret; // AI Vision API Key
const apiUrl = `${endpoint}computervision/retrieval:vectorizeImage?api-version=2023-02-01-preview&modelVersion=latest`;

export default defineEventHandler(async (event) => {

    try {
        // パラメータから画像URLを取得
        const query = await getQuery(event);
        const url = query.url as string | undefined;
        if (!url) {
          throw createError({ statusCode: 400, statusMessage: 'No URL provided' });
        }

        // 画像を取得
        const image1 = await fetchAndProcessImage(url1);
        const iamge2 = await fetchAndProcessImage(url);

        // 画像をAzure Visionに投げてベクトルを取得
        const vector1 = await postToAzureVision(image1);
        const vector2 = await postToAzureVision(iamge2);

        // 類似度を計算
        const similarity = getCosineSimilarity(vector1.vector, vector2.vector);
        console.log(similarity)
        return { similarity };
    } catch (error) {
        console.error(error);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }
});

// Fetch an image from a URL and get its vector representation
async function fetchAndProcessImage(imageUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw createError({ statusCode: response.status, statusMessage: response.statusText });
    }
    const buffer = await response.arrayBuffer();
    return buffer;
}

// Post binary data to Azure Vision and get the vector response
async function postToAzureVision(buffer: ArrayBuffer): Promise<AzureResponse> {
 
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': key,
      },
      body: Buffer.from(buffer),
    });
  
    const azureResponse = (await response.json()) as AzureResponse;
    return azureResponse;
}

// Post url to Azure Vision and get the vector response
async function postUrlToAzureVision(url: string): Promise<AzureResponse> {
  
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
    const azureResponse = (await response.json()) as AzureResponse;
    return azureResponse;
}
interface AzureResponse {
    modelVersion: string;
    vector: number[];
}

// Calculate the cosine similarity between two vectors
function getCosineSimilarity(vector1: number[], vector2: number[]): number {
    const dotProduct = vector1.reduce((sum, value, i) => sum + value * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, x) => sum + x * x, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, x) => sum + x * x, 0));
    return dotProduct / (magnitude1 * magnitude2);
}

// // 類似度を計算する関数S
// function getCosineSimilarity(vector1: number[], vector2: number[]): number {
//     let dotProduct = 0;
//     const length = Math.min(vector1.length, vector2.length);
//     for (let i = 0; i < length; i++) {
//       dotProduct += vector1[i] * vector2[i];
//     }
    
//     const magnitude1 = Math.sqrt(vector1.reduce((sum, x) => sum + x * x, 0));
//     const magnitude2 = Math.sqrt(vector2.reduce((sum, x) => sum + x * x, 0));
  
//     return dotProduct / (magnitude1 * magnitude2);
//   }
  