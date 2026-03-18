// SPLASH SCREEN LOGIC
window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('fade-out');
            document.body.style.overflow = 'auto';
        }, 2200);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Prevent scroll until splash is done
    document.body.style.overflow = 'hidden';

    // PARALLAX EFFECT for Panels
    window.addEventListener('scroll', () => {
        const panels = document.querySelectorAll('.parallax-section');
        panels.forEach(panel => {
            const speed = 0.08;
            const rect = panel.getBoundingClientRect();
            const offset = (window.innerHeight - rect.top) * speed;
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                // Subtle parallax on the container or background can go here
                // For now, keeping it clean to avoid stutter
            }
        });
    });

    // INSTAGRAM GRID INTERACTIVITY
    const instaItems = document.querySelectorAll('.insta-item');
    instaItems.forEach(item => {
        item.onclick = () => openQuickConsult("Regarding one of the recent Instagram pieces:");
    });

    // MODAL & BOT LOGIC
    const modal = document.getElementById('quick-consult-modal');
    const closeBtn = document.querySelector('.close-modal');
    const triggers = document.querySelectorAll('.quick-consult-trigger');

    function openQuickConsult(initialMsg = null) {
        modal.style.display = 'block';
        if (initialMsg) {
            startBot(initialMsg);
        } else {
            startBot();
        }
    }

    triggers.forEach(t => t.addEventListener('click', () => openQuickConsult()));
    closeBtn.onclick = () => { modal.style.display = 'none'; resetBot(); };
    window.onclick = (e) => { if (e.target == modal) { modal.style.display = 'none'; resetBot(); } };

    // BOT STATE MACHINE
    const messagesContainer = document.getElementById('bot-messages');
    const inputArea = document.getElementById('bot-input-area');
    let currentState = 'START';
    let formData = {};

    function addMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = `bot-msg msg-${sender}`;
        msg.innerText = text;
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function resetBot() {
        messagesContainer.innerHTML = '';
        inputArea.innerHTML = '';
        currentState = 'START';
        formData = {};
    }

    function startBot(prefill = null) {
        resetBot();
        if (prefill) addMessage(`Client attached: "${prefill}"`, 'user');
        addMessage("Yo! I'm the Mad Dog Intake Bot. What are we looking to get done?", "bot");
        createOptions([
            { label: "Tattoo", value: "TATTOO" },
            { label: "Piercing", value: "PIERCING" },
            { label: "Price Check", value: "PRICE" }
        ]);
    }

    function createOptions(options) {
        inputArea.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-tertiary';
            btn.innerText = opt.label;
            btn.onclick = () => handleChoice(opt.value, opt.label);
            inputArea.appendChild(btn);
        });
    }

    function handleChoice(value, label) {
        addMessage(label, 'user');
        
        switch(currentState) {
            case 'START':
                formData.type = value;
                if (value === 'TATTOO') {
                    currentState = 'TATTOO_STYLE';
                    addMessage("Nice. What style peaks your interest?", "bot");
                    createOptions([
                        { label: "Blackwork", value: "BLACKWORK" },
                        { label: "Old School", value: "OLDSCHOOL" },
                        { label: "Cover-Up", value: "COVERUP" },
                        { label: "Lettering", value: "LETTERING" }
                    ]);
                } else if (value === 'PIERCING') {
                    addMessage("Cool. Pop by the shop for body piercings—we're at 1218 19th St. Want to see jewelry options?", "bot");
                    createOptions([{ label: "Yes", value: "YES" }, { label: "Just checking", value: "DONE" }]);
                } else {
                    addMessage("Prices vary by artist. Most small tattoos start at shop min. Want a rough estimate?", "bot");
                    createOptions([{ label: "Yes, estimate me", value: "ESTIMATE" }]);
                }
                break;
            case 'TATTOO_STYLE':
                formData.style = value;
                currentState = 'TATTOO_SIZE';
                addMessage(`Got it, ${label}. How big are we thinking?`, "bot");
                createOptions([
                    { label: "Small (under 2\")", value: "SMALL" },
                    { label: "Medium (palm size)", value: "MEDIUM" },
                    { label: "Large (multi-session)", value: "LARGE" }
                ]);
                break;
            case 'TATTOO_SIZE':
                formData.size = value;
                addMessage("Bakersfield summers are brutal on fresh ink. Make sure you can stay out of the sun for 2 weeks. Ready to book a sit-down?", "bot");
                createOptions([
                    { label: "Request Time", value: "TIME" },
                    { label: "Call Shop Instead", value: "CALL" }
                ]);
                currentState = 'FINAL';
                break;
            case 'FINAL':
                addMessage("Bet. Call (661) 322-8282 or hit us up on 19th St to lock it in. We'll have your info ready.", "bot");
                inputArea.innerHTML = '<p>Intake Complete. See you at the shop.</p>';
                break;
        }
    }
});
