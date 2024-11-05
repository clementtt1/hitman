import type { Actions } from "~/enums/Actions"
import type { ICard } from "~/interfaces/ICard"

export default class Card implements ICard {
    action: Actions
    color: string
    description: string
    image_src: string

    constructor(action: Actions, color: string, description: string, image_src: string) {
        this.action = action,
        this.color = color,
        this.description = description
        this.image_src = image_src
    }
}