import { defineEventHandler } from 'h3';
import { v6 as uuidv6 } from 'uuid-with-v6';

// Room の型情報
interface Room {
    roomId: string;
}

// POST /api/rooms に対するハンドラー
export default defineEventHandler(async (event) => {
    // Room ID を生成
    const roomId = uuidv6();

    // Room オブジェクトを返す
    return { roomId } as Room;
});
