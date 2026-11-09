import * as Y from 'https://esm.sh/yjs';
import { WebsocketProvider } from 'https://esm.sh/y-websocket?deps=yjs';
import { QuillBinding } from 'https://esm.sh/y-quill?deps=yjs';

const statusElement = document.getElementById('connection-status');
let connectedClients = 0;

Quill.register('modules/cursors', window.QuillCursors);

function createClient(editorSelector, clientName, cursorColor) {
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

    const quill = new Quill(editorSelector, {
        theme: 'snow',
        modules: { 
            toolbar: {
                container: [
                    ['bold', 'italic', 'underline'], 
                    [{ 'color': [] }], 
                    ['code-block'],
                    ['stamp'] // 🚨 NEW: Custom Toolbar Button
                ],
                handlers: {
                    // 🚨 NEW: Official API handler for our custom button
                    'stamp': function() {
                        const range = this.quill.getSelection(true);
                        const prefix = '\n' + clientName + ': ';
                        
                        // Safely insert text and format it using Quill's own engine
                        this.quill.insertText(range.index, prefix, 'user');
                        this.quill.formatText(range.index + 1, prefix.length - 1, 'bold', true, 'user');
                        this.quill.setSelection(range.index + prefix.length, 0, 'user');
                    }
                }
            },
            cursors: true 
        }
    });

    const ytext = ydoc.getText('quill');
    new QuillBinding(ytext, quill, provider.awareness);

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

createClient('#editor-1', 'Soumyajit', '#3498db'); 
createClient('#editor-2', 'Ahin', '#e74c3c');