import { defineEventHandler } from 'h3';
import { v6 as uuidv6 } from 'uuid-with-v6';
import { MongoClient } from 'mongodb';
import type { Room } from '~/types/room';

const config = useRuntimeConfig();
const uri = config.mongoConnection;
const dbName = "myDatabase";

// MongoDB クライアントを初期化
const client = new MongoClient(uri);

// POST /api/rooms に対するハンドラー
export default defineEventHandler(async (event) => {
    try{
        // Room ID を生成
        const roomId = uuidv6();

        // DBに Room を登録
        // MongoDB に接続
        await client.connect();
        console.log("Connected successfully to server");

        // データベースを取得
        const db = client.db(dbName);
        // Get a reference to the 'rooms' collection
        const collection = db.collection('rooms');

        // Insert the new room into the 'rooms' collection
        const room: Room = { 
            roomId: roomId,
            createDateTime: new Date(),
            titleFixed: false,
            roomClosed: false,
         };
        await collection.insertOne(room);

        return room;

    } finally {
        // 接続を閉じる
        await client.close();
    }
});
