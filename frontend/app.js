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

    // 🚨 THE BULLETPROOF FIX 🚨
    // We define our custom Enter key behavior...
    const customEnterBinding = {
        key: 13, // 13 is the keycode for Enter
        shiftKey: false, // This allows you to still use Shift+Enter for a normal blank line!
        handler: function(range, context) {
            const prefix = '\n' + clientName + ': ';
            
            quill.insertText(range.index, prefix, 'user');
            quill.formatText(range.index + 1, prefix.length - 1, 'bold', true, 'user');
            quill.setSelection(range.index + prefix.length, 0, 'user');
            quill.format('bold', false, 'user');
            
            return false; // Kills Quill's default Enter behavior
        }
    };

    // ...and then we forcibly shove it into the absolute FRONT (unshift) 
    // of Quill's internal keyboard event array so it fires first!
    if (quill.keyboard.bindings[13]) {
        quill.keyboard.bindings[13].unshift(customEnterBinding);
    } else {
        quill.keyboard.bindings[13] = [customEnterBinding];
    }

    const ytext = ydoc.getText('quill');
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

// Instantiate with names and cursor colors
createClient('#editor-1', 'Soumyajit', '#3498db'); 
createClient('#editor-2', 'Ahin', '#e74c3c');