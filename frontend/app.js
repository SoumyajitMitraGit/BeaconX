import * as Y from 'https://esm.sh/yjs';
import { WebsocketProvider } from 'https://esm.sh/y-websocket?deps=yjs';

const statusElement = document.getElementById('connection-status');
let connectedClients = 0;

function createClient(clientId, clientName) {
    const ydoc = new Y.Doc();
    
    const provider = new WebsocketProvider(
        'wss://beaconx-i2ow.onrender.com/ws', 
        'beaconx-demo-room',
        ydoc
    );

    // Grab the shared Y.Array where all messages are stored
    const chatArray = ydoc.getArray('whatsapp-messages');
    const chatWindow = document.getElementById(`chat-log-${clientId}`);
    const chatInput = document.getElementById(`chat-input-${clientId}`);

    // Listen for new messages coming over the WebSocket
    chatArray.observe(() => {
        chatWindow.innerHTML = ''; // Clear the board
        
        chatArray.toArray().forEach(msg => {
            // Check if the person viewing this window is the one who sent the message
            const isMine = msg.senderId === clientId;
            
            const msgBubble = document.createElement('div');
            // Dynamically assign left (theirs) or right (mine) alignment
            msgBubble.className = `message ${isMine ? 'mine' : 'theirs'}`;
            
            // Only show the author's name if it's someone else's message
            const nameLabel = isMine ? '' : `<div class="sender-name">${msg.senderName}</div>`;
            
            msgBubble.innerHTML = `${nameLabel}<div>${msg.text}</div>`;
            chatWindow.appendChild(msgBubble);
        });
        
        // Auto-scroll to the bottom when a new message drops
        chatWindow.scrollTop = chatWindow.scrollHeight;
    });

    // Fire the message into the Y.Array when Enter is pressed
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && chatInput.value.trim() !== '') {
            chatArray.push([{
                senderId: clientId,
                senderName: clientName,
                text: chatInput.value.trim()
            }]);
            chatInput.value = ''; // Clear the input field
        }
    });

    provider.on('status', event => {
        if (event.status === 'connected') {
            connectedClients++;
        } else {
            connectedClients--;
        }
        
        if (connectedClients > 0) {
            statusElement.innerText = `🟢 ${connectedClients}/2 Clients Connected`;
            statusElement.style.backgroundColor = '#2ecc71';
        } else {
            statusElement.innerText = '🔴 Disconnected';
            statusElement.style.backgroundColor = '#e74c3c';
        }
    });
}

// Pass "1" and "2" as unique IDs so the logic knows whose window is whose
createClient('1', 'Soumyajit'); 
createClient('2', 'Ahin');