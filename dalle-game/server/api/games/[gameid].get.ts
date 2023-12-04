import { defineEventHandler, createError } from 'h3'
import { MongoClient } from 'mongodb';
import type { Room } from '~/types/room';

const config = useRuntimeConfig();
const uri = config.mongoConnection;
const dbName = "myDatabase";

// MongoDB クライアントを初期化
const client = new MongoClient(uri);

export default defineEventHandler(async (event) => {
    const gameId = event.context.params?.gameid;
    if (!gameId) {
        // ゲームIDが見つからない場合はエラーを返す
        throw createError({ statusCode: 400, statusMessage: 'Parameter Error' });
    }

    // Room存在チェック
    const room = await checkIfRoomExists(gameId);
    if (!room) {
        throw createError({ statusCode: 400, statusMessage: 'Game Not Found' });
    }

    // Game情報を返す
    return room;
})

// Roomの存在をチェックする関数
async function checkIfRoomExists(roomId: string): Promise<Room> {
    try{
        // MongoDB に接続
        await client.connect();
        console.log("Connected successfully to server");

        // データベースを取得
        const db = client.db(dbName);

        // DBからgameIdをキーにしてRoomを取得
        const collection = db.collection('rooms');
        const room = await collection.findOne<Room>({ roomId: roomId });
        return room;
    }catch(err){
        console.error(err);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }finally {
        // 接続を閉じる
        await client.close();
    }
}
