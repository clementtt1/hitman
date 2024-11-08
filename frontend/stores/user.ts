import { defineStore } from 'pinia'
import Packet from "../classes/Packet"
import Card from "../classes/Card"
import { Actions } from "../enums/Actions"
import Tour from '~/classes/Tour'
import { Status } from '~/enums/Status'

export const useMyUserStore = defineStore({
  id: 'myUserStore',
  state: () => ({
    deck: [] as Card[],
    hand: [] as Card[],
    lastPlayedCard: null as Card | null,
    isHitmanActive: false
  }),
  
  actions: {
    distributeCard() {
      const initialPile: Card[] = [];
      const packet = new Packet(initialPile, 52);
      const deck = packet.generateDeck();

      this.deck = deck;
      this.hand = [];

      this.hand.push(new Card(Actions.REVIVE, "", "Save you from being killed.", ""))
      
      this.deck.slice(0, 4).forEach(card => {
        this.hand.push(card)
      })
    },
    pickUpCard(){
      const tour = new Tour(Actions.DRAW);
      const state = tour.drawCard(this.deck)
      const drawnCard = state.get(this.deck)
      var hasReviveCard = false;
      var indiceRevive = -1;
      for(let indice = 0; indice < this.hand.length; indice++){
        if(this.hand[indice].action == Actions.REVIVE){
          hasReviveCard = true
          indiceRevive = indice;
        }
      }
      console.log(hasReviveCard);
    
      // Vérifier si la carte piochée est HITMAN
      if (drawnCard?.action === Actions.HITMAN) {
        console.log("Carte HITMAN piochée - elle sera retirée de la main");
        // Ne pas ajouter HITMAN à la main, activer son effet immédiatement si nécessaire
        
        if(hasReviveCard){
          this.activateHitmanEffect(); // Fonction pour gérer l'effet de HITMAN
          this.useCard(indiceRevive);
        }
      } else {
        Status.DEAD;
        if (drawnCard) {
          this.hand.push(drawnCard);
        }
      }
    
      // Mettre à jour le deck avec la nouvelle version sans la carte piochée
      if (Array.from(state.keys())[0]) {
        this.deck = Array.from(state.keys())[0];
      }
    },
    pickUpBottomCard(){
      const tour = new Tour(Actions.PICK_BOTTOM);
      const state = tour.drawBottomCard(this.deck)
      const drawnCard = state.get(this.deck)

      if(this.deck.length == 0){
        if (drawnCard) {
          this.deck.push(drawnCard);
        }
      }
      else{
        if (Array.from(state.keys())[0]) {
          this.deck = Array.from(state.keys())[0]; //nouveau deck
          if(drawnCard){
            this.hand.push(drawnCard);
          }
        }
      }

      var hasReviveCard = false;
    var indiceRevive = -1;
    for(let indice = 0; indice < this.hand.length; indice++){
      if(this.hand[indice].action == Actions.REVIVE){
        hasReviveCard = true
        indiceRevive = indice;
      }
    }

      // Vérifier si la carte piochée est HITMAN
    if (drawnCard?.action === Actions.HITMAN) {
      console.log("Carte HITMAN piochée - elle sera retirée de la main");
      // Ne pas ajouter HITMAN à la main, activer son effet immédiatement si nécessaire
      
      if(hasReviveCard){
        this.activateHitmanEffect(); // Fonction pour gérer l'effet de HITMAN
        this.useCard(indiceRevive);
      }
    } else {
      Status.DEAD;
      if (drawnCard) {
        this.hand.push(drawnCard);
      }
    }
    },
    useCard(nb: number){
      const tour = new Tour(Actions.PLAY_CARD);
      const state = tour.playCard(this.hand, nb)
      const cardPlayed = state.get(this.hand)
      //console.log(cardPlayed)
      
      /*if(cardPlayed?.action == Actions.PICK_BOTTOM){
        tour.drawBottomCard(this.deck);
      }*/
      if(cardPlayed){
        if(cardPlayed.action != Actions.REPLICATE && cardPlayed.action != Actions.HITMAN){
          this.lastPlayedCard = cardPlayed
        }
      }

      if (Array.from(state.keys())[0]) {
        this.hand = Array.from(state.keys())[0]; //nouveau deck
      }

      if(cardPlayed){
        this.playerChoice(cardPlayed.action)
      }
    },
    executeHitmanAction(targetNumber: number) {
      this.isHitmanActive = false; // Masquer le formulaire après soumission
      this.deck.splice(targetNumber-1, 0, new Card(Actions.HITMAN, "", "Kill yourself when his picked.", ""));
    },
    activateHitmanEffect() {
      console.log("Effet HITMAN activé.");
      this.isHitmanActive = true; // Affiche le formulaire pour choisir une cible
    },
    replicate(lastCard: Card){
      const tour = new Tour(Actions.REPLICATE);
      /*if(lastCard.action == Actions.BLOCK){
          //EMPECHER LE JOUEUR DE JOUER
      }*/
     //console.log(lastCard)
      return lastCard
    },
    seeCards(deck: Card[]){
      const card1 = deck[0];
      const card2 = deck[1];
      const card3 = deck[2];
      return [card1, card2, card3]
    },
    playerChoice(choice: Actions){
      switch (choice) {
        case Actions.HITMAN:
          this.isHitmanActive = true;
          break;
        case Actions.SKIP:
            return "Skip the next player's turn.";
            break;
        case Actions.REVERSE:
            return "Reverse the direction of play.";
            break;
        case Actions.BOMB:
            return "Bomb a card in your hand.";
            break;
        case Actions.STEAL:
            return "Steal a card from an opponent.";
            break;
        case Actions.SHUFFLE:
            const newDeck = new Packet(this.deck, this.deck.length);
            return newDeck.shuffle(newDeck.pile);
        case Actions.EYE:
            const cards = this.seeCards(this.deck)
            console.log(cards[0])
            console.log(cards[1])
            console.log(cards[2])
            return cards;
        case Actions.BLOCK:
            return "Block the next action against you.";
            break;
        case Actions.REPLICATE:
        if(this.lastPlayedCard){
          this.replicate(this.lastPlayedCard);
          break;
        }
        else{
          this.hand.push(new Card(Actions.REPLICATE, 'blue', "Replicate a card from the discard pile.", ""));
          break;
        }
        case Actions.PICK_BOTTOM:
          if(this.deck){
          this.pickUpBottomCard();
          break;
        }
        default:
            return "No description available.";
            break;
    }
    }
  }
})
