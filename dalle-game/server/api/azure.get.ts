import { defineEventHandler, sendError, createError, getQuery } from 'h3';
import fetch from 'node-fetch';
import sharp from 'sharp';


export default defineEventHandler(async (event) => {

        const query = await getQuery(event);
        const url = query.url as string | undefined;
        if (!url) {
          throw createError({ statusCode: 400, statusMessage: 'No URL provided' });
        }

    //画像1URL
    const url1 = 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fbs8z1i%2FbtroWDmAcWU%2F180Dv1tWj54jk0nWpL6gG1%2Fimg.jpg';
    //画像2URL
    // const url2 = 'https://tryxtrip.com/wp-content/uploads/2015/08/3006983_m.jpg';
    const url2 = 'https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1kcIad.img?w=1920&h=1080&q=60&m=2&f=jpg';
    
    // 画像1を取得
    const response1 = await fetch(url1);
    if (!response1.ok) {
        throw createError({ statusCode: response1.status, statusMessage: response1.statusText });
    }
    // 画像2を取得
    const response2 = await fetch(url);
    if (!response2.ok) {
        throw createError({ statusCode: response2.status, statusMessage: response2.statusText });
    }

    // AI Vision Endpoint URL
    const endpoint = "";
    // AI Vision API Key
    const key = "";

    // 画像1のバイナリデータを取得して、下記APIのリクエストボディに設定する
    const buffer1 = await response1.arrayBuffer();
    // バイナリデータをボディに設定してPOSTクエリを実行
    const resAzure1 = await fetch(`${endpoint}/computervision/retrieval:vectorizeImage?api-version=2023-02-01-preview&modelVersion=latest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": key
        },
        body: Buffer.from(buffer1)
    });
    // 画像2のバイナリデータを取得して、下記APIのリクエストボディに設定する
    const buffer2 = await response2.arrayBuffer();
    // バイナリデータをボディに設定してPOSTクエリを実行
    const resAzure2 = await fetch(`${endpoint}/computervision/retrieval:vectorizeImage?api-version=2023-02-01-preview&modelVersion=latest`, {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": key
        },
        body: Buffer.from(buffer2)
    });

    // //画像1のURLをPOSTで呼び出す
    // const resAzure = await fetch(`${endpoint}/computervision/retrieval:vectorizeImage?api-version=2023-02-01-preview&modelVersion=latest`, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //         "Ocp-Apim-Subscription-Key": key
    //     },
    //     body: JSON.stringify({
    //         url: url1
    //     })
    // });

    // レスポンスから結果を取り出す
    const result1 = await resAzure1.json() as AzureResponse;
    const result2 = await resAzure2.json() as AzureResponse;

    // 画像1と画像2の類似度を判別
    const similarity = getCosineSimilarity(result1.vector, result2.vector);


    console.log(similarity)

    return { similarity};
});

interface AzureResponse {
    modelVersion:string;
    vector: number[];
  }

function getCosineSimilarity(vector1: number[], vector2: number[]): number {
    let dotProduct = 0;
    const length = Math.min(vector1.length, vector2.length);
    for (let i = 0; i < length; i++) {
      dotProduct += vector1[i] * vector2[i];
    }
    
    const magnitude1 = Math.sqrt(vector1.reduce((sum, x) => sum + x * x, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, x) => sum + x * x, 0));
  
    return dotProduct / (magnitude1 * magnitude2);
  }
  