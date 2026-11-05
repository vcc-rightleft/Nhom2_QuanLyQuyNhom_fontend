
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import Member
from schemas import MemberCreate, MemberResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Quan Ly Quy Nhom API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Backend dang hoat dong"}


@app.post("/members", response_model=MemberResponse)
def create_member(data: MemberCreate, db: Session = Depends(get_db)):
    member = Member(name=data.name, email=data.email)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@app.get("/members", response_model=list[MemberResponse])
def get_members(db: Session = Depends(get_db)):
    return db.query(Member).all()


@app.put("/members/{member_id}", response_model=MemberResponse)
def update_member(member_id: int, data: MemberCreate, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.name = data.name
    member.email = data.email
    db.commit()
    db.refresh(member)
    return member


@app.delete("/members/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(member)
    db.commit()
    return {"message": "Deleted successfully"}
