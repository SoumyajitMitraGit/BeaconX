// Import Yjs and the WebSocket provider directly via URL so you don't need npm
import * as Y from 'https://esm.sh/yjs@13.6.1';
import { WebsocketProvider } from 'https://esm.sh/y-websocket@1.5.0';
import { QuillBinding } from 'https://esm.sh/y-quill@1.2.2';

// 1. Set up the Yjs document
const ydoc = new Y.Doc();

// 2. Connect to the live Render backend Ahin deployed
const provider = new WebsocketProvider(
    'wss://beaconx-i2ow.onrender.com', 
    'beaconx-demo-room', // Any clients in this same room will sync together
    ydoc
);

// 3. Initialize the visual Quill Editor
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['code-block']
        ]
    }
});

// 4. Bind the Yjs document to the Quill Editor so it syncs keystrokes
const ytext = ydoc.getText('quill');
const binding = new QuillBinding(ytext, quill, provider.awareness);

// 5. Update the UI based on connection status
const statusElement = document.getElementById('connection-status');

provider.on('status', event => {
    if (event.status === 'connected') {
        statusElement.innerText = '🟢 Live Sync Active';
        statusElement.style.backgroundColor = '#2ecc71';
    } else {
        statusElement.innerText = '🔴 Disconnected';
        statusElement.style.backgroundColor = '#e74c3c';
    }
});
