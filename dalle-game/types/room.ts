// types/room.ts
export interface Room {
    roomId: string;
    createDateTime: Date;
    titleUrl?: string;
    titleImage?: string;
    titleImageVector?: number[];
    titleFixed: boolean;
    roomClosed: boolean;
}
