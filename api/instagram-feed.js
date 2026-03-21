const FALLBACK_POSTS = [
    {
        imageUrl: '/blackwork_tattoo_sample_1773729152613.png',
        caption: 'Blackwork session from the studio floor.',
        permalink: 'https://www.instagram.com/mad_dog_tattoo/',
        timestamp: 'Studio Select'
    },
    {
        imageUrl: '/oldschool_tattoo_sample_1773729168004.png',
        caption: 'Classic flash energy and bold color work.',
        permalink: 'https://www.instagram.com/mad_dog_tattoo/',
        timestamp: 'Studio Select'
    },
    {
        imageUrl: '/assets/instagram/shop-front-fallback.svg',
        caption: 'Downtown Bakersfield shopfront fallback card.',
        permalink: 'https://www.instagram.com/mad_dog_tattoo/',
        timestamp: 'Fallback'
    },
    {
        imageUrl: '/assets/instagram/flash-wall-fallback.svg',
        caption: 'Flash wall fallback card for preview mode.',
        permalink: 'https://www.instagram.com/mad_dog_tattoo/',
        timestamp: 'Fallback'
    },
    {
        imageUrl: '/assets/instagram/piercing-case-fallback.svg',
        caption: 'Piercing setup fallback card for preview mode.',
        permalink: 'https://www.instagram.com/mad_dog_tattoo/',
        timestamp: 'Fallback'
    },
    {
        imageUrl: '/maddoglogo.jpg',
        caption: 'Mad Dog Tattoo branded fallback card.',
        permalink: 'https://www.instagram.com/mad_dog_tattoo/',
        timestamp: 'Studio Select'
    }
];

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const limit = clampLimit(req.query.limit);
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const businessId = process.env.INSTAGRAM_BUSINESS_ID || process.env.INSTAGRAM_USER_ID;

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=43200');

    if (!accessToken) {
        return res.status(200).json({
            source: 'fallback',
            configured: false,
            posts: FALLBACK_POSTS.slice(0, limit)
        });
    }

    const endpoint = buildInstagramEndpoint(accessToken, businessId);

    try {
        const response = await fetch(endpoint);
        const payload = await response.json();

        if (!response.ok) {
            throw new Error(payload.error?.message || 'Instagram API request failed.');
        }

        const posts = normalizePosts(payload.data).slice(0, limit);
        if (!posts.length) {
            throw new Error('Instagram API returned no usable media.');
        }

        return res.status(200).json({
            source: 'instagram',
            configured: true,
            posts
        });
    } catch (error) {
        return res.status(200).json({
            source: 'fallback',
            configured: false,
            error: error.message,
            posts: FALLBACK_POSTS.slice(0, limit)
        });
    }
};

function clampLimit(value) {
    const limit = Number.parseInt(value, 10);
    if (Number.isNaN(limit)) {
        return 6;
    }

    return Math.min(Math.max(limit, 1), 12);
}

function buildInstagramEndpoint(accessToken, businessId) {
    const fields = [
        'id',
        'caption',
        'media_type',
        'media_url',
        'permalink',
        'thumbnail_url',
        'timestamp',
        'children{media_type,media_url,thumbnail_url}'
    ].join(',');

    if (businessId) {
        return `https://graph.facebook.com/v23.0/${businessId}/media?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(accessToken)}`;
    }

    return `https://graph.instagram.com/me/media?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(accessToken)}`;
}

function normalizePosts(items = []) {
    return items
        .map((item) => {
            const firstChild = item.children?.data?.[0];
            const imageUrl = item.thumbnail_url || item.media_url || firstChild?.thumbnail_url || firstChild?.media_url;

            if (!imageUrl || !item.permalink) {
                return null;
            }

            return {
                imageUrl,
                caption: item.caption || 'Recent work from Mad Dog Tattoo.',
                permalink: item.permalink,
                timestamp: item.timestamp || 'Recent'
            };
        })
        .filter(Boolean);
}
