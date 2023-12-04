// Game の型情報
export interface Game {
    roomId: string;
    createDateTime: Date;
    prompt: string;
    image: string;
    imageVector: number[];
    similarity: number;
    nickname: string;
    dalle: string;
}