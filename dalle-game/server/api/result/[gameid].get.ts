import { defineEventHandler, sendError, createError } from 'h3'
import { MongoClient } from 'mongodb';
import { Game } from '~/types/game';

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
    const games = await getGames(gameId);
    if (!games) {
        throw createError({ statusCode: 400, statusMessage: 'Game Not Found' });
    }

    // Game情報を返す
    return games;
})

// Gameを取得
async function getGames(gameId: string): Promise<Game[]> {
    try{
        // MongoDB に接続
        await client.connect();
        console.log("Connected successfully to server");

        // データベースを取得
        const db = client.db(dbName);

        // DBからgameIdをキーにしてRoomを取得
        const collection = db.collection('games');
        const games = await collection.find<Game>({ roomId: gameId }).sort({ similarity: -1 }).limit(10).toArray();
        return games;
    }catch(err){
        console.error(err);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
    }finally {
        // 接続を閉じる
        await client.close();
    }
}
