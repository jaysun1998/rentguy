from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func

from app.db.base_class import Base

class WhatsAppConfig(Base):
    __tablename__ = "whatsapp_config"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    phone_number_id = Column(String(100), nullable=False)
    access_token = Column(Text, nullable=False)
    verify_token = Column(String(100), nullable=False)
    app_secret = Column(Text, nullable=False)
    webhook_url = Column(String(255), nullable=True)
    business_phone_number = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String(100), unique=True, index=True)
    from_number = Column(String(20), nullable=False)
    to_number = Column(String(20), nullable=False)
    message_text = Column(Text, nullable=False)
    message_type = Column(String(20), default="text")  # text, image, document, etc.
    direction = Column(String(10), nullable=False)  # incoming, outgoing
    status = Column(String(20), default="sent")  # sent, delivered, read, failed
    user_id = Column(Integer, nullable=True)  # Link to user if available
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())