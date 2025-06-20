from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: str | None = None  # user ID or email
    email: EmailStr | None = None
    roles: list[str] = []
    exp: int | None = None  # expiration timestamp

class TokenData(BaseModel):
    email: EmailStr | None = None

class Msg(BaseModel):
    message: str
