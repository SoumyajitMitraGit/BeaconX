# BeaconX Live Sync Prototype

A real-time, collaborative rich-text editor prototype built with vanilla web technologies and Python. BeaconX leverages CRDTs (Conflict-free Replicated Data Types) to ensure sub-millisecond, conflict-free synchronization across distributed clients.

---

## Project Objectives

* Achieve real-time, character-by-character text synchronization without locking or latency.
* Maintain absolute state consistency across multiple concurrent users using Yjs CRDTs.
* Provide continuous visual awareness of user presence via Canva-style hovering cursors.
* Implement a stable, non-invasive authorship logging mechanism (Custom Toolbar Stamps) that respects native editor event handling.
* Deliver a premium, developer-focused UI featuring obsidian-slate theming, glass-morphism, and dynamic status indicators.

---

## Core Architecture

```text
       CLIENT A (Browser)                             CLIENT B (Browser)
+------------------------------+               +------------------------------+
|  Quill Editor (UI/UX)        |               |  Quill Editor (UI/UX)        |
|  + y-quill & quill-cursors   |               |  + y-quill & quill-cursors   |
|             |                |               |             |                |
|             v                |               |             v                |
|   Yjs CRDT Engine (Y.Doc)    |               |   Yjs CRDT Engine (Y.Doc)    |
|             |                |               |             |                |
|             v                |               |             v                |
| y-websocket (Awareness/Sync) |               | y-websocket (Awareness/Sync) |
+-------------+----------------+               +-------------+----------------+
              |                                              |
              |              WebSocket (wss://)              |
              +-----------------------+----------------------+
                                      |
                                      v
                           FASTAPI BACKEND (Render)
                     +----------------------------------+
                     |       Uvicorn ASGI Server        |
                     |                |                 |
                     |                v                 |
                     |    RoomManager (Active Conns)    |
                     |                |                 |
                     |                v                 |
                     |   Binary Payload Broadcaster     |
                     +----------------------------------+
```

---

## 🛠️ Tech Stack

**Frontend Environment:**
* **Core:** Vanilla HTML5 / CSS3 / ES6 JavaScript via `esm.sh`
* **Editor Engine:** Quill.js v1.3.6
* **Data Structure:** Yjs (CRDT)
* **Bindings & UI:** `y-websocket`, `y-quill`, `quill-cursors`
* **Typography:** Google Fonts 'Inter'

**Backend Environment:**
* **Core:** Python 3.10+
* **Framework:** FastAPI
* **Server:** Uvicorn (ASGI)
* **Protocol:** WebSockets (Binary data broadcast relay)

---

## 🚀 Key Features

* **Yjs CRDT Synchronization:** Uses mathematical vectors to merge document edits locally and remotely without ever requiring a central "source of truth" database to resolve conflicts.
* **Awareness Protocol:** Client identities, connection states, and unique cursor colors are broadcast via the Yjs awareness state, rendering real-time floating name badges over active carets.
* **API-Native Tooling:** Features a custom Quill toolbar handler to safely inject bolded authorship tags (e.g., **Client A:**) without hijacking core DOM keyboard events.
* **Premium UI/UX:** Styled with modern IDE aesthetics, including custom minimalist scrollbars, active-window focus rings, ghost buttons, and an animated WebSocket status indicator.

---

## 📁 Repository Structure

```text
├── main.py              # FastAPI server & WebSocket RoomManager router
├── requirements.txt     # Python dependency definitions
├── index.html           # Split-screen UI, typography, and script imports
├── style.css            # Obsidian-slate UI, animations, and Quill overrides
└── app.js               # Yjs integration, Quill setup, and custom API tools
```