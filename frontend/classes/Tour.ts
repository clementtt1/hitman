import type { Actions } from "~/enums/Actions";
import type { ITour } from "~/interfaces/ITour"
import type Card from "./Card";

export default class Tour implements ITour {
    action: Actions;

    constructor(action: Actions) {
        this.action = action;
    }

    playCard(packet: Card[], nb: number): Map<Card[], Card> {
        const cardPlayed = packet[nb];
        const hashMap = new Map<Card[], Card>();
        packet.splice(nb, 1);

        if (cardPlayed) {
            hashMap.set(packet, cardPlayed);
        }
        
        return hashMap;
    }
}