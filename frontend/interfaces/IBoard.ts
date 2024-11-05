import type { IPacket } from "./IPacket";
import type { IPlayer } from "./IPlayer";

export interface IBoard {
    size: number,
    players: IPlayer[],
    game: IPacket
}