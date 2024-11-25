import type { Status } from "~/enums/Status"
import type { IPlayer } from "~/interfaces/IPlayer"
import Card from "~/classes/Card"


export default class Player implements IPlayer {
    uuid: string
    name: string
    hand: Card[]
    status: Status

    constructor(uuid: string, name: string, hand: Card[] = [], status: Status) {
        this.uuid = uuid,
        this.name = name,
        this.hand = hand,
        this.status = status
    }
}