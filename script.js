const FALLBACK_POSTS = [
    {
        imageUrl: 'blackwork_tattoo_sample_1773729152613.png',
        caption: 'Blackwork session from the studio floor.',
        permalink: 'https://www.instagram.com/mad_dog_tattoo/',
        timestamp: 'Studio Select'
    },
    {
        imageUrl: 'oldschool_tattoo_sample_1773729168004.png',
        caption: 'Classic flash energy and bold color work.',
        permalink: 'https://www.instagram.com/mad_dog_tattoo/',
        timestamp: 'Studio Select'
    },
    {
        imageUrl: 'assets/instagram/shop-front-fallback.svg',
        caption: 'Downtown Bakersfield shopfront fallback card.',
        permalink: 'https://www.instagram.com/mad_dog_tattoo/',
        timestamp: 'Fallback'
    },
    {
        imageUrl: 'assets/instagram/flash-wall-fallback.svg',
        caption: 'Flash wall fallback card for preview mode.',
        permalink: 'https://www.instagram.com/mad_dog_tattoo/',
        timestamp: 'Fallback'
    },
    {
        imageUrl: 'assets/instagram/piercing-case-fallback.svg',
        caption: 'Piercing setup fallback card for preview mode.',
        permalink: 'https://www.instagram.com/mad_dog_tattoo/',
        timestamp: 'Fallback'
    },
    {
        imageUrl: 'maddog_bulldog_v2.jpg',
        caption: 'Mad Dog Tattoo branded fallback card.',
        permalink: 'https://www.instagram.com/mad_dog_tattoo/',
        timestamp: 'Studio Select'
    }
];

const PREFILL_STORAGE_KEY = 'madDogBookingPrefill';

window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    if (!splash) {
        document.body.style.overflow = 'auto';
        return;
    }

    setTimeout(() => {
        splash.classList.add('fade-out');
        document.body.style.overflow = 'auto';
    }, 1500);
});

document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash-screen');
    document.body.style.overflow = splash ? 'hidden' : 'auto';

    initNavigation();
    initRevealAnimations();
    initQuickConsult();
    initBookingForm();
});

function initNavigation() {
    const nav = document.querySelector('.main-nav');
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');

    if (!nav || !toggle || !links) {
        return;
    }

    toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('nav-open', isOpen);
    });

    links.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-open');
            document.body.classList.remove('nav-open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

function initRevealAnimations() {
    const revealItems = document.querySelectorAll('.reveal');

    if (!revealItems.length) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18 });

    revealItems.forEach((item) => observer.observe(item));
}

function initQuickConsult() {
    const modal = document.getElementById('quick-consult-modal');
    const closeBtn = document.querySelector('.close-modal');
    const triggers = document.querySelectorAll('.quick-consult-trigger');
    const messagesContainer = document.getElementById('bot-messages');
    const inputArea = document.getElementById('bot-input-area');

    if (!modal || !closeBtn || !messagesContainer || !inputArea) {
        return;
    }

    let state = 'service';
    let session = {
        artist: 'No Preference',
        service: '',
        scope: '',
        timing: ''
    };

    const addMessage = (text, sender) => {
        const msg = document.createElement('div');
        msg.className = `bot-msg msg-${sender}`;
        msg.innerText = text;
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const resetBot = () => {
        messagesContainer.innerHTML = '';
        inputArea.innerHTML = '';
        state = 'service';
        session = {
            artist: 'No Preference',
            service: '',
            scope: '',
            timing: ''
        };
    };

    const createOptions = (options) => {
        inputArea.innerHTML = '';
        options.forEach((option) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-tertiary';
            button.innerText = option.label;
            button.addEventListener('click', () => handleChoice(option.value, option.label));
            inputArea.appendChild(button);
        });
    };

    const bookingUrl = () => {
        if (document.body.dataset.bookingUrl) {
            return document.body.dataset.bookingUrl;
        }

        return window.location.pathname.includes('/artists/')
            ? '../index.html#booking'
            : '#booking';
    };

    const persistPrefill = () => {
        const summary = [
            `Quick Consult Summary`,
            `Artist: ${session.artist || 'No Preference'}`,
            `Service: ${session.service || 'Tattoo'}`,
            `Project Scope: ${session.scope || 'Need consult'}`,
            `Timing: ${session.timing || 'Flexible'}`,
            '',
            'Project notes:'
        ].join('\n');

        localStorage.setItem(PREFILL_STORAGE_KEY, JSON.stringify({
            artist: session.artist || 'No Preference',
            service: session.service || 'tattoo',
            availability: session.timing || 'flexible',
            message: summary + '\n'
        }));
    };

    const openQuickConsult = (seed = {}) => {
        resetBot();
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (seed.artist) {
            session.artist = seed.artist;
        }

        if (seed.service) {
            session.service = seed.service;
        }

        addMessage('What are you trying to book?', 'bot');
        if (session.artist && session.artist !== 'No Preference') {
            addMessage(`Routing note: this request started from ${session.artist}'s page.`, 'bot');
        }

        createOptions([
            { label: 'Tattoo', value: 'tattoo' },
            { label: 'Cover-Up', value: 'cover-up' },
            { label: 'Piercing', value: 'piercing' },
            { label: 'Consultation', value: 'consultation' }
        ]);
    };

    const closeModal = () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    };

    const scrollToBooking = () => {
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            hydratePrefill(bookingForm);
            closeModal();
            bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        persistPrefill();
        window.location.href = bookingUrl();
    };

    const handleChoice = (value, label) => {
        addMessage(label, 'user');

        if (state === 'service') {
            session.service = value;
            state = 'scope';
            addMessage('How big or involved is the project?', 'bot');
            createOptions([
                { label: 'Small / simple', value: 'small-simple' },
                { label: 'Medium piece', value: 'medium-piece' },
                { label: 'Large custom project', value: 'large-project' },
                { label: 'Need advice first', value: 'need-consult' }
            ]);
            return;
        }

        if (state === 'scope') {
            session.scope = value;
            state = 'timing';
            addMessage('How soon are you trying to get in?', 'bot');
            createOptions([
                { label: 'Same week', value: 'same-week' },
                { label: 'Next 2 weeks', value: 'next-two-weeks' },
                { label: 'Flexible', value: 'flexible' }
            ]);
            return;
        }

        if (state === 'timing') {
            session.timing = value;
            state = 'final';
            addMessage('Want me to prefill the booking request or would you rather call the shop?', 'bot');
            createOptions([
                { label: 'Prefill request', value: 'prefill' },
                { label: 'Call shop', value: 'call' }
            ]);
            return;
        }

        if (state === 'final') {
            if (value === 'prefill') {
                persistPrefill();
                scrollToBooking();
                return;
            }

            closeModal();
            window.location.href = 'tel:6613228282';
        }
    };

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            openQuickConsult({
                artist: trigger.dataset.artist || 'No Preference',
                service: trigger.dataset.service || 'tattoo'
            });
        });
    });

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}

async function initInstagramFeed() {
    const feed = document.getElementById('instagram-feed');
    const status = document.getElementById('instagram-feed-status');

    if (!feed || !status) {
        return;
    }

    try {
        const response = await fetch('/api/instagram-feed?limit=6');
        if (!response.ok) {
            throw new Error(`Feed request failed with ${response.status}`);
        }

        const payload = await response.json();
        const posts = Array.isArray(payload.posts) && payload.posts.length ? payload.posts : FALLBACK_POSTS;
        const usingFallback = payload.source !== 'instagram';

        renderInstagramPosts(feed, posts);
        status.innerText = usingFallback
            ? 'Showing studio selects while the live feed catches up.'
            : 'Latest work pulled from the official Instagram feed.';
    } catch (error) {
        renderInstagramPosts(feed, FALLBACK_POSTS);
        status.innerText = 'Showing studio selects while the live feed catches up.';
    }
}

function renderInstagramPosts(feed, posts) {
    feed.innerHTML = '';

    posts.slice(0, 6).forEach((post) => {
        const card = document.createElement('a');
        card.className = 'insta-card';
        card.href = post.permalink || 'https://www.instagram.com/mad_dog_tattoo/';
        card.target = '_blank';
        card.rel = 'noreferrer';

        const media = document.createElement('div');
        media.className = 'insta-media';

        const image = document.createElement('img');
        image.src = post.imageUrl;
        image.alt = post.caption || 'Mad Dog Tattoo Instagram post';
        image.loading = 'lazy';
        media.appendChild(image);

        const overlay = document.createElement('div');
        overlay.className = 'insta-card-copy';

        const caption = document.createElement('p');
        caption.className = 'insta-caption';
        caption.innerText = truncateText(post.caption || 'Recent work from Mad Dog Tattoo.', 120);

        const meta = document.createElement('span');
        meta.className = 'insta-meta';
        meta.innerText = formatTimestamp(post.timestamp);

        overlay.appendChild(caption);
        overlay.appendChild(meta);
        card.appendChild(media);
        card.appendChild(overlay);
        feed.appendChild(card);
    });
}

function initBookingForm() {
    const form = document.getElementById('booking-form');
    const dateField = document.getElementById('booking-date');

    if (dateField) {
        dateField.min = new Date().toISOString().split('T')[0];
    }

    if (!form) {
        return;
    }

    hydratePrefill(form);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname);

        if (!form.reportValidity()) {
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const feedback = document.getElementById('booking-feedback');
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        if (feedback) {
            feedback.className = 'booking-feedback booking-feedback-pending';
            feedback.innerText = 'Sending booking request...';
        }

        submitButton.disabled = true;
        submitButton.innerText = 'Sending...';

        try {
            const response = await fetch('/api/booking-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Booking request failed.');
            }

            if (result.configured) {
                if (feedback) {
                    feedback.className = 'booking-feedback booking-feedback-success';
                    feedback.innerText = `Request sent. Reference: ${result.requestId}. The desk will follow up through the contact info you provided.`;
                }

                form.reset();
                localStorage.removeItem(PREFILL_STORAGE_KEY);
            } else if (isLocalPreview) {
                if (feedback) {
                    feedback.className = 'booking-feedback booking-feedback-warning';
                    feedback.innerText = `Preview mode is working. Request ${result.requestId} was validated, but delivery still needs to be connected before launch.`;
                }

                form.reset();
                localStorage.removeItem(PREFILL_STORAGE_KEY);
            } else if (feedback) {
                feedback.className = 'booking-feedback booking-feedback-error';
                feedback.innerText = 'Booking requests are temporarily offline. Call the shop at (661) 322-8282 so the desk can help you directly.';
            }
        } catch (error) {
            if (feedback) {
                feedback.className = 'booking-feedback booking-feedback-error';
                feedback.innerText = `${error.message} If this is urgent, call the shop at (661) 322-8282.`;
            }
        } finally {
            submitButton.disabled = false;
            submitButton.innerText = 'Send Booking Request';
        }
    });
}

function hydratePrefill(form) {
    const raw = localStorage.getItem(PREFILL_STORAGE_KEY);
    if (!raw) {
        return;
    }

    try {
        const prefill = JSON.parse(raw);
        const artist = form.querySelector('[name="artist"]');
        const service = form.querySelector('[name="service"]');
        const availability = form.querySelector('[name="availability"]');
        const message = form.querySelector('[name="message"]');

        if (artist && prefill.artist) {
            artist.value = prefill.artist;
        }

        if (service && prefill.service) {
            service.value = prefill.service;
        }

        if (availability && prefill.availability) {
            availability.value = prefill.availability;
        }

        if (message && prefill.message) {
            message.value = prefill.message;
        }

        localStorage.removeItem(PREFILL_STORAGE_KEY);
    } catch (error) {
        localStorage.removeItem(PREFILL_STORAGE_KEY);
    }
}

function truncateText(value, limit) {
    if (!value || value.length <= limit) {
        return value;
    }

    return `${value.slice(0, limit - 1).trim()}…`;
}

function formatTimestamp(value) {
    if (!value || value === 'Fallback' || value === 'Studio Select') {
        return value || 'Recent';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Recent';
    }

    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
