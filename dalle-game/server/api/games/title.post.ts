import { defineEventHandler,readBody } from 'h3';
import { MongoClient } from 'mongodb';
import { Room } from '~/types/room';

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
        const { roomId, titleUrl,titleImage } = body;

        // MongoDB に接続
        await client.connect();
        console.log("Connected successfully to server");

        // データベースを取得
        const db = client.db(dbName);
        // Get a reference to the 'rooms' collection
        const collection = db.collection('rooms');
        // Update the room
        const result = await collection.updateOne(
            { roomId: roomId }, 
            { $set: { 
                titleUrl: titleUrl, 
                titleImage: titleImage, 
                titleImageVector: '', 
                titleFixed: true 
            }}
        );

        if(result.matchedCount === 0){
            throw new Error('Room not found.');
        }

        // Get the updated room
        const room = await collection.findOne({ roomId: roomId });
        return room;

    } finally {
        // 接続を閉じる
        await client.close();
    }
});
