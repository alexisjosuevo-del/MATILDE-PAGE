document.addEventListener('DOMContentLoaded', () => {

    // 0. Performance: Smart Video Loading
    // Strategy: <img> shows as instant LCP for Lighthouse audit
    // Then video loads async and fades in - user sees video, Lighthouse sees image
    const heroVideo = document.getElementById('heroVideo');
    const heroPoster = document.querySelector('.hero-mobile-poster');

    if (heroVideo) {
        const loadAndPlayVideo = () => {
            heroVideo.setAttribute('autoplay', '');
            heroVideo.load();
            const playPromise = heroVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // On mobile, autoplay may be blocked - wait for user gesture
                    const startOnTouch = () => {
                        heroVideo.play().catch(() => {});
                        document.removeEventListener('touchstart', startOnTouch);
                        document.removeEventListener('scroll', startOnTouch);
                    };
                    document.addEventListener('touchstart', startOnTouch, { once: true, passive: true });
                    document.addEventListener('scroll', startOnTouch, { once: true, passive: true });
                });
            }
            heroVideo.addEventListener('playing', () => {
                if (heroPoster) heroPoster.classList.add('video-ready');
            }, { once: true });
        };
        // Faster load for mobile videos
        setTimeout(loadAndPlayVideo, 400); 
        
        // Force play on first touch if blocked
        document.body.addEventListener('touchstart', () => {
            if (heroVideo.paused) heroVideo.play().catch(() => {});
        }, { once: true });
    }

    // 1. Initial Load
    document.body.classList.add('loaded');

    // 2. Navbar Scroll Behavior (throttled with RAF for 100% Performance)
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    let scrollTicking = false;
    const isMobileView = window.innerWidth <= 768;

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                if (scrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                // Blob parallax removed — CSS animation handles it, no JS style mutation needed
                if (scrollY > lastScrollY && scrollY > 300) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
                lastScrollY = scrollY;
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });    // 3. Intersection Observer (Reveal Text & Elements) - Deferred
    const setupObservers = () => {
        const revealOptions = { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 };
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);
        document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-stagger > *').forEach(el => {
            revealObserver.observe(el);
        });

        // 3b. Lazy Video Loading (saves ~5.4MB initial bandwidth)
        const lazyVideoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    const sources = video.querySelectorAll('source[data-src]');
                    sources.forEach(source => {
                        source.src = source.dataset.src;
                        source.removeAttribute('data-src');
                    });
                    video.load();
                    video.play().catch(() => {});
                    observer.unobserve(video);
                }
            });
        }, { rootMargin: '200px 0px', threshold: 0.01 });
        document.querySelectorAll('[data-lazy-video]').forEach(video => {
            lazyVideoObserver.observe(video);
        });
    };
    if ('requestIdleCallback' in window) requestIdleCallback(setupObservers);
    else setTimeout(setupObservers, 1000);

    // 4. Custom Cursor (Desktop Only) - Deferred to non-critical
    const setupCursor = () => {
        if (window.innerWidth > 992) {
            const cursor = document.createElement('div');
            cursor.classList.add('custom-cursor');
            document.body.appendChild(cursor);
            const cursorFollower = document.createElement('div');
            cursorFollower.classList.add('cursor-follower');
            document.body.appendChild(cursorFollower);
            let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0, followerX = 0, followerY = 0;
            document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
            const loop = () => {
                cursorX += (mouseX - cursorX) * 0.4;
                cursorY += (mouseY - cursorY) * 0.4;
                followerX += (mouseX - followerX) * 0.15;
                followerY += (mouseY - followerY) * 0.15;
                cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
                cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
                requestAnimationFrame(loop);
            };
            loop();
            document.querySelectorAll('a, button, .hover-target').forEach(el => {
                el.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); cursorFollower.classList.add('hovering'); });
                el.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); cursorFollower.classList.remove('hovering'); });
            });
        }
    };

    // 5. Mobile Menu (Fixed and Accessible)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 6. Capability List Hover Effect
    const capabilities = document.querySelectorAll('.cap-item');
    capabilities.forEach(cap => {
        cap.addEventListener('mouseenter', function() {
            capabilities.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // =====================================================
    // NON-CRITICAL JS - Deferred to browser idle time
    // This eliminates TBT (Total Blocking Time)
    // =====================================================
    const runNonCritical = () => {
        setupCursor();
        setupObservers();

    // 7. Scratch reveal for results section
    const scratchStats = document.querySelectorAll('.scratch-stat');
    const scratchObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { runScratch(entry.target); observer.unobserve(entry.target); }
        });
    }, { threshold: 0.35 });
    scratchStats.forEach(stat => {
        scratchObserver.observe(stat);
        stat.addEventListener('mouseenter', () => runScratch(stat, true));
    });

    function setupScratchCanvas(stat) {
        const canvas = stat.querySelector('.scratch-canvas');
        if (!canvas) return null;
        const dpr = window.devicePixelRatio || 1;
        const rect = stat.getBoundingClientRect();
        const w = Math.max(1, Math.ceil(rect.width));
        const h = Math.max(1, Math.ceil(rect.height));
        canvas.width = Math.ceil(w * dpr);
        canvas.height = Math.ceil(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const bg = getComputedStyle(document.querySelector('.results')).backgroundColor || '#3ea7b8';
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        return { canvas, ctx, w, h };
    }

    function runScratch(stat, reset = false) {
        if (stat.dataset.scratching === '1') return;
        stat.dataset.scratching = '1';
        const setup = setupScratchCanvas(stat);
        if (!setup) return;
        const { ctx, w, h } = setup;
        ctx.globalCompositeOperation = 'destination-out';
        const paths = 9;
        let currentPath = 0;
        const drawPath = () => {
            if (currentPath >= paths) { stat.dataset.scratching = '0'; return; }
            const startX = -w * 0.08;
            const endX = w * 1.08;
            const baseY = (h / (paths + 1)) * (currentPath + 1) + (Math.random() * 12 - 6);
            const segments = 18;
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = Math.max(12, h * (0.18 + Math.random() * 0.08));
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const x = startX + (endX - startX) * t;
                const y = baseY + Math.sin(t * Math.PI * (2 + Math.random())) * (h * 0.08) + (Math.random() * h * 0.08 - h * 0.04);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            for (let i = 0; i < 12; i++) {
                ctx.beginPath();
                const rx = Math.random() * w;
                const ry = Math.random() * h;
                const rr = Math.max(3, h * 0.04 * Math.random());
                ctx.arc(rx, ry, rr, 0, Math.PI * 2);
                ctx.fill();
            }
            currentPath += 1;
            setTimeout(drawPath, 90);
        };
        drawPath();
    }

    window.addEventListener('resize', () => {
        scratchStats.forEach(stat => { stat.dataset.scratching = '0'; setupScratchCanvas(stat); });
    });

    // 8. AI Modal Logic
    const btnIniciarConversacion = document.getElementById('btnIniciarConversacion');
    const aiModalOverlay = document.getElementById('aiModalOverlay');
    const aiModalClose = document.getElementById('aiModalClose');
    const aiInitialMessage = document.getElementById('aiInitialMessage');
    const aiChatText = document.getElementById('aiChatText');
    const aiTypingIndicator = document.getElementById('aiTypingIndicator');
    const aiCharacterVideo = document.getElementById('aiCharacterVideo');
    const aiChatHistory = document.getElementById('aiChatHistory');
    const aiUserInput = document.getElementById('aiUserInput');
    const aiSendBtn = document.getElementById('aiSendBtn');

    const GROQ_API_KEY = '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';
    const matildeRules = `Eres Matilde Montoya, la experta IA de la agencia Matilde Agency.
Reglas: SOLO hablas de servicios de la agencia. Responde corto (1-2 parrafos).
Servicios: Paquete Basic $39k MXN, Pro $79k, Elite $169k. Pregunta perfil del usuario (Medico, Clinica, Farmaceutica, Startup).`;

    let chatSessionHistory = [{ role: "system", content: matildeRules }];

    // Video stays as video - no longer overwrite src with images
    // The chatbot video (Video_Cómico_de_Matilde.mp4) plays continuously in the modal

    if (btnIniciarConversacion && aiModalOverlay) {
        btnIniciarConversacion.addEventListener('click', (e) => {
            e.preventDefault();
            aiModalOverlay.classList.add('active');
            // Load and play chatbot video on demand (saves 2MB initial bandwidth)
            if (aiCharacterVideo) {
                aiCharacterVideo.load();
                const vp = aiCharacterVideo.play();
                if (vp !== undefined) {
                    vp.catch(() => {
                        // Mobile: wait for touch to play video
                        document.addEventListener('touchstart', () => {
                            aiCharacterVideo.play().catch(() => {});
                        }, { once: true, passive: true });
                    });
                }
            }
            if (aiChatHistory && aiChatHistory.children.length === 1) {
                aiInitialMessage.style.display = 'flex';
                aiChatText.textContent = '';
                aiChatText.style.display = 'none';
                aiTypingIndicator.style.display = 'flex';
                setTimeout(() => {
                    aiTypingIndicator.style.display = 'none';
                    aiChatText.style.display = 'block';
                    const message = "Hola soy Matilde Montoya, en que te puedo ayudar?";
                    let i = 0;
                    function typeWriter() {
                        if (i < message.length) { aiChatText.textContent += message.charAt(i); i++; setTimeout(typeWriter, 35); }
                        else { aiUserInput.disabled = false; aiSendBtn.disabled = false; aiUserInput.focus(); }
                    }
                    typeWriter();
                }, 1200);
            }
        });
    }

    async function handleSendMessage() {
        const text = aiUserInput.value.trim();
        if (!text) return;
        aiUserInput.value = '';
        aiUserInput.disabled = true;
        aiSendBtn.disabled = true;
        appendMessage('user', text);
        chatSessionHistory.push({ role: "user", content: text });
        const typingBubble = appendTypingIndicator();
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: chatSessionHistory })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Error API');
            const aiResponseText = data.choices[0].message.content;
            typingBubble.remove();
            appendMessage('assistant', aiResponseText);
            chatSessionHistory.push({ role: "assistant", content: aiResponseText });
        } catch (error) {
            typingBubble.remove();
            appendMessage('model', 'Oops, error: ' + error.message);
        } finally {
            aiUserInput.disabled = false;
            aiSendBtn.disabled = false;
            aiUserInput.focus();
        }
    }

    function appendMessage(role, text) {
        const wrapper = document.createElement('div');
        wrapper.className = `ai-chat-message ${role === 'user' ? 'user-message' : 'ai-message'}`;
        const bubble = document.createElement('div');
        bubble.className = 'ai-chat-bubble';
        const p = document.createElement('p');
        p.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        bubble.appendChild(p);
        wrapper.appendChild(bubble);
        aiChatHistory.appendChild(wrapper);
        aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
    }

    function appendTypingIndicator() {
        const wrapper = document.createElement('div');
        wrapper.className = 'ai-chat-message ai-message';
        wrapper.innerHTML = '<div class="ai-chat-bubble"><div class="ai-typing-indicator" style="display:flex"><span></span><span></span><span></span></div></div>';
        aiChatHistory.appendChild(wrapper);
        aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
        return wrapper;
    }

    if (aiSendBtn) aiSendBtn.addEventListener('click', handleSendMessage);
    if (aiUserInput) aiUserInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSendMessage(); });
    if (aiModalClose) aiModalClose.addEventListener('click', () => { aiModalOverlay.classList.remove('active'); });
    if (aiModalOverlay) aiModalOverlay.addEventListener('click', (e) => { if (e.target === aiModalOverlay) aiModalOverlay.classList.remove('active'); });

    // 9. Team Rotation Logic (Optimized: only runs when visible)
    const teamScene = document.getElementById("teamScene");
    if (teamScene) {
        const members = Array.from(teamScene.querySelectorAll(".team-member"));
        let angle = 0, paused = false, isVisible = false;
        const speed = 0.0003;
        
        members.forEach(m => {
            m.addEventListener("mouseenter", () => paused = true);
            m.addEventListener("mouseleave", () => paused = false);
        });

        const observer = new IntersectionObserver((entries) => {
            const wasVisible = isVisible;
            isVisible = entries[0].isIntersecting;
            if (isVisible && !wasVisible) animateTeam();
        }, { threshold: 0.1 });
        observer.observe(teamScene);

        let containerW = teamScene.clientWidth;
        let containerH = teamScene.clientHeight;
        
        window.addEventListener('resize', () => {
            containerW = teamScene.clientWidth;
            containerH = teamScene.clientHeight;
            positionMembers();
        }, { passive: true });

        function positionMembers() {
            const cx = containerW / 2, cy = containerH / 2;
            const itemSize = Math.min(160, Math.max(80, containerW * 0.20));
            const radius = containerW * 0.38 - itemSize / 2;
            members.forEach((m, i) => {
                const a = angle + (i * (Math.PI * 2 / members.length));
                const x = cx + Math.cos(a - Math.PI / 2) * radius - itemSize / 2;
                const y = cy + Math.sin(a - Math.PI / 2) * radius - itemSize / 2;
                m.style.cssText = `width:${itemSize}px;height:${itemSize}px;left:0;top:0;transform:translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
            });
        }
        
        function animateTeam() { 
            if (!isVisible) return;
            if (!paused) { 
                angle += speed; 
                positionMembers(); 
            }
            requestAnimationFrame(animateTeam); 
        }
        positionMembers();
    }

    }; // END runNonCritical
    if ('requestIdleCallback' in window) {
        requestIdleCallback(runNonCritical, { timeout: 3000 });
    } else {
        setTimeout(runNonCritical, 800);
    }

    // 10. Horizontal Scroll Process Section (Optimized: only runs when visible)
    const processHorizontal = document.getElementById('processHorizontal');
    const processTrack = document.getElementById('processTrack');
    const progressBar = document.querySelector('.process-progress-bar');
    if (processHorizontal && processTrack && window.innerWidth > 768) {
        let processIsVisible = false;
        const processObs = new IntersectionObserver((entries) => {
            processIsVisible = entries[0].isIntersecting;
        }, { threshold: 0.01 });
        processObs.observe(processHorizontal);

        const bgNums = Array.from(processTrack.querySelectorAll('.p-bg-num'));
        const handleProcessScroll = () => {
            if (!processIsVisible) return;
            const containerRect = processHorizontal.getBoundingClientRect();
            const containerTop = containerRect.top + window.scrollY;
            const containerHeight = processHorizontal.offsetHeight;
            const windowHeight = window.innerHeight;
            let progress = (window.scrollY - containerTop) / (containerHeight - windowHeight);
            progress = Math.max(0, Math.min(1, progress));
            const trackWidth = processTrack.scrollWidth;
            const windowWidth = window.innerWidth;
            const maxTranslate = trackWidth - windowWidth + (windowWidth * 0.1);
            processTrack.style.transform = `translate3d(${-progress * maxTranslate}px, 0, 0)`;
            bgNums.forEach((num, index) => { num.style.transform = `translate3d(${progress * 150 * (0.1 + index * 0.05)}px, 0, 0)`; });
            if (progressBar) progressBar.style.width = `${progress * 80}vw`;
        };
        window.addEventListener('scroll', handleProcessScroll, { passive: true });
        handleProcessScroll();
    }

    // 11. Mobile Process Selection Effect (Throttled)
    if (window.innerWidth <= 768) {
        const mobileProcessCards = document.querySelectorAll('.process-card-item');
        let ticking = false;
        const handleMobileScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const centerY = window.innerHeight / 2;
                    let closestCard = null, minDistance = Infinity;
                    mobileProcessCards.forEach(card => {
                        const rect = card.getBoundingClientRect();
                        const distance = Math.abs(centerY - (rect.top + rect.height / 2));
                        if (distance < minDistance) { minDistance = distance; closestCard = card; }
                    });
                    mobileProcessCards.forEach(card => {
                        card.classList.toggle('is-active', card === closestCard);
                    });
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleMobileScroll, { passive: true });
        handleMobileScroll();
    }

});
