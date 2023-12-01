import { defineEventHandler,readBody } from 'h3';
import { MongoClient } from 'mongodb';

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
        const { roomId} = body;

        if(!roomId){
            throw createError({ statusCode: 400, statusMessage: 'Parameter Error' });
        }

        // MongoDB に接続
        await client.connect();

        // データベースを取得
        const db = client.db(dbName);
        // Get a reference to the 'rooms' collection
        const collection = db.collection('rooms');
        // Update the room
        const result = await collection.updateOne(
            { roomId: roomId }, 
            { $set: { 
                roomClosed: true 
            }}
        );

        if(result.matchedCount === 0){
            throw createError({ statusCode: 400, statusMessage: 'Room Not Found' });
        }

        // Get the updated room
        const room = await collection.findOne({ roomId: roomId });

        return room;

    } finally {
        // 接続を閉じる
        await client.close();
    }
});
