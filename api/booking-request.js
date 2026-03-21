module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const payload = normalizeBody(req.body);
    const validationError = validatePayload(payload);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    if (payload.website) {
        return res.status(200).json({
            ok: true,
            configured: false,
            requestId: createRequestId(),
            delivery: ['honeypot']
        });
    }

    const requestId = createRequestId();
    const delivery = [];
    const summary = buildSummary(payload, requestId);
    const emailEnabled = Boolean(process.env.RESEND_API_KEY && process.env.BOOKING_TO_EMAIL);
    const webhookEnabled = Boolean(process.env.BOOKING_WEBHOOK_URL);

    try {
        if (webhookEnabled) {
            await sendWebhook(summary, payload, requestId);
            delivery.push('webhook');
        }

        if (emailEnabled) {
            await sendEmail(summary, payload, requestId);
            delivery.push('email');
        }

        return res.status(200).json({
            ok: true,
            configured: delivery.length > 0,
            requestId,
            delivery: delivery.length ? delivery : ['preview']
        });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Booking delivery failed.' });
    }
};

function normalizeBody(body) {
    if (!body) {
        return {};
    }

    if (typeof body === 'string') {
        try {
            return JSON.parse(body);
        } catch (error) {
            return {};
        }
    }

    return body;
}

function validatePayload(payload) {
    const requiredFields = ['name', 'email', 'phone', 'service', 'artist', 'placement', 'budget', 'availability', 'message', 'consent'];

    for (const field of requiredFields) {
        if (!payload[field]) {
            return `Missing required field: ${field}.`;
        }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        return 'Please provide a valid email address.';
    }

    if (String(payload.message).trim().length < 20) {
        return 'Please add a few more details about the project.';
    }

    return null;
}

function createRequestId() {
    return `MD-${Date.now().toString(36).toUpperCase()}`;
}

function buildSummary(payload, requestId) {
    return [
        `Mad Dog Tattoo booking request ${requestId}`,
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Phone: ${payload.phone}`,
        `Instagram: ${payload.instagram || 'Not provided'}`,
        `Service: ${payload.service}`,
        `Preferred artist: ${payload.artist}`,
        `Placement: ${payload.placement}`,
        `Budget: ${payload.budget}`,
        `Preferred date: ${payload.preferredDate || 'Not provided'}`,
        `Availability: ${payload.availability}`,
        `Reference URL: ${payload.referenceUrl || 'Not provided'}`,
        '',
        'Project details:',
        payload.message
    ].join('\n');
}

async function sendWebhook(summary, payload, requestId) {
    const response = await fetch(process.env.BOOKING_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            requestId,
            summary,
            lead: payload
        })
    });

    if (!response.ok) {
        throw new Error(`Webhook delivery failed with status ${response.status}.`);
    }
}

async function sendEmail(summary, payload, requestId) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: process.env.BOOKING_FROM_EMAIL || 'Mad Dog Tattoo <onboarding@resend.dev>',
            to: [process.env.BOOKING_TO_EMAIL],
            subject: `New booking request ${requestId}`,
            reply_to: payload.email,
            text: summary
        })
    });

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || `Email delivery failed with status ${response.status}.`);
    }
}
