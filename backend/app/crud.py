from typing import List, Optional
from sqlmodel import select, Session
from .models import Poll, PollOption

def create_poll(session: Session, title: str, description: str, options: List[str]) -> Poll:
    poll = Poll(title=title, description=description)
    session.add(poll)
    session.commit()
    session.refresh(poll)
    for opt_text in options:
        opt = PollOption(poll_id=poll.id, text=opt_text)
        session.add(opt)
    session.commit()
    return poll

def list_polls(session: Session, limit: int = 100):
    statement = select(Poll).order_by(Poll.created_at.desc()).limit(limit)
    return session.exec(statement).all()

def get_poll(session: Session, poll_id: int) -> Optional[Poll]:
    return session.get(Poll, poll_id)

def get_options_for_poll(session: Session, poll_id: int):
    statement = select(PollOption).where(PollOption.poll_id == poll_id)
    return session.exec(statement).all()

def vote(session: Session, option_id: int):
    opt = session.get(PollOption, option_id)
    if not opt:
        raise ValueError("Option not found")
    opt.votes += 1
    session.add(opt)
    session.commit()
    session.refresh(opt)
    return opt

def like_poll(session: Session, poll_id: int):
    poll = session.get(Poll, poll_id)
    if not poll:
        raise ValueError("Poll not found")
    poll.likes += 1
    session.add(poll)
    session.commit()
    session.refresh(poll)
    return poll