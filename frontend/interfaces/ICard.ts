import { Actions } from "../enums/Actions"

export interface ICard {
    action: Actions
    color: string
    description: string
    image_src: string
}