// src/socket.ts
import { Server, type ServerOptions } from 'socket.io'
import type { H3Event } from 'h3'
import Player from '~/classes/Player'
import Card from '~/classes/Card'
import Packet from '~/classes/Packet'
import { Actions } from '~/enums/Actions'

const options: Partial<ServerOptions> = {
    path: '/api/socket.io',
    serveClient: false
}

export const io = new Server(options)

const players: Map<string, Player> = new Map()
let deck: Card[] = [] 

function generateDeck() {
    const packet = new Packet([], 52)
    deck = packet.generateDeck()
    io.of('/play').emit('deck', deck)  
}

export function initSocket(event: H3Event) {
    // @ts-ignore
    io.attach(event.node.res.socket?.server)

    io.of('/play').on('connection', (socket) => {
        socket.on('player', (playerData: Player) => {
            const player = new Player(playerData.uuid, playerData.name, playerData.hand, playerData.status) 
            players.set(player.uuid, player)  
            console.log('Player added:', player)

            if (deck.length === 0) {
                generateDeck()  
            }

            io.of('/play').emit('players', Array.from(players.values()))
            socket.emit('deck', deck)  
        })

        socket.on('distributeCard', () => {
            players.forEach((player) => {
                player.hand.push(new Card(Actions.REVIVE, "red", "apagnan", ""))

                if(player.name === "A") {
                    player.hand.push(new Card(Actions.BLOCK, "red", "apagnan", ""))
                }
            })
        
            io.of('/play').emit('updateHands', Array.from(players.values()).map(player => ({
                uuid: player.uuid,
                hand: player.hand
            })));
        });
        
        socket.on('drawCard', () => {
            if (deck.length > 0) {
                const drawnCard = deck.shift() 
                io.of('/play').emit('deck', deck)  
                socket.emit('cardDrawn', drawnCard) 
            }
        })

        socket.on('drawBottomCard', () => {
            if (deck.length > 0) {
                const drawnCard = deck.pop()
                io.of('/play').emit('deck', deck)  
                socket.emit('cardDrawnBottom', drawnCard) 
            }
        })

        socket.on('seeCards', () => {
            if (deck.length >= 3) {
                const cards = [deck[0], deck[1], deck[2]];
                socket.emit('seeCards', cards); 
            } else {
                console.log('Deck has less than 3 cards.');
            }
        });

        socket.on('suffleDeck', () => {
            const newDeck = new Packet(deck, deck.length); 
            console.log(newDeck.pile[0].action)
            newDeck.shuffle(newDeck.pile);
            console.log(newDeck.pile[0].action)
            socket.emit("suffleDeck", newDeck)
        });

        socket.on('disconnect', () => {
            console.log('Player disconnected:', socket.id)
            players.delete(socket.id)
            io.of('/play').emit('players', Array.from(players.values()))
        })
    })
}
