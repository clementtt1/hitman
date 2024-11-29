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

    players.forEach((player) => {
        player.hand.push(new Card(Actions.REVIVE, "", "Save you from being killed.", ""))

        for (let i = 0; i < 4; i++) {
            const randomCard = getRandomCard();
            player.hand.push(randomCard);
        }
    })
}

function getRandomCard(): Card {
    const randomIndex = Math.floor(Math.random() * deck.length); 
    const randomCard = deck[randomIndex]; 
    deck.splice(randomIndex, 1); 
    return randomCard;
}

export function initSocket(event: H3Event) {
    // @ts-ignore
    io.attach(event.node.res.socket?.server)
    

    io.of('/play').on('connection', (socket) => {
        console.log('A player connected:', socket.id)

        socket.on('startGame', () => {
            generateDeck();  
            io.of('/play').emit('deck', deck);
            io.of('/play').emit('distributeCard', Array.from(players.values()).map(player => ({
                uuid: player.uuid,
                hand: player.hand
            })));
            io.of('/play').emit('startGame'); 
        });

        socket.on('player', (playerData: Player) => {
            const player = new Player(playerData.uuid, playerData.name, playerData.hand, playerData.status) 
            players.set(player.uuid, player)  
            io.of('/play').emit('players', Array.from(players.values()))
        })

        socket.on('cardPlayed', ({ card, playerUuid }: { card: Card, playerUuid: string }) => {
            const player = players.get(playerUuid);
        
            if (player) {
                const cardIndex = player.hand.findIndex(c => c.action === card.action && c.color === card.color);
                if (cardIndex !== -1) {
                    player.hand.splice(cardIndex, 1);
                }
        
                io.of('/play').emit('updateHands', Array.from(players.values()).map(p => ({
                    uuid: p.uuid,
                    hand: p.hand
                })));
        
                io.of('/play').emit('updateLastPlayedCard', card);
            }
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
            const cards = [deck[0], deck[1], deck[2]];
            socket.emit('seeCards', cards); 
        });

        socket.on('suffleDeck', () => {
            const newDeck = new Packet(deck, deck.length);
            newDeck.shuffle(newDeck.pile);
            deck = newDeck.pile;
            io.of('/play').emit('deck', deck);
            io.of('/play').emit('updateHands', Array.from(players.values()).map(p => ({
                uuid: p.uuid,
                hand: p.hand
            })));
        });
        
        

        socket.on('replicateCard', () => {
            socket.emit('replicateCard');
        })

        socket.on('disconnect', () => {
            console.log('Player disconnected:', socket.id)
            players.delete(socket.id)
            io.of('/play').emit('players', Array.from(players.values()))
        })
    })
}