from typing import List
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        data = json.dumps(message)
        disconnected = []
        for conn in list(self.active_connections):
            try:
                await conn.send_text(data)
            except Exception:
                disconnected.append(conn)
        for d in disconnected:
            self.disconnect(d)

manager = ConnectionManager()