import * as Y from 'https://esm.sh/yjs';
import { WebsocketProvider } from 'https://esm.sh/y-websocket?deps=yjs';
import { QuillBinding } from 'https://esm.sh/y-quill?deps=yjs';

const statusElement = document.getElementById('connection-status');
let connectedClients = 0;

// Register the cursors plugin with Quill
Quill.register('modules/cursors', window.QuillCursors);

// Pass in the name and a specific color for each client
function createClient(editorSelector, clientName, cursorColor) {
    const ydoc = new Y.Doc();
    
    const provider = new WebsocketProvider(
        'wss://beaconx-i2ow.onrender.com/ws', 
        'beaconx-demo-room',
        ydoc
    );

    // 1. Tell Yjs who this user is and what color their cursor should be
    provider.awareness.setLocalStateField('user', {
        name: clientName,
        color: cursorColor
    });

    const quill = new Quill(editorSelector, {
        theme: 'snow',
        modules: { 
            toolbar: [['bold', 'italic', 'underline'], ['code-block']],
            cursors: true // 2. Turn on the live cursors module
        }
    });

    const ytext = ydoc.getText('quill');
    
    // 3. The binding automatically syncs both the text AND the cursor positions
    const binding = new QuillBinding(ytext, quill, provider.awareness);

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

// Instantiate with names and unique hex colors for the cursors
createClient('#editor-1', 'Soumyajit', '#3498db'); // Blue cursor
createClient('#editor-2', 'Ahin', '#e74c3c');      // Red cursor