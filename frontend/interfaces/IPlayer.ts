import type { IPacket } from "./IPacket"
import { Status } from "../enums/Status"

export interface IPlayer {
    uid: number
    name: string
    deck: IPacket
    status: Status
}