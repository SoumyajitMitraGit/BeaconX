import os
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

app = FastAPI()

# 1. Add CORS Middleware to bypass the strict proxy/origin checks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Explicitly allow all origins and proxy traffic
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Define the WebSocket route FIRST
@app.websocket("/ws/{room}")
async def crdt_relay(websocket: WebSocket, room: str):
    await websocket.accept()
    
    # Temporary echo loop until you and Ahin integrate pycrdt-websocket
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message received in room {room}")

# 3. Mount the static frontend folder LAST 
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "../frontend")
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)