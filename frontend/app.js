import * as Y from 'https://esm.sh/yjs';
import { WebsocketProvider } from 'https://esm.sh/y-websocket?deps=yjs';
import { QuillBinding } from 'https://esm.sh/y-quill?deps=yjs';

const statusElement = document.getElementById('connection-status');
let connectedClients = 0;

// Reusable function to create an editor instance
function createClient(editorSelector) {
    const ydoc = new Y.Doc();
    
    const provider = new WebsocketProvider(
        'wss://beaconx-i2ow.onrender.com/ws', 
        'beaconx-demo-room',
        ydoc
    );

    const quill = new Quill(editorSelector, {
        theme: 'snow',
        modules: { toolbar: [['bold', 'italic', 'underline'], ['code-block']] }
    });

    const binding = new QuillBinding(ydoc.getText('quill'), quill, provider.awareness);

    // Track connection status
    provider.on('status', event => {
        if (event.status === 'connected') {
            connectedClients++;
        } else {
            connectedClients--;
        }
        
        // Only show green if both clients connect successfully
        if (connectedClients > 0) {
            statusElement.innerText = `🟢 ${connectedClients}/2 Clients Connected`;
            statusElement.style.backgroundColor = '#2ecc71';
        } else {
            statusElement.innerText = '🔴 Disconnected';
            statusElement.style.backgroundColor = '#e74c3c';
        }
    });
}

// Instantiate two completely separate clients on the same page
createClient('#editor-1');
createClient('#editor-2');