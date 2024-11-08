import type { Actions } from "~/enums/Actions";
import type { ITour } from "~/interfaces/ITour"
import type Card from "./Card";

export default class Tour implements ITour {
    action: Actions;

    constructor(action: Actions) {
        this.action = action;
    }

    drawCard(packet: Card[]): Map<Card[], Card> {
        const newCard = packet.shift();
        const hashMap = new Map<Card[], Card>();
    
        if (newCard) {
            hashMap.set(packet, newCard);
        }
        return hashMap;
    }

    drawBottomCard(packet: Card[]): Map<Card[], Card> {
        const newCard = packet.pop();
        const hashMap = new Map<Card[], Card>();
    
        if (newCard) {
            hashMap.set(packet, newCard);
        }
        console.log(newCard);
        return hashMap;
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