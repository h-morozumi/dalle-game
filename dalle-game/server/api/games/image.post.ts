import { defineEventHandler,readBody } from 'h3';
import { MongoClient } from 'mongodb';
import { imageToVector, getCosineSimilarity } from '~/utils/aiVisionUtils';

const config = useRuntimeConfig();
const uri = config.mongoConnection;
const dbName = "myDatabase";

// MongoDB クライアントを初期化
const client = new MongoClient(uri);

export default defineEventHandler(async (event) => {
    try{
        // リクエストボディを取得
        const body = await readBody(event);
        // ボディからデータを取り出す
        const { roomId, nickname, prompt, image, dalle } = body;

        if(!roomId || !nickname || !prompt || !image || !dalle){
            throw createError({ statusCode: 400, statusMessage: 'Parameter Error' });
        }

        // 外部URLから画像データを取得
        const response = await fetch(image);
        if (!response.ok) {
            throw createError({ statusCode: response.status, statusMessage: response.statusText });
        }
        // 画像データを取得
        const arrayBuffer = await response.arrayBuffer();
        const imageData = Buffer.from(arrayBuffer);

        // Base64エンコーディング
        const base64Image = imageData.toString('base64');

        // 画像データをVectorに変換
        const imageVector = await imageToVector(base64Image);

        // MongoDB に接続
        await client.connect();

        // データベースを取得
        const db = client.db(dbName);

        // roomコレクションからroomIDで画像のベクター情報を取得
        const roomCollection = db.collection('rooms');
        const room = await roomCollection.findOne({ roomId: roomId }) ;
        if(!room){
            throw createError({ statusCode: 404, statusMessage: 'Room Not Found' });
        }
        const roomImageVector = room.titleImageVector;

        // 画像のベクター情報と部屋のベクター情報を比較
        const cosineSimilarity = getCosineSimilarity(imageVector, roomImageVector);

        // Get a reference to the 'rooms' collection
        const collection = db.collection('games');

        // Insert the new room into the 'rooms' collection
        const game = { 
            roomId: roomId,
            createDateTime: new Date(),
            nickname: nickname,
            prompt: prompt,
            image: base64Image,
            imageVector: imageVector,
            similarity: cosineSimilarity,
            dalle: dalle
         };
         console.log(game);
         
         const result = await collection.insertOne(game);
         console.log(`New game created with the following id: ${result.insertedId}`);

        return game;
    } finally {
        // 接続を閉じる
        await client.close();
    }
});
