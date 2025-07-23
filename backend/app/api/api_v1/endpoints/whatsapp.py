from typing import Any, Dict
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import PlainTextResponse
import hashlib
import hmac
import json
import logging
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)

# WhatsApp Business API Configuration
WHATSAPP_VERIFY_TOKEN = "your_verify_token_here"  # Set this in environment
WHATSAPP_ACCESS_TOKEN = "your_access_token_here"  # Set this in environment
WHATSAPP_APP_SECRET = "your_app_secret_here"     # Set this in environment
WHATSAPP_PHONE_NUMBER_ID = "your_phone_number_id" # Set this in environment

@router.get("/webhook")
async def verify_webhook(
    request: Request,
    hub_mode: str = None,
    hub_challenge: str = None,
    hub_verify_token: str = None
):
    """Webhook verification for WhatsApp Business API"""
    try:
        # Verify the webhook
        if (hub_mode == "subscribe" and 
            hub_challenge and 
            hub_verify_token == WHATSAPP_VERIFY_TOKEN):
            logger.info("WhatsApp webhook verified successfully")
            return PlainTextResponse(hub_challenge)
        else:
            logger.warning("Webhook verification failed")
            raise HTTPException(status_code=403, detail="Verification failed")
    except Exception as e:
        logger.error(f"Webhook verification error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/webhook")
async def handle_webhook(
    request: Request,
    db: Session = Depends(deps.get_db)
):
    """Handle incoming WhatsApp messages"""
    try:
        # Verify webhook signature
        body = await request.body()
        signature = request.headers.get("X-Hub-Signature-256", "")
        
        if not verify_signature(body, signature):
            raise HTTPException(status_code=403, detail="Invalid signature")
        
        # Parse webhook data
        data = json.loads(body)
        
        # Process webhook events
        if "entry" in data:
            for entry in data["entry"]:
                if "changes" in entry:
                    for change in entry["changes"]:
                        if change.get("field") == "messages":
                            await handle_message(change["value"], db)
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Webhook handling error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def verify_signature(payload: bytes, signature: str) -> bool:
    """Verify webhook signature for security"""
    if not signature.startswith("sha256="):
        return False
    
    signature = signature[7:]  # Remove 'sha256=' prefix
    expected_signature = hmac.new(
        WHATSAPP_APP_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)

async def handle_message(message_data: Dict[str, Any], db: Session):
    """Process incoming WhatsApp message"""
    try:
        if "messages" not in message_data:
            return
        
        for message in message_data["messages"]:
            from_number = message["from"]
            message_text = message.get("text", {}).get("body", "")
            message_id = message["id"]
            
            logger.info(f"Received message from {from_number}: {message_text}")
            
            # Generate response based on message content
            response_text = generate_bot_response(message_text)
            
            # Send response back to WhatsApp
            await send_whatsapp_message(from_number, response_text)
            
    except Exception as e:
        logger.error(f"Message handling error: {e}")

def generate_bot_response(message_text: str) -> str:
    """Generate chatbot response based on message content"""
    message_lower = message_text.lower()
    
    # Property management specific responses
    if any(keyword in message_lower for keyword in ["rent", "payment", "due"]):
        return "Your rent payments are up to date! Next payment is due on the 1st of next month. Would you like me to send you a reminder?"
    
    elif any(keyword in message_lower for keyword in ["maintenance", "repair", "fix", "broken"]):
        return "I can help you schedule maintenance! Please describe what needs to be fixed and I'll create a maintenance request for you."
    
    elif any(keyword in message_lower for keyword in ["lease", "contract", "agreement"]):
        return "I can help with lease information. Would you like to review your current lease terms or have questions about renewal?"
    
    elif any(keyword in message_lower for keyword in ["invoice", "bill", "receipt"]):
        return "I can help you access your invoices and payment history. Would you like me to send you the latest invoice or payment receipt?"
    
    elif any(keyword in message_lower for keyword in ["contact", "landlord", "property manager"]):
        return "I can connect you with your property manager. Would you like me to schedule a call or send them a message on your behalf?"
    
    elif any(keyword in message_lower for keyword in ["hello", "hi", "help", "start"]):
        return """👋 Hello! I'm your RentGuy assistant. I can help you with:

• Check rent payment status
• Schedule maintenance requests  
• Access lease information
• View invoices and receipts
• Contact property management

How can I assist you today?"""
    
    else:
        return "I understand your request. Let me connect you with our property management team who can assist you further. Is this urgent?"

async def send_whatsapp_message(to_number: str, message_text: str):
    """Send message via WhatsApp Business API"""
    import aiohttp
    
    url = f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"
    
    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "text": {"body": message_text}
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data) as response:
                if response.status == 200:
                    logger.info(f"Message sent successfully to {to_number}")
                else:
                    logger.error(f"Failed to send message: {response.status}")
                    
    except Exception as e:
        logger.error(f"Error sending WhatsApp message: {e}")

@router.post("/send-message")
async def send_message_endpoint(
    request: Request,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Manual endpoint to send WhatsApp messages"""
    try:
        data = await request.json()
        to_number = data.get("to")
        message = data.get("message")
        
        if not to_number or not message:
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        await send_whatsapp_message(to_number, message)
        return {"status": "Message sent successfully"}
        
    except Exception as e:
        logger.error(f"Send message error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")