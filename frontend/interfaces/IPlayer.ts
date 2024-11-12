import type { ICard } from "./ICard"
import { Status } from "../enums/Status"

export interface IPlayer {
    uuid: string
    name: string
    deck: ICard[]
    status: Status
}