from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class PollOption(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    poll_id: Optional[int] = Field(default=None, foreign_key="poll.id")
    text: str
    votes: int = 0

class Poll(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    likes: int = 0