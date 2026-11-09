import * as Y from 'https://esm.sh/yjs';
import { WebsocketProvider } from 'https://esm.sh/y-websocket?deps=yjs';
import { QuillBinding } from 'https://esm.sh/y-quill?deps=yjs';

const statusElement = document.getElementById('connection-status');
let connectedClients = 0;

Quill.register('modules/cursors', window.QuillCursors);

// Notice we now pass clientId (1 or 2) to hook up the right chat boxes
function createClient(clientId, clientName, cursorColor) {
    const ydoc = new Y.Doc();
    
    const provider = new WebsocketProvider(
        'wss://beaconx-i2ow.onrender.com/ws', 
        'beaconx-demo-room',
        ydoc
    );

    provider.awareness.setLocalStateField('user', {
        name: clientName,
        color: cursorColor
    });

    const quill = new Quill(`#editor-${clientId}`, {
        theme: 'snow',
        modules: { 
            toolbar: [['bold', 'italic', 'underline'], ['code-block']],
            cursors: true 
        }
    });

    const ytext = ydoc.getText('quill');
    new QuillBinding(ytext, quill, provider.awareness);

    // ==========================================
    // NEW: Live Activity Log (Y.Array)
    // ==========================================
    const chatArray = ydoc.getArray('chat');
    const chatLog = document.getElementById(`chat-log-${clientId}`);
    const chatInput = document.getElementById(`chat-input-${clientId}`);

    // 1. Listen for new messages across the WebSocket
    chatArray.observe(() => {
        chatLog.innerHTML = ''; // Clear current log
        
        chatArray.toArray().forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.style.marginBottom = '6px';
            // Formats it exactly how you wanted: Name: Message
            msgDiv.innerHTML = `<strong style="color: ${msg.color}">${msg.name}:</strong> ${msg.text}`;
            chatLog.appendChild(msgDiv);
        });
        
        // Auto-scroll to the newest message
        chatLog.scrollTop = chatLog.scrollHeight;
    });

    // 2. Send a message when Enter is pressed in the standard HTML input
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && chatInput.value.trim() !== '') {
            chatArray.push([{ 
                name: clientName, 
                color: cursorColor, 
                text: chatInput.value.trim() 
            }]);
            chatInput.value = ''; // Clear the input box
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

// Pass 1 and 2 as the first argument to target the correct DOM elements
createClient('1', 'Soumyajit', '#3498db'); 
createClient('2', 'Ahin', '#e74c3c');