import * as Y from 'https://esm.sh/yjs';
import { WebsocketProvider } from 'https://esm.sh/y-websocket?deps=yjs';
import { QuillBinding } from 'https://esm.sh/y-quill?deps=yjs';

const statusElement = document.getElementById('connection-status');
let connectedClients = 0;

// Register the cursors plugin
Quill.register('modules/cursors', window.QuillCursors);

function createClient(editorSelector, clientName, cursorColor) {
    const ydoc = new Y.Doc();
    
    const provider = new WebsocketProvider(
        'wss://beaconx-i2ow.onrender.com/ws', 
        'beaconx-demo-room',
        ydoc
    );

    // Keep the Canva-style floating cursors active
    provider.awareness.setLocalStateField('user', {
        name: clientName,
        color: cursorColor
    });

    const quill = new Quill(editorSelector, {
        theme: 'snow',
        modules: { 
            toolbar: [['bold', 'italic', 'underline'], ['code-block']],
            cursors: true 
        }
    });

    const ytext = ydoc.getText('quill');
    const binding = new QuillBinding(ytext, quill, provider.awareness);

    // 🚨 NEW FEATURE: Automatic Author Color Coding 🚨
    // Every time the user clicks into the editor, moves their cursor, or hits a key,
    // we invisibly switch their active font color to match their unique cursor color!
    quill.on('selection-change', function(range, oldRange, source) {
        if (range && source === 'user') {
            quill.format('color', cursorColor, 'silent');
        }
    });

    quill.root.addEventListener('keydown', () => {
        quill.format('color', cursorColor, 'silent');
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

// Instantiate with names and unique hex colors
createClient('#editor-1', 'Soumyajit', '#3498db'); // Your text will automatically type in Blue
createClient('#editor-2', 'Ahin', '#e74c3c');      // Ahin's text will automatically type in Red