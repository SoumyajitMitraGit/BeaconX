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

    // 🚨 THE ULTIMATE OVERRIDE: Capture Phase Event Listener 🚨
    const editorContainer = document.querySelector(editorSelector);
    editorContainer.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            // STOP Quill from ever seeing the Enter key event
            e.preventDefault();
            e.stopPropagation();
            
            const range = quill.getSelection();
            if (!range) return;
            
            const prefix = '\n' + clientName + ': ';
            
            // Insert the new line and name ('user' flag tells Yjs to sync it)
            quill.insertText(range.index, prefix, 'user');
            
            // Format the name as bold (skip the newline character)
            quill.formatText(range.index + 1, prefix.length - 1, 'bold', true, 'user');
            
            // Move cursor to the end of the newly inserted name
            quill.setSelection(range.index + prefix.length, 0, 'user');
            
            // Turn off bold for the actual message text
            quill.format('bold', false, 'user');
        }
    }, true); // <-- 'true' enables the Capture Phase, catching the key first!

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