document.addEventListener('DOMContentLoaded', () => {
    // 0. Performance: Video Load (Enabled for mobile as requested)
    const heroVideo = document.getElementById('heroVideo');
    if (heroVideo) {
        const source = heroVideo.querySelector('source');
        if (source && source.dataset.src) {
            source.src = source.dataset.src;
            heroVideo.load();
        }
    }

    // 1. Initial Load & Reveal
    const body = document.body;
    setTimeout(() => {
        body.classList.add('loaded');
    }, 200);

    // 2. Navbar Scroll Behavior
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Parallax for Background Blobs
        const blobs = document.querySelectorAll('.blob');
        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 0.1;
            const yOffset = window.scrollY * speed;
            blob.style.transform = `translateY(${yOffset}px)`;
        });

        // Optional: Hide navbar on scroll down, show on scroll up for editorial feel
        if (window.scrollY > lastScrollY && window.scrollY > 300) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollY = window.scrollY;
    });

    // 3. Cinematic Intersection Observer (Reveal Text & Elements)
    const revealOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

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

    // 4. Custom Cursor for Desktop (Boutique Agency feel)
    if(window.innerWidth > 992) {
        const cursor = document.createElement('div');
        cursor.classList.add('custom-cursor');
        document.body.appendChild(cursor);

        const cursorFollower = document.createElement('div');
        cursorFollower.classList.add('cursor-follower');
        document.body.appendChild(cursorFollower);

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const loop = () => {
            // Speed of follower
            cursorX += (mouseX - cursorX) * 0.4;
            cursorY += (mouseY - cursorY) * 0.4;
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;

            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px)`;
            
            requestAnimationFrame(loop);
        };
        loop();

        // Hover effect on links and buttons
        document.querySelectorAll('a, button, .hover-target').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorFollower.classList.add('hovering');
                cursor.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                cursorFollower.classList.remove('hovering');
                cursor.classList.remove('hovering');
            });
        });
    }

    // 5. Mobile Menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-links');
    
    if(menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
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

    // 7. Scratch reveal for results section
    const scratchStats = document.querySelectorAll('.scratch-stat');
    const scratchObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runScratch(entry.target);
                observer.unobserve(entry.target);
            }
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
            if (currentPath >= paths) {
                stat.dataset.scratching = '0';
                return;
            }

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
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // add scattered scratch dots
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
        scratchStats.forEach(stat => {
            stat.dataset.scratching = '0';
            setupScratchCanvas(stat);
        });
    });

    // 8. AI Modal Logic & Gemini API
    const btnIniciarConversacion = document.getElementById('btnIniciarConversacion');
    const aiModalOverlay = document.getElementById('aiModalOverlay');
    const aiModalClose = document.getElementById('aiModalClose');
    const aiInitialMessage = document.getElementById('aiInitialMessage');
    const aiChatText = document.getElementById('aiChatText');
    const aiTypingIndicator = document.getElementById('aiTypingIndicator');
    
    // UI Elements for interaction
    const aiCharacterVideo = document.getElementById('aiCharacterVideo');
    const aiChatHistory = document.getElementById('aiChatHistory');
    const aiUserInput = document.getElementById('aiUserInput');
    const aiSendBtn = document.getElementById('aiSendBtn');

    // MANTÉN TU CLAVE API SEGURA: En producción, no debes exponer tu clave en el HTML/JS que se envía al cliente.
    // Esto es un modelo conceptual para usar Groq (Llama 3).
    const GROQ_API_KEY = ''; 
    const matildeRules = `Eres Matilde Montoya, la experta IA de la agencia Matilde Agency (marketing, estrategia e innovación en salud corporativa).
Reglas de conducta:
1. SOLO hablas de servicios de la agencia, planes, marketing médico y salud corporativa. Responde corto (1-2 párrafos) y súper empático.
2. Tu objetivo es guiar al usuario educadamente para perfilarlo (Médico, Clínica/Hospital, Farmacéutica o Startup) y ofrecerle el paquete ideal según sus necesidades (falta de visibilidad, falta de pacientes, problemas de CRM o Branding).
3. Haz UNA pregunta a la vez, no sueltes un bloque gigante de texto.

NUESTROS SERVICIOS Y PAQUETES (Precios exclusivos en MXN):
- Paquete Basic: $39,000 MXN implementación (pago único) + $6,900 MXN / mes. Incluye Landing page, CRM básico, automatización y 8 posts/mes. Ideal si no tienen web o inician desde cero.
- Paquete Pro: $79,000 MXN impl + $12,900 MXN / mes. Incluye todo Basic + Cotizador web y automatizaciones avanzadas de seguimiento. Ideal si manejan Excel/Notas o webs que no convierten.
- Paquete Elite: $169,000 MXN impl + $24,900 MXN / mes. Incluye facturador CFDI, auditoría, ciencia de datos. Ideal para Farmacéuticas, grandes Clínicas (>1000 previsiones).
- Add-ons individuales: Branding Estratégico ($10k), Web ($10k), SEO ($5k), Contenido ($3k-$5k/m).

FLUJO:
- Saluda y pregunta su perfil.
- Pregunta su reto principal actual (ej: "No me encuentran", "Tengo marca pero no clientes", "Necesito un CRM conectado").
- Con esa info, recomiéndale el Paquete adecuado directamente y ofrécele "Agendar un diagnóstico estratégico inicial (videollamada gratuita)".
- Antes de pasar al humano a agendar, siempre pídele al usuario amablemente su Nombre, WhatsApp y correo.
- Si escribe que está "urgente" o ya quiere saltar al precio de golpe, pásalo directo a pedir datos para agendar con un especialista humano.`;

    let chatSessionHistory = [
        { role: "system", content: matildeRules }
    ];

    // Interactive Avatar behavior - Disabled for Video version
    /*
    if (aiUserInput && aiCharacterVideo) {
        aiUserInput.addEventListener('focus', () => {
            aiCharacterVideo.src = "matilde-eyelashes.webp";
        });
        aiUserInput.addEventListener('blur', () => {
            aiCharacterVideo.src = "PERSONAJE IA.webp";
        });
    }
    */

    if (btnIniciarConversacion && aiModalOverlay) {
        btnIniciarConversacion.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Show modal
            aiModalOverlay.classList.add('active');
            
            // Only show initial greeting if chat is empty
            if(aiChatHistory.children.length === 1) { // Only the initial template
                aiInitialMessage.style.display = 'flex';
                aiChatText.textContent = '';
                aiChatText.style.display = 'none';
                aiTypingIndicator.style.display = 'flex';
    
                // Simulate initial greeting
                setTimeout(() => {
                    aiTypingIndicator.style.display = 'none';
                    aiChatText.style.display = 'block';
                    
                    const message = "Hola soy Matilde Montoya, ¿en qué te puedo ayudar?";
                    let i = 0;
                    
                    function typeWriter() {
                        if (i < message.length) {
                            aiChatText.textContent += message.charAt(i);
                            i++;
                            setTimeout(typeWriter, 35);
                        } else {
                            // Enable inputs once greeting finishes
                            aiUserInput.disabled = false;
                            aiSendBtn.disabled = false;
                            aiUserInput.focus();
                        }
                    }
                    typeWriter();
                    
                    // Initialize chat history with Matilde's persona for Groq is handled at the array declaration.
    
                }, 1200);
            }
        });
    }

    // Function to handle sending a message
    async function handleSendMessage() {
        const text = aiUserInput.value.trim();
        if(!text) return;

        // Disable input
        aiUserInput.value = '';
        aiUserInput.disabled = true;
        aiSendBtn.disabled = true;

        // Append user message
        appendMessage('user', text);
        
        // Add user text to history
        chatSessionHistory.push({
            role: "user",
            content: text
        });

        // Show typing indicator bubble for AI
        const typingBubble = appendTypingIndicator();
        const avatarContainer = document.querySelector('.ai-character-container');
        if(avatarContainer) avatarContainer.classList.add('thinking');
        if(aiCharacterVideo) { /* Video loop continues */ }

        // Call Groq API
        try {
            const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: chatSessionHistory
                })
            });

            const data = await response.json();
            
            if(!response.ok) {
                console.error("API Error details:", data);
                throw new Error(data.error?.message || "Error desconocido en la API de Groq");
            }
            
            const aiResponseText = data.choices[0].message.content;
            
            // Hide typing indicator and append actual response
            typingBubble.remove();
            appendMessage('assistant', aiResponseText);

            // Add model response to history
            chatSessionHistory.push({
                role: "assistant",
                content: aiResponseText
            });

        } catch(error) {
            console.error(error);
            typingBubble.remove();
            appendMessage('model', "Oops, parece que hubo un error o la clave API no está configurada. (" + error.message + ")");
        } finally {
            const avatarContainer = document.querySelector('.ai-character-container');
            if(avatarContainer) avatarContainer.classList.remove('thinking');
            
            // Video continues playing normally
            /*
            if (aiCharacterVideo) {
                aiCharacterVideo.src = "matilde-hablando.webp";
                setTimeout(() => {
                    if(document.activeElement === aiUserInput) {
                       aiCharacterVideo.src = "matilde-eyelashes.webp";
                    } else {
                       aiCharacterVideo.src = "PERSONAJE IA.webp";
                    }
                }, 4000);
            }
            */
            
            // Re-enable input
            aiUserInput.disabled = false;
            aiSendBtn.disabled = false;
            aiUserInput.focus();
        }
    }

    // Helper functions for UI
    function appendMessage(role, text) {
        const wrapper = document.createElement('div');
        wrapper.className = `ai-chat-message ${role === 'user' ? 'user-message' : 'ai-message'}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'ai-chat-bubble';
        
        const p = document.createElement('p');
        
        // Simple markdown parsing for bold text (**text**)
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        p.innerHTML = formattedText;
        
        bubble.appendChild(p);
        wrapper.appendChild(bubble);
        aiChatHistory.appendChild(wrapper);
        
        // Scroll to bottom
        aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
    }

    function appendTypingIndicator() {
        const wrapper = document.createElement('div');
        wrapper.className = 'ai-chat-message ai-message';
        wrapper.innerHTML = `
            <div class="ai-chat-bubble">
                <div class="ai-typing-indicator" style="display: flex;">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        aiChatHistory.appendChild(wrapper);
        aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
        return wrapper;
    }

    // Event listeners for input
    if (aiSendBtn) {
        aiSendBtn.addEventListener('click', handleSendMessage);
    }
    
    if (aiUserInput) {
        aiUserInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') handleSendMessage();
        });
    }

    // Close functionality
    if (aiModalClose) {
        aiModalClose.addEventListener('click', () => {
            aiModalOverlay.classList.remove('active');
        });
    }

    if (aiModalOverlay) {
        aiModalOverlay.addEventListener('click', (e) => {
            if(e.target === aiModalOverlay) {
                aiModalOverlay.classList.remove('active');
            }
        });
    }

    // 9. Team Rotation Logic
    const teamScene = document.getElementById("teamScene");
    if (teamScene) {
        const members = Array.from(teamScene.querySelectorAll(".team-member"));
        let angle = 0;
        let paused = false;
        const speed = 0.0003; // Velocidad de giro suave

        members.forEach(m => {
            m.addEventListener("mouseenter", () => paused = true);
            m.addEventListener("mouseleave", () => paused = false);
        });

        function positionMembers() {
            const containerW = teamScene.clientWidth;
            const containerH = teamScene.clientHeight;
            const cx = containerW / 2;
            const cy = containerH / 2;

            // Tamaño de cada burbuja: 20% del contenedor, entre 80px y 160px
            const itemSize = Math.min(160, Math.max(80, containerW * 0.20));

            // Radio de órbita: 38% del contenedor
            const radius = containerW * 0.38 - itemSize / 2;

            members.forEach((m, i) => {
                m.style.width  = `${itemSize}px`;
                m.style.height = `${itemSize}px`;
                m.style.left   = '0';
                m.style.top    = '0';

                const a = angle + (i * (Math.PI * 2 / members.length));
                const x = cx + Math.cos(a - Math.PI / 2) * radius - itemSize / 2;
                const y = cy + Math.sin(a - Math.PI / 2) * radius - itemSize / 2;

                m.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
            });
        }

        function animateTeam() {
            if (!paused) angle += speed;
            positionMembers();
            requestAnimationFrame(animateTeam);
        }

        positionMembers();
        animateTeam();
    }

    // 10. Horizontal Scroll Process Section (Layout 41 Style)
    const processHorizontal = document.getElementById('processHorizontal');
    const processTrack = document.getElementById('processTrack');
    const progressBar = document.querySelector('.process-progress-bar');
    
    if (processHorizontal && processTrack && window.innerWidth > 768) {
        const handleProcessScroll = () => {
            const containerRect = processHorizontal.getBoundingClientRect();
            const containerTop = containerRect.top + window.scrollY;
            const containerHeight = processHorizontal.offsetHeight;
            const windowHeight = window.innerHeight;
            
            // Calculate progress (0 to 1) based on vertical scroll within the section
            let progress = (window.scrollY - containerTop) / (containerHeight - windowHeight);
            
            // Clamp progress
            progress = Math.max(0, Math.min(1, progress));
            
            // Calculate horizontal translation
            // We want to translate from 0 to (trackWidth - windowWidth)
            const trackWidth = processTrack.scrollWidth;
            const windowWidth = window.innerWidth;
            const maxTranslate = trackWidth - windowWidth + (windowWidth * 0.1); // Add some padding
            
            const translateX = -progress * maxTranslate;
            
            processTrack.style.transform = `translateX(${translateX}px)`;
            
            // Parallax for background numbers
            const bgNums = processTrack.querySelectorAll('.p-bg-num');
            bgNums.forEach((num, index) => {
                const speed = 0.1 + (index * 0.05);
                const pX = (progress * 150 * speed);
                num.style.transform = `translateX(${pX}px)`;
            });

            // Update Progress Bar
            if (progressBar) {
                progressBar.style.width = `${progress * 80}vw`; // Match the 80vw in CSS
            }
        };

        window.addEventListener('scroll', handleProcessScroll);
        // Initial call
        handleProcessScroll();
    }

    // 11. Mobile Process Selection Effect (Premium Feel)
    if (window.innerWidth <= 768) {
        const mobileProcessCards = document.querySelectorAll('.process-card-item');
        
        const handleMobileScroll = () => {
            const centerY = window.innerHeight / 2;
            let closestCard = null;
            let minDistance = Infinity;

            mobileProcessCards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const cardCenterY = rect.top + rect.height / 2;
                const distance = Math.abs(centerY - cardCenterY);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestCard = card;
                }
            });

            mobileProcessCards.forEach(card => {
                if (card === closestCard) {
                    card.classList.add('is-active');
                } else {
                    card.classList.remove('is-active');
                }
            });
        };

        window.addEventListener('scroll', handleMobileScroll);
        handleMobileScroll(); // Initial check
    }
});
