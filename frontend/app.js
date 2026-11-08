import * as Y from 'https://esm.sh/yjs';
import { WebsocketProvider } from 'https://esm.sh/y-websocket?deps=yjs';
import { QuillBinding } from 'https://esm.sh/y-quill?deps=yjs';

const statusElement = document.getElementById('connection-status');
let connectedClients = 0;

// We added 'clientName' as a parameter to know who is typing
function createClient(editorSelector, clientName) {
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

    // 1. Re-enable the real-time character-by-character sync!
    const ytext = ydoc.getText('quill');
    const binding = new QuillBinding(ytext, quill, provider.awareness);

    // 2. Automatically inject the client's name when they press Enter
    quill.keyboard.addBinding({ key: 13 }, function(range, context) {
        // Create the prefix (e.g., "\nClient A: ")
        const prefix = '\n' + clientName + ': ';
        
        // Insert it at the current cursor position and make the name bold
        quill.insertText(range.index, prefix, 'bold', true);
        
        // Move the user's cursor to the end of the new prefix so they can start typing
        quill.setSelection(range.index + prefix.length);
        
        // Turn off bold so their actual message is regular text
        quill.format('bold', false);
        
        return false; 
    });

    // Connection status tracking
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

// Pass the names into the function so it knows how to prefix their messages
createClient('#editor-1', 'Client A');
createClient('#editor-2', 'Client B');