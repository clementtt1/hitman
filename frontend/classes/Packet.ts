import type { IPacket } from "~/interfaces/IPacket";
import { Actions } from "../enums/Actions"
import Card from "./Card"

export default class Packet implements IPacket {
    pile: Card[] = [];
    size: number;

    constructor(pile: Card[], size: number) {
        this.pile = pile;
        this.size = size;
    }

    generateDeck(): Card[] {
        const colors = ['red', 'green', 'blue', 'yellow'];
    
        Object.values(Actions).forEach(action => {
            colors.forEach(color => {
                let description = this.getDescription(action);
                this.pile.push(new Card(action, color, description, ""));
            });
        });
    
        this.shuffle(this.pile);
        return this.pile;
    }
    

    shuffle(deck: Card[]): void {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    getDescription(action: string): string {
        switch (action) {
            case Actions.REVIVE:
                return "Save you from being killed.";
            case Actions.HITMAN:
                return "Kill yourself when his picked.";
            case Actions.SKIP:
                return "Skip the next player's turn.";
            case Actions.REVERSE:
                return "Reverse the direction of play.";
            case Actions.BOMB:
                return "Bomb a card in your hand.";
            case Actions.STEAL:
                return "Steal a card from an opponent.";
            case Actions.SHUFFLE:
                return "Shuffle the deck.";
            case Actions.EYE:
                return "Look at an opponent's hand.";
            case Actions.BLOCK:
                return "Block the next action against you.";
            case Actions.REPLICATE:
                return "Replicate a card from the discard pile.";
            case Actions.PICK_BOTTOM:
                return "Pick a card from the bottom of the deck.";
            case Actions.DRAW:
                return "Draw a card from the deck.";
            default:
                return "No description available.";
        }
    }
    
}
