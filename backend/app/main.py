from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
from sqlmodel import Session, select
from .db import init_db, get_session
from . import crud, models
from .websocket_manager import manager
import asyncio

init_db()
app = FastAPI(title="QuickPoll API")

# Allow frontend origin
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"],  # for dev; tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schemas
class CreatePollRequest(BaseModel):
    title: str
    description: str = ""
    options: List[str]

@app.post("/polls")
async def create_poll(payload: CreatePollRequest, session: Session = Depends(get_session)):
    if len(payload.options) < 2:
        raise HTTPException(status_code=400, detail="At least 2 options required")
    poll = crud.create_poll(session, payload.title, payload.description, payload.options)
    # broadcast minimal payload so clients re-fetch or update
    asyncio.create_task(manager.broadcast({"type":"new_poll","poll_id": poll.id, "title": poll.title}))
    return {"poll_id": poll.id}

@app.get("/polls")
def list_polls(session: Session = Depends(get_session)):
    polls = crud.list_polls(session)
    out = []
    for p in polls:
        opts = crud.get_options_for_poll(session, p.id)
        out.append({"id": p.id, "title": p.title, "description": p.description, "likes": p.likes, "created_at": p.created_at.isoformat(), "options": [{"id": o.id, "text": o.text, "votes": o.votes} for o in opts]})
    return {"polls": out}

@app.post("/polls/{poll_id}/vote")
async def vote(poll_id: int, option_id: int, session: Session = Depends(get_session)):
    try:
        opt = crud.vote(session, option_id)
        print(f"🗳️ VOTE: Poll {poll_id}, Option {option_id}, New votes: {opt.votes}")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    msg = {"type": "vote", "poll_id": poll_id, "option_id": option_id, "votes": opt.votes}
    print("📢 Broadcasting:", msg)
    asyncio.create_task(manager.broadcast(msg))
    return {"option_id": opt.id, "votes": opt.votes}

# user_votes = {}  # {poll_id: set(user_ids)}

# @app.post("/polls/{poll_id}/vote")
# async def vote(poll_id: int, option_id: int, payload: dict, session: Session = Depends(get_session)):
#     user_id = payload.get("user_id")
#     if not user_id:
#         raise HTTPException(status_code=400, detail="Missing user_id")

#     if poll_id not in user_votes:
#         user_votes[poll_id] = set()
#     if user_id in user_votes[poll_id]:
#         raise HTTPException(status_code=403, detail="Already voted")

#     opt = crud.vote(session, option_id)
#     user_votes[poll_id].add(user_id)

#     asyncio.create_task(manager.broadcast({
#         "type": "vote",
#         "poll_id": poll_id,
#         "option_id": option_id,
#         "votes": opt.votes
#     }))
#     return {"option_id": opt.id, "votes": opt.votes}

@app.post("/polls/{poll_id}/like")
async def like(poll_id: int, session: Session = Depends(get_session)):
    try:
        poll = crud.like_poll(session, poll_id)
        print(f"❤️ LIKE: Poll {poll_id}, New likes: {poll.likes}")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    msg = {"type": "like", "poll_id": poll_id, "likes": poll.likes}
    print("📢 Broadcasting:", msg)
    asyncio.create_task(manager.broadcast(msg))
    return {"poll_id": poll.id, "likes": poll.likes}

@app.websocket("/ws/polls")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    print(f"WebSocket connected: {websocket.client}")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"WebSocket disconnected: {websocket.client}")
