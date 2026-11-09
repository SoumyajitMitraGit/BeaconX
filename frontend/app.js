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

    // NEW: Intercept the Enter key (keycode 13) to permanently stamp the user's name
    quill.keyboard.addBinding({ key: 13 }, function(range, context) {
        const prefix = '\n' + clientName + ': ';
        
        // Insert the new line and the user's name
        quill.insertText(range.index, prefix, 'user');
        
        // Make the name bold so it stands out
        quill.formatText(range.index + 1, prefix.length - 1, 'bold', true, 'user');
        
        // Move the cursor to the end of the name and switch back to normal text
        quill.setSelection(range.index + prefix.length, 0, 'user');
        quill.format('bold', false, 'user');
        
        return false; // Prevent default Enter key behavior
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

// Instantiate with names and cursor colors
createClient('#editor-1', 'Soumyajit', '#3498db'); 
createClient('#editor-2', 'Ahin', '#e74c3c');