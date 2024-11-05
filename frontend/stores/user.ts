import { defineStore } from 'pinia'
import Packet from "../classes/Packet"
import Card from "../classes/Card"
import { Actions } from "../enums/Actions"

export const useMyUserStore = defineStore({
  id: 'myUserStore',
  state: () => ({
    deck: [] as Card[], 
    hand: [] as Card[], 
  }),
  actions: {
    distributeCard() {
      const initialPile: Card[] = [];
      const packet = new Packet(initialPile, 52);  
      const deck = packet.generateDeck();  

      this.deck = deck;  
      this.hand = []

      this.hand.push(new Card(Actions.REVIVE, "", "Save you from being killed.", ""))      

      this.deck.slice(0, 4).forEach(card => {
        this.hand.push(card)
      })
    }
  }
})
