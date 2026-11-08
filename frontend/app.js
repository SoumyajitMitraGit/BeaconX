import * as Y from 'https://esm.sh/yjs';
import { WebsocketProvider } from 'https://esm.sh/y-websocket?deps=yjs';

const statusElement = document.getElementById('connection-status');
let connectedClients = 0;

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

    // 1. Create a shared Yjs Map to hold the document state instead of a live text binding
    const sharedData = ydoc.getMap('state');

    // 2. Listen for when another client presses Enter and broadcasts their data
    sharedData.observe(() => {
        const incomingDelta = sharedData.get('content');
        if (incomingDelta) {
            // Update this editor with the incoming formatted text
            quill.setContents(incomingDelta);
        }
    });

    // 3. Intercept the Enter key to trigger the manual sync
    quill.keyboard.addBinding({ key: 'Enter' }, function(range, context) {
        // First, add the visual newline locally so the user can keep typing
        quill.insertText(range.index, '\n');
        
        // Then, grab the entire document contents (including bold/italic formatting)
        const currentContents = quill.getContents();
        
        // Push it to the shared Yjs Map, which instantly broadcasts it to the other client
        sharedData.set('content', currentContents);
        
        // Return false to prevent Quill's default Enter key behavior since we just handled it
        return false; 
    });

    // Connection status UI tracking
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

createClient('#editor-1');
createClient('#editor-2');