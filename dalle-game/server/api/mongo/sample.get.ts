import { defineEventHandler } from 'h3';
import { MongoClient } from 'mongodb';
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig();
const uri = config.mongoConnection;
const dbName = "myDatabase";

// MongoDB クライアントを初期化
const client = new MongoClient(uri);

export default defineEventHandler(async (event) => {
  try {
    // MongoDB に接続
    await client.connect();
    console.log("Connected successfully to server");

    // データベースを取得
    const db = client.db(dbName);
    // コレクションを取得
    const collection = db.collection('myCollection');

    // コレクションからドキュメントを取得
    const documents = await collection.find({}).toArray();

    // ドキュメントを返す
    return {
      data: documents
    };
  } finally {
    // 接続を閉じる
    await client.close();
  }
});
