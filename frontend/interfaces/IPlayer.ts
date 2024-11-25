import type { ICard } from "./ICard"
import { Status } from "../enums/Status"

export interface IPlayer {
    uuid: string
    name: string
    hand: ICard[]
    status: Status
}