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
                    ['stamp'] 
                ],
                handlers: {
                    'stamp': function() {
                        const range = this.quill.getSelection(true);
                        const prefix = '\n' + clientName + ': ';
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

    // Modern UI status update
    provider.on('status', event => {
        if (event.status === 'connected') {
            connectedClients++;
        } else {
            connectedClients--;
        }
        
        if (connectedClients > 0) {
            statusElement.innerText = `${connectedClients}/2 Connected`;
            statusElement.className = 'status-active';
        } else {
            statusElement.innerText = 'Disconnected';
            statusElement.className = 'status-offline';
        }
    });
}

// Replaced the names with Client A and Client B
createClient('#editor-1', 'Client A', '#3498db'); 
createClient('#editor-2', 'Client B', '#e74c3c');