from pydantic import BaseModel


class GoogleAuthRequest(BaseModel):
    token: str
    provider: str = "google"


class GoogleAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str