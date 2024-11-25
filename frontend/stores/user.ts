import { defineStore } from 'pinia'
import Packet from "../classes/Packet"
import Card from "../classes/Card"
import { Actions } from "../enums/Actions"
import Tour from '~/classes/Tour'
import { Status } from '~/enums/Status'
import { io, Socket } from 'socket.io-client'
import type Player from '~/classes/Player'

const socket = io('/play', {
  path: '/api/socket.io'
});

export const useMyUserStore = defineStore({
    id: 'myUserStore',

    state: () => ({
        deck: [] as Card[],
        hand: [] as Card[],        
        lastPlayedCard: null as Card | null,
        isHitmanActive: false,
        players: [] as Player[]
    }),
    actions: {
        distributeCard(socket: Socket) {
            socket.emit("distributeCard")
        },
        updateHands(players: { uuid: string, hand: Card[] }[]) {
            players.forEach(playerData => {
                const player = this.players.find(p => p.uuid === playerData.uuid)
                if (player) {
                    player.hand = playerData.hand
                } else {
                    this.players.push({
                        uuid: playerData.uuid,
                        hand: playerData.hand,
                        name: "",
                        status: Status.ALIVE
                    })
                }
            })
        },
        useCard(nb: number, socket: Socket) {
            const tour = new Tour(Actions.PLAY_CARD)
            const state = tour.playCard(this.hand, nb)
            const cardPlayed = state.get(this.hand)
      
            if (cardPlayed) {
              if (cardPlayed.action !== Actions.REPLICATE && cardPlayed.action !== Actions.HITMAN) {
                this.lastPlayedCard = cardPlayed
              }
            }
      
            if (Array.from(state.keys())[0]) {
              this.hand = Array.from(state.keys())[0]
            }
      
            if (cardPlayed) {
              this.playerChoice(cardPlayed.action, socket)
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
        playerChoice(choice: Actions, socket: Socket) {
            switch (choice) {
                case Actions.DRAW:
                    socket.emit('drawCard') 
                    break;
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
                    socket.emit('seeCards') 
                    break;
                case Actions.BLOCK:
                    return "Block the next action against you.";
                    break;
                case Actions.REPLICATE:
                    if(this.lastPlayedCard){
                        this.replicate(this.lastPlayedCard);
                        break;
                    } else {
                        this.hand.push(new Card(Actions.REPLICATE, 'blue', "Replicate a card from the discard pile.", ""));
                        break;
                    }
                case Actions.PICK_BOTTOM:
                    if(this.deck) {
                        socket.emit('drawBottomCard')
                        break;
                    }
                default:
                    return "No description available.";
                    break;
            }
        }
    },
    getters: {
        getPlayersHands(): any {
            return this.players.map(player => player.hand)
        }
      }
})
