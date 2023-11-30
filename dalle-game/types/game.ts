// Game の型情報
export interface Game {
    roomId: string;
    createDateTime: Date;
    prompt: string;
    imageString: string;
    ImageVector: number[];
    similarity: number;
    nickname: string;
}