import type { ICard } from "./ICard"

export interface IPacket {
    pile: ICard[]
    size: number
}