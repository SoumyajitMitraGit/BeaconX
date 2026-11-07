import os
from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
import uvicorn

app = FastAPI()

# Automatically resolve the absolute path to the frontend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "../frontend")

# Mount the frontend directory to serve index.html statically
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

# Placeholder for the CRDT WebSocket relay
@app.websocket("/ws/{room}")
async def crdt_relay(websocket: WebSocket, room: str):
    await websocket.accept()
    # pycrdt-websocket integration will go here
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message received in room {room}: {data}")

if __name__ == "__main__":
    # Binding to 0.0.0.0 allows access from other devices on the hotspot
    uvicorn.run(app, host="0.0.0.0", port=8000)