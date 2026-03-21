# Mad Dog Vercel Setup

## Instagram Feed

Set these environment variables in Vercel to enable the live Instagram feed:

- `INSTAGRAM_ACCESS_TOKEN`
- `INSTAGRAM_BUSINESS_ID` or `INSTAGRAM_USER_ID`

If no Instagram variables are set, the homepage shows branded fallback cards instead of breaking.

## Booking Delivery

At least one of these delivery options should be configured:

### Option 1: Email via Resend

- `RESEND_API_KEY`
- `BOOKING_TO_EMAIL`
- `BOOKING_FROM_EMAIL` (optional override)

### Option 2: Webhook

- `BOOKING_WEBHOOK_URL`

The booking form validates and works in preview mode without these variables, but production delivery requires either email or webhook configuration.
