# WhatsApp Business API Setup Guide

## Prerequisites
1. WhatsApp Business Account
2. Facebook Developer Account
3. Verified Business Phone Number

## Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" → "Business" 
3. Add WhatsApp Business API product

## Step 2: Configure WhatsApp Business API
1. In Facebook App Dashboard, go to WhatsApp → Getting Started
2. Add phone number and verify it
3. Generate access token
4. Note down:
   - `Phone Number ID`
   - `Access Token` 
   - `App Secret`
   - `Verify Token` (create your own secure string)

## Step 3: Set Environment Variables
Add these to your `.env` file:

```bash
WHATSAPP_VERIFY_TOKEN=your_secure_verify_token_here
WHATSAPP_ACCESS_TOKEN=your_facebook_access_token
WHATSAPP_APP_SECRET=your_facebook_app_secret
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

## Step 4: Configure Webhook
1. In Facebook App Dashboard, go to WhatsApp → Configuration
2. Set webhook URL to: `https://yourdomain.com/api/v1/whatsapp/webhook`
3. Set verify token to match your `WHATSAPP_VERIFY_TOKEN`
4. Subscribe to `messages` events

## Step 5: Test Integration

### Webhook Verification
The webhook will be automatically verified when Facebook calls:
```
GET /api/v1/whatsapp/webhook?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=YOUR_TOKEN
```

### Send Test Message
```bash
curl -X POST "https://yourdomain.com/api/v1/whatsapp/send-message" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Hello from RentGuy!"
  }'
```

## Step 6: Available Chatbot Commands

The chatbot responds to these keywords:

- **Rent/Payment**: Check rent status and payment info
- **Maintenance/Repair**: Schedule maintenance requests
- **Lease/Contract**: Access lease information  
- **Invoice/Bill**: View invoices and receipts
- **Contact**: Connect with property manager
- **Hello/Help**: Show available commands

## API Endpoints

- `GET /api/v1/whatsapp/webhook` - Webhook verification
- `POST /api/v1/whatsapp/webhook` - Receive messages
- `POST /api/v1/whatsapp/send-message` - Send messages manually

## Security Notes

1. **Webhook Verification**: All webhooks are verified using HMAC SHA-256
2. **Access Control**: Send message endpoint requires authentication
3. **Environment Variables**: Never commit sensitive tokens to repository
4. **HTTPS Required**: WhatsApp requires HTTPS for webhook URLs

## Troubleshooting

### Common Issues:
1. **Webhook not verified**: Check verify token matches exactly
2. **Messages not received**: Ensure webhook URL is accessible 
3. **Failed to send**: Verify access token and phone number ID
4. **Signature verification fails**: Check app secret configuration

### Testing Locally:
Use ngrok to expose local webhook for testing:
```bash
ngrok http 8000
# Use the https URL for webhook configuration
```

## Message Flow

1. User sends WhatsApp message to business number
2. Facebook sends webhook to `/api/v1/whatsapp/webhook`
3. Backend processes message and generates response
4. Response sent back via Facebook Graph API
5. User receives response in WhatsApp

## Database Schema

### WhatsAppConfig
- Stores API credentials and configuration per user
- Links to user accounts for multi-tenant support

### WhatsAppMessage  
- Logs all incoming and outgoing messages
- Tracks message status and delivery
- Links to user accounts when possible