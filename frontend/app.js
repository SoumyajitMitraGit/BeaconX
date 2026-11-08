// Add ?deps=yjs to force the CDN to share a single instance of Yjs
import * as Y from 'https://esm.sh/yjs';
import { WebsocketProvider } from 'https://esm.sh/y-websocket?deps=yjs';
import { QuillBinding } from 'https://esm.sh/y-quill?deps=yjs';

const ydoc = new Y.Doc();

// Notice the /ws at the end of the URL. 
// y-websocket will automatically append /beaconx-demo-room to it!
const provider = new WebsocketProvider(
    'wss://beaconx-i2ow.onrender.com/ws', 
    'beaconx-demo-room',
    ydoc
);

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

const ytext = ydoc.getText('quill');
const binding = new QuillBinding(ytext, quill, provider.awareness);

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