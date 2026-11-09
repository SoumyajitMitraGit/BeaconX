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

    // FIX: Bake the Enter key binding directly into the Quill configuration
    const quill = new Quill(editorSelector, {
        theme: 'snow',
        modules: { 
            toolbar: [['bold', 'italic', 'underline'], ['code-block']],
            cursors: true,
            keyboard: {
                bindings: {
                    stampNameOnEnter: {
                        key: 13,
                        handler: function(range, context) {
                            const prefix = '\n' + clientName + ': ';
                            
                            // Use 'this.quill' to reference the editor inside the config
                            this.quill.insertText(range.index, prefix, 'user');
                            this.quill.formatText(range.index + 1, prefix.length - 1, 'bold', true, 'user');
                            this.quill.setSelection(range.index + prefix.length, 0, 'user');
                            this.quill.format('bold', false, 'user');
                            
                            return false; // Prevent default Enter key behavior
                        }
                    }
                }
            }
        }
    });

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