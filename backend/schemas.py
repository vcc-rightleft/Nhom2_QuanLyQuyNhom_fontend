
from pydantic import BaseModel, EmailStr, ConfigDict


class MemberCreate(BaseModel):
    name: str
    email: EmailStr


class MemberResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)
