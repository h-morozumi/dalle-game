import { defineEventHandler, sendError, createError, getQuery } from 'h3';
import fetch from 'node-fetch';
import sharp from 'sharp';


export default defineEventHandler(async (event) => {

    try{
      const query = await getQuery(event);
      const url = query.url as string;
      if (!url) {
        throw createError({ statusCode: 400, statusMessage: 'No URL provided' });
      }
    
      // 外部URLから画像データを取得
      const response = await fetch(url);
      if (!response.ok) {
        throw createError({ statusCode: response.status, statusMessage: response.statusText });
      }
    
      // レスポンスヘッダーからコンテントタイプを確認
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw createError({ statusCode: 400, statusMessage: 'URL does not point to an image' });
      }
    
      // 画像がJPEGまたはPNG形式でなければエラー
      if (!['image/jpeg','image/jpg', 'image/png'].includes(contentType)) {
        throw createError({ statusCode: 400, statusMessage: 'Image must be JPEG or PNG' });
      }
    
      // 画像データを取得
      const arrayBuffer = await response.arrayBuffer();
      const imageData = Buffer.from(arrayBuffer);
      // JPEG画像をPNGに変換し、サイズを調整する
      const image = sharp(imageData);
      const metadata = await image.metadata();

      // JPEG画像をPNGに変換
      if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
        image.toFormat('png');
      }

      // 画像のサイズを調整
      const resizedImage = await image.resize(1024).toBuffer();
    
      // Base64エンコーディングしてJSONで返却
      const base64Image = resizedImage.toString('base64');

      return {
        image: base64Image
      };
    }catch(error){
      // Properly log the error for debugging purposes
      // In production, consider logging to an external service
      console.error(error);

      // Send a generic error message to the client
      sendError(event, createError({ statusCode: 500, statusMessage: 'Internal Server Error' }));
    }

});

