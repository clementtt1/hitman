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

export const useUserStore = defineStore({
    id: 'myUserStore',

    state: () => ({
        deck: [] as Card[],
        hand: [] as Card[],    
        lastPlayedCard: null as Card | null,
        isHitmanActive: false,
        players: [] as Player[],
        uuid: ''
    }),

    actions: {
        distributeCard(socket: Socket) {
            socket.emit("distributeCard");
        },

        updateHands(playersData: { uuid: string, hand: Card[] }[]) {
            playersData.forEach(playerData => {
                const player = this.players.find(p => p.uuid === playerData.uuid);
                if (player) {
                    player.hand = playerData.hand;
                } else {
                    this.players.push({
                        uuid: playerData.uuid,
                        hand: playerData.hand,
                        name: "",
                        status: Status.ALIVE
                    });
                }
            });
        },

        useCard(index: number, socket: Socket) {
          const tour = new Tour(Actions.PLAY_CARD);
          const state = tour.playCard(this.hand, index);
          const cardPlayed = state.get(this.hand);
      
          if (cardPlayed) {
              this.lastPlayedCard = cardPlayed; // Mise à jour locale
              socket.emit('cardPlayed', { card: cardPlayed, playerUuid: this.uuid }); // Envoi au serveur
              this.playerChoice(cardPlayed.action, socket);
          }
      
          // Mettre à jour localement la main
          this.hand = Array.from(state.keys())[0] || this.hand;
      },

        executeHitmanAction(targetNumber: number) {
            this.isHitmanActive = false;
            this.deck.splice(targetNumber - 1, 0, new Card(Actions.HITMAN, "", "Kill yourself when it's picked.", ""));
        },

        activateHitmanEffect() {
            this.isHitmanActive = true;
        },

        replicate(lastCard: Card) {
            if (lastCard) {
                const tour = new Tour(Actions.REPLICATE);
                return lastCard;
            } else {
                this.hand.push(new Card(Actions.REPLICATE, 'blue', "Replicate a card from the discard pile.", ""));
            }
        },

        playerChoice(choice: Actions, socket: Socket) {
            const actionHandlers: Record<Actions, () => void | string> = {
                [Actions.DRAW]: () => socket.emit('drawCard'),
                [Actions.HITMAN]: () => { this.isHitmanActive = true; },
                [Actions.SKIP]: () => "Skip the next player's turn.",
                [Actions.REVERSE]: () => "Reverse the direction of play.",
                [Actions.BOMB]: () => "Bomb a card in your hand.",
                [Actions.STEAL]: () => "Steal a card from an opponent.",
                [Actions.SHUFFLE]: () => socket.emit('suffleDeck'),
                [Actions.EYE]: () => socket.emit('seeCards'),
                [Actions.BLOCK]: () => "Block the next action against you.",
                [Actions.REPLICATE]: () => this.replicate(this.lastPlayedCard),
                [Actions.PICK_BOTTOM]: () => socket.emit('drawBottomCard'),
                default: () => "No description available."
            };

            return actionHandlers[choice]?.() || actionHandlers.default();
        },
    },

    getters: {
        getPlayersHands() {
            return this.players.map(player => player.hand);
        }
    }
});