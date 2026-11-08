import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

app = FastAPI()

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. WebSocket Room Manager (The Broadcast Relay)
class RoomManager:
    def __init__(self):
        # Dictionary to store active connections per room: {"room_name": [websocket1, websocket2]}
        self.rooms: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room: str):
        await websocket.accept()
        if room not in self.rooms:
            self.rooms[room] = []
        self.rooms[room].append(websocket)

    def disconnect(self, websocket: WebSocket, room: str):
        if room in self.rooms and websocket in self.rooms[room]:
            self.rooms[room].remove(websocket)
            # Clean up the room if it's empty
            if not self.rooms[room]:
                del self.rooms[room]

    async def broadcast(self, message: bytes, sender: WebSocket, room: str):
        # Send the binary data to everyone in the room EXCEPT the person who sent it
        if room in self.rooms:
            for connection in self.rooms[room]:
                if connection != sender:
                    await connection.send_bytes(message)

manager = RoomManager()

# 3. The WebSocket Route
@app.websocket("/ws/{room}")
async def crdt_relay(websocket: WebSocket, room: str):
    await manager.connect(websocket, room)
    try:
        while True:
            # CRITICAL FIX: Yjs uses receive_bytes, not receive_text
            data = await websocket.receive_bytes()
            await manager.broadcast(data, websocket, room)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room)
    except Exception as e:
        print(f"Error in room {room}: {e}")
        manager.disconnect(websocket, room)

# 4. Mount the static frontend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "../frontend")
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, proxy_headers=True, forwarded_allow_ips="*")