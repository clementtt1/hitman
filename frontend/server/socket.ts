// src/socket.ts
import { Server, type ServerOptions } from 'socket.io'
import type { H3Event } from 'h3'
import Player from '~/classes/Player'
import Card from '~/classes/Card'
import Packet from '~/classes/Packet'

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

    io.of('/chat').on('connection', (socket) => {
        socket.emit('connected', { message: 'Connection established.' })
        socket.on('chat', (text: string) => {
            io.of('chat').emit('chat', { id: socket.id, text })
        })
    })

    io.of('/play').on('connection', (socket) => {
        console.log('New player connected:', socket.id)

        socket.emit('connected', { message: 'Connection established.' })
        
        socket.on('player', (playerData: Player) => {
            const player = new Player(playerData.uuid, playerData.name, playerData.deck, playerData.status) 
            players.set(socket.id, player)  
            console.log('Player added:', player)

            if (deck.length === 0) {
                generateDeck()  
            }

            io.of('/play').emit('players', Array.from(players.values()))
            socket.emit('deck', deck)  
        })

        socket.on('drawCard', () => {
            if (deck.length > 0) {
                const drawnCard = deck.shift() 
                io.of('/play').emit('deck', deck)  
                socket.emit('cardDrawn', drawnCard) 
            }
        })

        socket.on('drawBottomCard', () => {
            console.log("NOOOOOOOOON")
            if (deck.length > 0) {
                //const drawnCard = deck.pop()
                console.log("1") 
                const drawnCard = deck.pop()
                console.log("2")
                console.log(drawnCard)
                io.of('/play').emit('deck', deck)  
                socket.emit('cardDrawn', drawnCard) 
            }
        })

        socket.on('seeCards', () => {
            console.log("OUIIIIII"); 
            if (deck.length >= 3) {
                const cards = [deck[0], deck[1], deck[2]];
                socket.emit('seeCards', cards); 
            } else {
                console.log('Deck has less than 3 cards.');
            }
        });
        

        socket.on('disconnect', () => {
            console.log('Player disconnected:', socket.id)
            players.delete(socket.id)
            io.of('/play').emit('players', Array.from(players.values()))
        })
    })
}
