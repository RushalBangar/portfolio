// ==========================================================================
// RUSHAL BANGAR PORTFOLIO — CORE ENGINE
// Optimized for maximum speed, 60fps smoothness, and glitch-free mobile responsiveness
// ==========================================================================

gsap.registerPlugin(ScrollTrigger);

// Tune GSAP ticker for maximum framerate stability
gsap.ticker.fps(60);
gsap.ticker.lagSmoothing(500, 33);

// --------------------------------------------------------------------------
// PRELOADER & INITIALIZATION
// Safe launcher: ensures site renders instantly even on slower mobile networks
// --------------------------------------------------------------------------
let appInitialized = false;

function launchApp() {
    if (appInitialized) return;
    appInitialized = true;

    const preloader     = document.querySelector('.preloader');
    const preloaderText = document.querySelector('.preloader-text');
    const progressFill  = document.querySelector('.preloader-progress-fill');

    if (!preloader) {
        document.body.classList.remove('loading');
        initApp();
        return;
    }

    const tl = gsap.timeline();

    tl.to(preloaderText, { opacity: 1, duration: 0.35, ease: 'power2.out' })
      .to(progressFill,  { width: '100%', duration: 0.65, ease: 'power3.inOut' }, '-=0.1')
      .to(preloaderText, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.15')
      .to(preloader, {
          yPercent: -100,
          duration: 0.65,
          ease: 'expo.inOut',
          onComplete: () => {
              document.body.classList.remove('loading');
              preloader.style.display = 'none';
              requestAnimationFrame(initApp);
          }
      }, '-=0.1');
}

// Guarantee start: readyState check + load event + 1200ms hard ceiling
if (document.readyState === 'complete') {
    requestAnimationFrame(launchApp);
} else {
    window.addEventListener('load', launchApp, { once: true });
    // Safety fallback to prevent frozen screen on slow mobile assets
    setTimeout(launchApp, 1200);
}

// ==========================================================================
// MAIN APPLICATION
// ==========================================================================
function initApp() {

    const hasMousePointer = !window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const isDesktop = window.innerWidth > 1024 && hasMousePointer;

    // -----------------------------------------------------------------------
    // 0. TEXT SPLITTING UTILITY
    // -----------------------------------------------------------------------
    document.querySelectorAll('.split-text').forEach(el => {
        if (el.dataset.splitDone) return;
        el.dataset.splitDone = 'true';
        const text = el.textContent || '';
        el.innerHTML = '';
        const fragment = document.createDocumentFragment();
        [...text].forEach(char => {
            const span = document.createElement('span');
            span.className = 'char';
            span.innerHTML = char === ' ' ? '&nbsp;' : char;
            fragment.appendChild(span);
        });
        el.appendChild(fragment);
    });

    // -----------------------------------------------------------------------
    // 1. MOBILE MENU TOGGLE & SCROLL LOCKING
    // -----------------------------------------------------------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks   = document.querySelector('.nav-links');
    const mainNav    = document.querySelector('.main-nav');

    function closeMobileMenu() {
        if (!menuToggle || !navLinks) return;
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        if (mainNav) mainNav.classList.remove('menu-active');
        document.body.style.overflow = '';
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active', isActive);
            menuToggle.setAttribute('aria-expanded', String(isActive));
            if (mainNav) mainNav.classList.toggle('menu-active', isActive);
            // Prevent background page jitter while mobile menu is open
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        // Close when clicking any nav link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close on clicking backdrop
        navLinks.addEventListener('click', (e) => {
            if (e.target === navLinks) closeMobileMenu();
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    // -----------------------------------------------------------------------
    // 2. CUSTOM CURSOR DOT & GLOW RING (Glowing Cyberpunk Pointer)
    // -----------------------------------------------------------------------
    const cursorDot  = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (hasMousePointer && (cursorDot || cursorRing)) {
        let mouseX = -100, mouseY = -100;
        let ringX  = -100, ringY  = -100;
        let isCursorActive = true;
        let initialized = false;

        const cursorState = {
            scale: 1,
            dotScale: 1,
            width: 36,
            height: 36
        };

        const onMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!initialized) {
                initialized = true;
                ringX = mouseX;
                ringY = mouseY;
                document.body.classList.add('custom-cursor-enabled');
            }
        };
        window.addEventListener('mousemove', onMouseMove, { passive: true });

        // Tactile click compression
        window.addEventListener('mousedown', () => {
            gsap.to(cursorState, { dotScale: 0.7, scale: 0.85, duration: 0.15, overwrite: 'auto' });
        });
        window.addEventListener('mouseup', () => {
            gsap.to(cursorState, { dotScale: 1, scale: 1, duration: 0.25, ease: 'back.out(2)', overwrite: 'auto' });
        });

        // Hide when leaving window
        document.addEventListener('mouseleave', () => {
            if (cursorDot) cursorDot.style.opacity = '0';
            if (cursorRing) cursorRing.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            if (initialized) {
                if (cursorDot) cursorDot.style.opacity = '1';
                if (cursorRing) cursorRing.style.opacity = '1';
            }
        });

        function updateCursor() {
            if (!isCursorActive) return;
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;

            if (cursorDot) {
                cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) scale(${cursorState.dotScale})`;
            }
            if (cursorRing) {
                cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${cursorState.scale})`;
                cursorRing.style.width = `${cursorState.width}px`;
                cursorRing.style.height = `${cursorState.height}px`;
            }

            requestAnimationFrame(updateCursor);
        }
        requestAnimationFrame(updateCursor);

        // Magnetic element behaviors
        document.querySelectorAll('.magnetic-target').forEach(target => {
            target.addEventListener('mouseenter', () => {
                const text  = target.getAttribute('data-cursor-text');
                const scale = parseFloat(target.getAttribute('data-cursor-scale')) || 1.8;
                document.body.classList.add('cursor-active');
                if (text) {
                    document.body.classList.add('cursor-text-active');
                    cursorRing.textContent = text;
                    gsap.to(cursorState, { width: 78, height: 78, scale: 1, dotScale: 0, duration: 0.25, overwrite: 'auto' });
                } else {
                    gsap.to(cursorState, { scale: scale, dotScale: 1.5, width: 36, height: 36, duration: 0.25, overwrite: 'auto' });
                }
            });

            target.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-active', 'cursor-text-active');
                cursorRing.textContent = '';
                gsap.to(cursorState, { width: 36, height: 36, scale: 1, dotScale: 1, duration: 0.25, overwrite: 'auto' });
                gsap.to(target, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' });
            });

            target.addEventListener('mousemove', (e) => {
                const rect = target.getBoundingClientRect();
                gsap.to(target, {
                    x: (e.clientX - rect.left - rect.width  / 2) * 0.2,
                    y: (e.clientY - rect.top  - rect.height / 2) * 0.2,
                    duration: 0.25,
                    ease: 'power2.out'
                });
            }, { passive: true });
        });

        // Interactive spotlight on glass cards
        document.querySelectorAll('.interactive-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
                card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
            }, { passive: true });
        });

        // 3D Tilt on cards
        document.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const r  = card.getBoundingClientRect();
                const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -6;
                const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  6;
                gsap.to(card, {
                    transformPerspective: 1000,
                    rotationX: rx,
                    rotationY: ry,
                    duration: 0.35,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            }, { passive: true });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationX: 0,
                    rotationY: 0,
                    duration: 0.4,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
            });
        });

        // Sparkle trail object pool
        const sparkleColors = ['#00f0ff', '#b026ff', '#ff2a7a', '#00d4ff'];
        const SPARKLE_COUNT = 15;
        const sparklePool = [];
        let activeSparkleIdx = 0;
        let lastSparkle = 0;

        for (let i = 0; i < SPARKLE_COUNT; i++) {
            const el = document.createElement('div');
            el.className = 'cursor-sparkle';
            el.style.cssText = 'position:fixed;pointer-events:none;z-index:9998;border-radius:50%;display:none;will-change:transform,opacity;';
            document.body.appendChild(el);
            sparklePool.push({ el, tween: null });
        }

        function triggerSparkle(x, y) {
            const sparkle = sparklePool[activeSparkleIdx];
            activeSparkleIdx = (activeSparkleIdx + 1) % SPARKLE_COUNT;

            if (sparkle.tween) sparkle.tween.kill();

            const sz  = Math.random() * 4 + 2.5;
            const col = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];

            sparkle.el.style.width = `${sz}px`;
            sparkle.el.style.height = `${sz}px`;
            sparkle.el.style.background = col;
            sparkle.el.style.boxShadow = `0 0 6px ${col}`;
            sparkle.el.style.display = 'block';

            gsap.set(sparkle.el, { x, y, xPercent: -50, yPercent: -50, scale: 1, opacity: 0.9 });

            sparkle.tween = gsap.to(sparkle.el, {
                x: x + (Math.random() - 0.5) * 40,
                y: y + (Math.random() - 0.5) * 40 + 10,
                opacity: 0,
                scale: 0.2,
                duration: 0.5,
                ease: 'power2.out',
                onComplete: () => {
                    sparkle.el.style.display = 'none';
                }
            });
        }

        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastSparkle < 50 || Math.random() > 0.6) return;
            lastSparkle = now;
            triggerSparkle(e.clientX, e.clientY);
        }, { passive: true });
    } else {
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorRing) cursorRing.style.display = 'none';
    }

    // -----------------------------------------------------------------------
    // 3. CANVAS NEURAL SYNAPSE BACKGROUND
    // Crisp Retina scaling & anti-glitch resize filtering
    // -----------------------------------------------------------------------
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: true });
        const mobileView = window.innerWidth < 768;
        const MAX_PARTICLES = mobileView ? 24 : 52;
        const CONNECT_DIST = mobileView ? 0 : 95;
        const CONNECT_DIST2 = CONNECT_DIST * CONNECT_DIST;

        let W = 0, H = 0, dpr = 1;
        let particles = [];
        let mouse = { x: -9999, y: -9999 };
        let rafId = null;
        let isTabActive = true;

        function initCanvas() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;

            canvas.width = Math.floor(W * dpr);
            canvas.height = Math.floor(H * dpr);
            canvas.style.width = `${W}px`;
            canvas.style.height = `${H}px`;
            ctx.scale(dpr, dpr);

            particles = [];
            for (let i = 0; i < MAX_PARTICLES; i++) {
                particles.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    r: Math.random() * 1.1 + 0.6,
                });
            }
        }

        // Anti-glitch: Ignore mobile address bar vertical resize triggers
        let lastKnownWidth = window.innerWidth;
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (Math.abs(window.innerWidth - lastKnownWidth) > 30) {
                lastKnownWidth = window.innerWidth;
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    initCanvas();
                }, 150);
            }
        }, { passive: true });

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }, { passive: true });

        // Save phone battery when user switches tabs
        document.addEventListener('visibilitychange', () => {
            isTabActive = !document.hidden;
            if (isTabActive && !rafId) {
                drawCanvas();
            }
        });

        function drawCanvas() {
            if (!isTabActive) {
                rafId = null;
                return;
            }
            rafId = requestAnimationFrame(drawCanvas);
            ctx.clearRect(0, 0, W, H);

            // Particles pass
            ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
            ctx.beginPath();
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > W) { p.vx *= -1; p.x = Math.max(0, Math.min(W, p.x)); }
                if (p.y < 0 || p.y > H) { p.vy *= -1; p.y = Math.max(0, Math.min(H, p.y)); }

                // Interactive cursor repulsion
                if (mouse.x > 0) {
                    const mdx = mouse.x - p.x;
                    const mdy = mouse.y - p.y;
                    const d2 = mdx * mdx + mdy * mdy;
                    if (d2 < 16900) { // 130px
                        p.x -= mdx * 0.015;
                        p.y -= mdy * 0.015;
                    }
                }

                ctx.moveTo(p.x + p.r, p.y);
                ctx.arc(p.x, p.y, p.r, 0, 6.2832);
            }
            ctx.fill();

            // Connections pass (desktop only)
            if (CONNECT_DIST > 0) {
                ctx.lineWidth = 0.5;
                ctx.strokeStyle = 'rgba(176, 38, 255, 0.12)';
                ctx.beginPath();
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist2 = dx * dx + dy * dy;
                        if (dist2 < CONNECT_DIST2) {
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                        }
                    }
                }
                ctx.stroke();
            }
        }

        initCanvas();
        drawCanvas();
    }

    // -----------------------------------------------------------------------
    // 4. HERO SECTION ANIMATION
    // -----------------------------------------------------------------------
    const heroTl = gsap.timeline({ delay: 0.1, defaults: { ease: 'power3.out' } });

    heroTl
        .from('.hero-badge', { y: 20, opacity: 0, duration: 0.6 })
        .from(gsap.utils.toArray('.huge-title .char'), {
            y: '100%',
            opacity: 0,
            duration: 0.8,
            ease: 'expo.out',
            stagger: 0.03,
            clearProps: 'transform,opacity'
        }, '-=0.35')
        .from('.hero-desc', { y: 25, opacity: 0, duration: 0.65 }, '-=0.5')
        .from('.hero-cta',  { y: 25, opacity: 0, duration: 0.65 }, '-=0.5')
        .from('.hero-visual', { scale: 0.85, opacity: 0, duration: 0.9, ease: 'expo.out' }, '-=0.7')
        .to(['.float-badge-1', '.float-badge-2', '.float-badge-3', '.float-badge-4', '.mobile-stat-card'], {
            opacity: 1,
            y: 0,
            x: 0,
            stagger: 0.08,
            duration: 0.6,
            ease: 'back.out(1.8)'
        }, '-=0.4');

    // Scroll indicator continuous wave
    gsap.to('.scroll-arrow', {
        y: 6,
        repeat: -1,
        yoyo: true,
        duration: 0.85,
        ease: 'sine.inOut'
    });

    // -----------------------------------------------------------------------
    // 5. ANTI-GLITCH SCROLL REVEAL ENGINE
    // CRITICAL FIX: All reveals use `once: true` instead of `toggleActions: 'play reverse play reverse'`
    // Content never blinks, vanishes, or stutters during scrolling
    // -----------------------------------------------------------------------
    const inHero = el => !!el.closest('#hero');

    // Section line draws
    document.querySelectorAll('.reveal-line').forEach(line => {
        gsap.to(line, {
            scaleX: 1,
            duration: 0.9,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: line,
                start: 'top 90%',
                once: true
            }
        });
    });

    // Split text headers
    document.querySelectorAll('.split-text').forEach(el => {
        if (inHero(el)) return;
        const chars = gsap.utils.toArray(el.querySelectorAll('.char'));
        if (chars.length) {
            gsap.from(chars, {
                y: '100%',
                opacity: 0,
                duration: 0.7,
                ease: 'power3.out',
                stagger: 0.025,
                clearProps: 'transform,opacity',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    once: true
                }
            });
        }
    });

    // Generic reveal-up elements
    document.querySelectorAll('.reveal-up').forEach(el => {
        if (inHero(el)) return;
        gsap.from(el, {
            y: 35,
            opacity: 0,
            duration: 0.75,
            ease: 'power3.out',
            delay: parseFloat(el.getAttribute('data-delay')) || 0,
            clearProps: 'transform,opacity',
            scrollTrigger: {
                trigger: el,
                start: 'top 86%',
                once: true
            }
        });
    });

    // Timeline progress line
    gsap.fromTo('.timeline-progress-line',
        { scaleY: 0, transformOrigin: 'top center' },
        {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: '.timeline-wrapper',
                start: 'top 65%',
                end: 'bottom 80%',
                scrub: 1.2
            }
        }
    );

    // Timeline cards: use vertical animation on mobile to prevent horizontal overflow glitch
    document.querySelectorAll('.timeline-item').forEach((item, i) => {
        const content = item.querySelector('.timeline-content');
        if (!content) return;
        const isNarrow = window.innerWidth <= 768;

        gsap.from(content, {
            x: isNarrow ? 0 : (i % 2 === 0 ? 40 : -40),
            y: isNarrow ? 30 : 0,
            opacity: 0,
            duration: 0.75,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                once: true
            }
        });
    });

    // Timeline markers
    document.querySelectorAll('.timeline-marker').forEach(marker => {
        gsap.fromTo(marker,
            { scale: 0, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.6,
                ease: 'back.out(2.5)',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                    trigger: marker,
                    start: 'top 82%',
                    once: true
                }
            }
        );
    });

    // Projects rows
    document.querySelectorAll('.project-row').forEach(row => {
        const isNarrow = window.innerWidth <= 768;
        const rev = row.classList.contains('reverse');

        const info = row.querySelector('.project-info');
        const visual = row.querySelector('.project-visual');

        if (info) {
            gsap.from(info, {
                x: isNarrow ? 0 : (rev ? 40 : -40),
                y: isNarrow ? 30 : 0,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                    trigger: row,
                    start: 'top 82%',
                    once: true
                }
            });
        }
        if (visual) {
            gsap.from(visual, {
                x: isNarrow ? 0 : (rev ? -40 : 40),
                y: isNarrow ? 30 : 0,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                    trigger: row,
                    start: 'top 82%',
                    once: true
                }
            });
        }
    });

    // Project image clip-path reveals
    document.querySelectorAll('.project-image-card').forEach(card => {
        gsap.fromTo(card,
            { clipPath: 'inset(0 100% 0 0)' },
            {
                clipPath: 'inset(0 0% 0 0)',
                duration: 1.0,
                ease: 'expo.inOut',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    once: true
                }
            }
        );
    });

    // Skill Tags wave
    gsap.fromTo('.tag',
        { y: 20, opacity: 0, scale: 0.85 },
        {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.45,
            ease: 'back.out(1.6)',
            stagger: 0.05,
            clearProps: 'transform,opacity',
            scrollTrigger: {
                trigger: '.skills-tags',
                start: 'top 86%',
                once: true
            }
        }
    );

    // Credentials Carousel cards
    gsap.fromTo('.credential-card',
        { y: 25, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.06,
            clearProps: 'transform,opacity',
            scrollTrigger: {
                trigger: '.credentials-track',
                start: 'top 84%',
                once: true
            }
        }
    );

    // Contact Blocks batch
    const contactBlocks = gsap.utils.toArray('.contact-block');
    if (contactBlocks.length) {
        gsap.from(contactBlocks, {
            y: 30,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.08,
            clearProps: 'transform,opacity',
            scrollTrigger: {
                trigger: '.contact-grid',
                start: 'top 85%',
                once: true
            }
        });
    }

    // Social links stagger
    gsap.fromTo('.social-link',
        { x: -18, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 0.45,
            ease: 'power3.out',
            stagger: 0.06,
            clearProps: 'transform,opacity',
            scrollTrigger: {
                trigger: '.social-links-grid',
                start: 'top 88%',
                once: true
            }
        }
    );

    // Desktop Parallax (Smooth & non-blocking)
    if (isDesktop) {
        document.querySelectorAll('.parallax-layer').forEach(layer => {
            if (layer.classList.contains('hero-avatar')) return;
            const speed = parseFloat(layer.getAttribute('data-speed')) || 1;
            const movement = (1 - speed) * 90;
            gsap.to(layer, {
                y: movement,
                ease: 'none',
                scrollTrigger: {
                    trigger: layer.closest('.section') || layer,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5
                }
            });
        });
    }

    // -----------------------------------------------------------------------
    // 6. SCROLL PROGRESS (Compositor accelerated via transform)
    // -----------------------------------------------------------------------
    const scrollBar = document.getElementById('scrollProgress');
    if (scrollBar) {
        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const progress = totalHeight > 0 ? Math.min(Math.max(window.scrollY / totalHeight, 0), 1) : 0;
                    scrollBar.style.transform = `scaleX(${progress})`;
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }, { passive: true });
    }

    // -----------------------------------------------------------------------
    // 7. NAV FROSTED GLASS BAR
    // -----------------------------------------------------------------------
    if (mainNav) {
        let navTicking = false;
        const updateNav = () => {
            mainNav.classList.toggle('scrolled', window.scrollY > 40);
            navTicking = false;
        };
        window.addEventListener('scroll', () => {
            if (!navTicking) {
                requestAnimationFrame(updateNav);
                navTicking = true;
            }
        }, { passive: true });
        updateNav();
    }

    // -----------------------------------------------------------------------
    // 8. CREDENTIALS CAROUSEL CONTROLS
    // -----------------------------------------------------------------------
    const track   = document.querySelector('.credentials-track');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (track && prevBtn && nextBtn) {
        const getCardStep = () => {
            const card = track.querySelector('.credential-card');
            if (!card) return 320;
            const gap = parseFloat(window.getComputedStyle(track).gap) || 24;
            return card.offsetWidth + gap;
        };

        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -getCardStep(), behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: getCardStep(), behavior: 'smooth' });
        });

        const syncCarouselButtons = () => {
            const tolerance = 4;
            const isStart = track.scrollLeft <= tolerance;
            const isEnd   = track.scrollLeft + track.clientWidth >= track.scrollWidth - tolerance;
            prevBtn.style.opacity = isStart ? '0.35' : '1';
            prevBtn.style.pointerEvents = isStart ? 'none' : 'auto';
            nextBtn.style.opacity = isEnd ? '0.35' : '1';
            nextBtn.style.pointerEvents = isEnd ? 'none' : 'auto';
        };

        track.addEventListener('scroll', syncCarouselButtons, { passive: true });
        syncCarouselButtons();
    }

    // -----------------------------------------------------------------------
    // 9. BUTTON RIPPLE EFFECT
    // -----------------------------------------------------------------------
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            ripple.className = 'btn-ripple';
            const rect = btn.getBoundingClientRect();
            gsap.set(ripple, {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                xPercent: -50,
                yPercent: -50
            });
            btn.appendChild(ripple);
            gsap.to(ripple, {
                scale: 10,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: () => ripple.remove()
            });
        });
    });

    // -----------------------------------------------------------------------
    // 10. SECTION TITLE TEXT SCRAMBLE (Desktop hover)
    // -----------------------------------------------------------------------
    if (isDesktop) {
        const SCRAMBLE_CHARS = '01#@$%&*<>~/';
        document.querySelectorAll('.section-title').forEach(title => {
            const chars = [...title.querySelectorAll('.char')];
            if (!chars.length) return;
            const originalChars = chars.map(c => c.textContent);
            let scrambleTimer = null;
            let cycle = 0;
            const maxCycles = chars.length * 2.2;

            title.addEventListener('mouseenter', () => {
                clearInterval(scrambleTimer);
                cycle = 0;
                scrambleTimer = setInterval(() => {
                    chars.forEach((ch, idx) => {
                        if (originalChars[idx] === ' ') return;
                        ch.textContent = idx < cycle * 0.45
                            ? originalChars[idx]
                            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                    });
                    if (++cycle > maxCycles) {
                        clearInterval(scrambleTimer);
                        chars.forEach((ch, idx) => (ch.textContent = originalChars[idx]));
                    }
                }, 28);
            });

            title.addEventListener('mouseleave', () => {
                clearInterval(scrambleTimer);
                chars.forEach((ch, idx) => (ch.textContent = originalChars[idx]));
            });
        });
    }

    // -----------------------------------------------------------------------
    // 11. QUICK COPY & TOAST NOTIFICATION
    // -----------------------------------------------------------------------
    const toast = document.getElementById('toast');
    let toastTimeout = null;

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('visible');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 2200);
    }

    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const textToCopy = btn.getAttribute('data-copy');
            if (!textToCopy) return;

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(textToCopy);
                } else {
                    const temp = document.createElement('textarea');
                    temp.value = textToCopy;
                    document.body.appendChild(temp);
                    temp.select();
                    document.execCommand('copy');
                    temp.remove();
                }
                showToast(`✓ Copied: ${textToCopy}`);
            } catch (err) {
                showToast(`Copied: ${textToCopy}`);
            }
        });
    });

    // -----------------------------------------------------------------------
    // 12. COMMAND PALETTE (⌘K / Ctrl+K) & THEMES
    // -----------------------------------------------------------------------
    const cmdPalette = document.getElementById('cmd-palette');
    const cmdInput = document.getElementById('cmd-input');
    const cmdList = document.getElementById('cmd-list');
    const cmdTriggers = document.querySelectorAll('.cmd-trigger');

    // Themes persistence
    const savedTheme = localStorage.getItem('rushal_theme') || 'cyber-cyan';
    document.documentElement.setAttribute('data-theme', savedTheme);

    function openExternalLink(url) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    const commands = [
        { id: 'proj', title: 'Jump to Case Studies', desc: 'Browse all 6 featured AI and engineering systems', icon: '⚡', category: 'NAV', action: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) },
        { id: 'synapse', title: 'Explore The Synapse (Skills)', desc: 'View AI, Data Science & Full-Stack competencies', icon: '🧠', category: 'NAV', action: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) },
        { id: 'journey', title: 'View Career Journey', desc: 'Academic path, independent lab & Google Student Ambassador', icon: '🚀', category: 'NAV', action: () => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }) },
        { id: 'verif', title: 'The Verifications (Credentials)', desc: '8 verified IBM, Kaggle, MongoDB & UI/UX certifications', icon: '🏆', category: 'NAV', action: () => document.getElementById('credentials')?.scrollIntoView({ behavior: 'smooth' }) },
        { id: 'resume', title: 'Download Curriculum Vitae', desc: 'Instant access to Rushal Bangar PDF Resume', icon: '📄', category: 'ACTION', action: () => openExternalLink('Bangar_Rushal.Resume.pdf') },
        { id: 'contact', title: 'Initiate Handshake (Contact)', desc: 'Direct phone, email, and social networks', icon: '📡', category: 'NAV', action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) },
        { id: 'theme-cyan', title: 'Theme: Cyber Cyan (Default)', desc: 'Neon cyan, electric purple & hot pink', icon: '💠', category: 'THEME', action: () => setTheme('cyber-cyan') },
        { id: 'theme-matrix', title: 'Theme: Matrix Emerald', desc: 'Cyber green & deep phosphorescent blue', icon: '💚', category: 'THEME', action: () => setTheme('matrix-emerald') },
        { id: 'theme-amber', title: 'Theme: Solar Amber', desc: 'Solar gold & neon warning orange', icon: '☀️', category: 'THEME', action: () => setTheme('solar-amber') },
        { id: 'theme-vapor', title: 'Theme: Vapor Magenta', desc: 'Synthwave hot magenta & neon violet', icon: '🔮', category: 'THEME', action: () => setTheme('vapor-magenta') },
        { id: 'github', title: 'Open GitHub Profile', desc: 'github.com/rushalbangar with 15+ repositories', icon: '🐙', category: 'EXTERNAL', action: () => openExternalLink('https://github.com/rushalbangar') },
        { id: 'linkedin', title: 'Connect on LinkedIn', desc: 'linkedin.com/in/rushal-bangar-395a64385', icon: '💼', category: 'EXTERNAL', action: () => openExternalLink('https://www.linkedin.com/in/rushal-bangar-395a64385/') }
    ];

    let selectedIndex = 0;
    let filteredCommands = [...commands];

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('rushal_theme', theme);
        showToast(`Theme switched to ${theme.replace('-', ' ').toUpperCase()}`);
    }

    function renderCommandList() {
        if (!cmdList) return;
        cmdList.innerHTML = '';
        if (filteredCommands.length === 0) {
            cmdList.innerHTML = '<div style="padding: 1rem; color: var(--text-muted); font-size: 0.85rem; text-align: center;">No matching commands found.</div>';
            return;
        }

        filteredCommands.forEach((cmd, idx) => {
            const item = document.createElement('div');
            item.className = `cmd-item ${idx === selectedIndex ? 'selected' : ''}`;
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', idx === selectedIndex);
            item.innerHTML = `
                <div class="cmd-item-left">
                    <span class="cmd-item-icon">${cmd.icon}</span>
                    <div>
                        <div class="cmd-item-title">${cmd.title}</div>
                        <div class="cmd-item-desc">${cmd.desc}</div>
                    </div>
                </div>
                <span class="cmd-item-badge">${cmd.category}</span>
            `;
            item.addEventListener('mouseenter', () => {
                selectedIndex = idx;
                updateSelectedCommand();
            });
            item.addEventListener('click', () => {
                executeCommand(cmd);
            });
            cmdList.appendChild(item);
        });
    }

    function updateSelectedCommand() {
        const items = cmdList.querySelectorAll('.cmd-item');
        items.forEach((item, idx) => {
            if (idx === selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    function executeCommand(cmd) {
        closeCommandPalette();
        if (cmd && cmd.action) {
            cmd.action();
        }
    }

    function openCommandPalette() {
        cmdPalette.classList.add('active');
        cmdPalette.setAttribute('aria-hidden', 'false');
        if (cmdInput) {
            cmdInput.value = '';
            filteredCommands = [...commands];
            selectedIndex = 0;
            renderCommandList();
            setTimeout(() => cmdInput.focus(), 50);
        }
    }

    function closeCommandPalette() {
        if (!cmdPalette || !cmdPalette.classList.contains('active')) return;
        cmdPalette.classList.remove('active');
        cmdPalette.setAttribute('aria-hidden', 'true');
    }

    cmdTriggers.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCommandPalette();
    }));

    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (cmdPalette && cmdPalette.classList.contains('active')) {
                closeCommandPalette();
            } else {
                openCommandPalette();
            }
        } else if (e.key === 'Escape') {
            closeCommandPalette();
            closeProjectModal();
        }
    });

    cmdPalette?.addEventListener('click', (e) => {
        if (e.target === cmdPalette) closeCommandPalette();
    });

    cmdInput?.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        filteredCommands = commands.filter(c => 
            c.title.toLowerCase().includes(q) || 
            c.desc.toLowerCase().includes(q) || 
            c.category.toLowerCase().includes(q)
        );
        selectedIndex = 0;
        renderCommandList();
    });

    cmdInput?.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % filteredCommands.length;
            updateSelectedCommand();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
            updateSelectedCommand();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                executeCommand(filteredCommands[selectedIndex]);
            }
        }
    });

    // -----------------------------------------------------------------------
    // 14. SYSTEM BLUEPRINT PROJECT DETAIL MODALS
    // -----------------------------------------------------------------------
    const projectBlueprints = {
        vivavox: {
            title: 'VivaVox',
            tag: 'MULTIMODAL AI // ORAL EXAMINATION EVALUATOR',
            desc: 'VivaVox is an intelligent automated viva evaluator designed to conduct real-time multimodal interviews, assessing technical precision, conceptual reasoning, and voice confidence with instant rubric scoring.',
            pipeline: [
                { title: 'Audio Stream', sub: 'WebRTC / Mic Input' },
                { title: 'Speech Parsing', sub: 'Phonetic NLP Parser' },
                { title: 'Gemini Multimodal', sub: 'Semantic Evaluator' },
                { title: 'Rubric Matrix', sub: 'Instant Grade & Critique' }
            ],
            highlights: [
                { title: 'Automated Subject Rubrics', text: 'Dynamically generates viva questions across Computer Science, AI, and algorithmic problem-solving.' },
                { title: 'Confidence & Articulation Telemetry', text: 'Measures vocal pace, pause frequency, and speech confidence to deliver holistic candidate evaluations.' },
                { title: 'Multimodal Response Grading', text: 'Evaluates spoken responses against verified technical ground truths with 95%+ conceptual fidelity.' },
                { title: 'Instant Interactive Report Card', text: 'Outputs structured PDF critique highlighting strengths, knowledge gaps, and study recommendations.' }
            ],
            stack: ['TypeScript', 'React', 'Gemini Multimodal AI', 'WebRTC', 'Tailwind CSS', 'Node.js'],
            repoUrl: 'https://github.com/RushalBangar/VivaVox',
            cloneCmd: 'git clone https://github.com/RushalBangar/VivaVox.git'
        },
        'smart-bharat': {
            title: 'Smart-Bharat',
            tag: 'GENAI CIVIC TECH // NATIONAL WELFARE SUITE',
            desc: 'A GenAI-driven civic platform engineered to demystify complex government schemes, empower citizens with automated application pre-fills, and route verified municipal grievances directly to urban local bodies.',
            pipeline: [
                { title: 'Citizen Voice/Chat', sub: 'Multilingual Input' },
                { title: 'GenAI NLP Router', sub: 'Scheme Matching Engine' },
                { title: 'Geo-Verification', sub: 'GPS Image Hash' },
                { title: 'Municipal Dispatch', sub: 'Automated Civic Ticket' }
            ],
            highlights: [
                { title: 'Voice-First Multilingual Assistant', text: 'Natural language dialogue supporting Marathi, Hindi, and English for inclusive digital democracy.' },
                { title: 'Automated DISCOM & Housing Pre-fills', text: 'Extracts user requirements and pre-populates official application forms for schemes like PM Surya Ghar.' },
                { title: 'Geo-Verified Civic Redressal', text: 'Citizens upload geo-tagged infrastructure photos which are automatically validated and routed to local wards.' },
                { title: '98.4% Resolution Efficiency', text: 'Reduces citizen grievance overhead by eliminating paper bureaucracy and tracking tickets end-to-end.' }
            ],
            stack: ['GenAI', 'JavaScript', 'Natural Language Processing', 'Express.js', 'GeoJSON', 'Tailwind CSS'],
            repoUrl: 'https://github.com/RushalBangar/Smart-Bharat',
            cloneCmd: 'git clone https://github.com/RushalBangar/Smart-Bharat.git'
        },
        'grahak-kavach': {
            title: 'Grahak-Kavach',
            tag: 'AI COMPUTER VISION // LEGAL METROLOGY & FOOD SAFETY',
            desc: 'An AI-powered unified compliance scanner that inspects packaged commodity labels using computer vision to detect obscured expiry dates, verify Legal Metrology adherence, audit harmful ingredients, and auto-generate consumer dispute dossiers.',
            pipeline: [
                { title: 'Label Image Capture', sub: 'High-Res Optical Feed' },
                { title: 'Bounding Box OCR', sub: 'Feature Coordinate Extractor' },
                { title: 'FSSAI Rule Engine', sub: 'Compliance & Additive Audit' },
                { title: 'Legal Dossier PDF', sub: 'Evidence Pack Generator' }
            ],
            highlights: [
                { title: '99.2% OCR Precision on Packaging', text: 'Extracts tiny nutritional values, MRP, batch codes, and manufacturer addresses from curved physical packages.' },
                { title: 'Legal Metrology Verification', text: 'Audits mandatory declarations including net quantity, unit sale price, and genuine 14-digit FSSAI licenses.' },
                { title: 'Harmful Additive & Allergen Detection', text: 'Flags excessive sodium, hidden sugars, trans fats, and Class II preservatives against medical guidelines.' },
                { title: 'One-Tap Evidence Generator', text: 'Compiles timestamped OCR violations into a legally formatted evidence pack ready for the National Consumer Helpline.' }
            ],
            stack: ['Computer Vision', 'OCR Engine', 'Legal Metrology AI', 'JavaScript', 'HTML5 Canvas', 'REST APIs'],
            repoUrl: 'https://github.com/RushalBangar/Grahak-Kavach',
            cloneCmd: 'git clone https://github.com/RushalBangar/Grahak-Kavach.git'
        },
        medconnect: {
            title: 'MedConnect',
            tag: 'SPATIAL LOGISTICS // EMERGENCY HEALTHCARE RADAR',
            desc: 'A real-time localized pharmaceutical locator connecting patients and emergency healthcare teams with live drug inventories, mitigating life-threatening shortages during critical medical emergencies.',
            pipeline: [
                { title: 'Patient Geolocation', sub: 'Browser Coordinates' },
                { title: 'Proximity Spatial Ping', sub: '5km Radius Filter' },
                { title: 'Pharmacy Inventory API', sub: 'Live Verified Stock Sync' },
                { title: 'Emergency Dispatch', sub: 'Optimal Route Navigation' }
            ],
            highlights: [
                { title: 'Sub-14 Minute Emergency Dispatch', text: 'Dramatically cuts time spent manually calling pharmacies for urgent medications like Insulin and blood thinners.' },
                { title: 'SOS Broadcast Transmission', text: 'Enables clinics and patients to broadcast urgent medicine requests to all verified chemists within city limits.' },
                { title: 'Interactive Cluster Radar', text: 'Displays active stock density heatmaps with direct turn-by-turn navigation to the nearest open store.' },
                { title: 'Anti-Hoarding Validation', text: 'Inventory verification algorithms prevent phantom listings and ensure stock reliability during crises.' }
            ],
            stack: ['Node.js', 'Express.js', 'JavaScript', 'Geolocation API', 'Leaflet GIS', 'CSS Grid'],
            repoUrl: 'https://github.com/RushalBangar/MedConnect',
            cloneCmd: 'git clone https://github.com/RushalBangar/MedConnect.git'
        },
        lifeguard: {
            title: 'LifeGuard',
            tag: 'PREDICTIVE AI // FLOOD MITIGATION & CLIMATE RADAR',
            desc: 'An AI-driven disaster risk warning system that continuously ingests hydrologic sensor feeds and geospatial meteorological models to compute flood water accumulation curves hours before inundation occurs.',
            pipeline: [
                { title: 'Weather & River Sensors', sub: 'Telemetry Ingestion' },
                { title: 'Hydrologic ML Model', sub: 'Inundation Curve Compute' },
                { title: 'Risk Contour Mapping', sub: 'Geospatial Topography' },
                { title: 'Preventative Alerts', sub: 'Public Warning Dispatch' }
            ],
            highlights: [
                { title: 'Predictive Inundation Computation', text: 'Forecasts localized flood crests up to 6 hours in advance based on upstream rainfall and dam discharge data.' },
                { title: 'Topographical Elevation Modeling', text: 'Maps water spread vectors across low-lying urban pockets and rural riverbanks.' },
                { title: 'Automated Early Warning Signals', text: 'Dispatches targeted evacuation notices to municipal authorities and at-risk residential zones.' },
                { title: 'Resilience Analytics Dashboard', text: 'Enables disaster management teams to allocate rescue boats and emergency resources before roads submerge.' }
            ],
            stack: ['Python', 'Machine Learning', 'Data Visualization', 'Pandas / NumPy', 'Flask', 'Geospatial GIS'],
            repoUrl: 'https://github.com/RushalBangar/LifeGuard',
            cloneCmd: 'git clone https://github.com/RushalBangar/LifeGuard.git'
        },
        'bhu-aadhaar': {
            title: 'Bhu-Aadhaar-3D',
            tag: '3D SPATIAL GIS // VERTICAL PROPERTY CADASTRAL MAPPING',
            desc: 'A next-generation land governance system pioneering 3D ULPIN (Unique Land Parcel Identification Number) generation for multi-level vertical high-rises and subterranean properties.',
            pipeline: [
                { title: '2D Cadastral GeoJSON', sub: 'Revenue Land Survey' },
                { title: 'WebGL 3D Extrusion', sub: 'Volumetric Geometry Engine' },
                { title: '14-Digit ULPIN Assign', sub: 'ISO/Standardized Land ID' },
                { title: 'Digital Title Export', sub: 'BIM / GeoJSON Standard' }
            ],
            highlights: [
                { title: 'Volumetric Parcel Demarcation', text: 'Solves the fatal flaw of 2D land titles by assigning distinct spatial bounding boxes to individual skyscraper floors.' },
                { title: 'Sub-Surface Rights Registry', text: 'Maps underground parking units, transit tunnels, and basement easements with precise elevation metrics.' },
                { title: 'Interactive WebGL 3D Viewport', text: 'Inspect buildings, rotate perspective views, and query ownership metadata in hardware-accelerated 3D.' },
                { title: 'Land Revenue Standards Certified', text: 'Compliant with national digital land records modernization programs and standardized 14-digit ULPIN formats.' }
            ],
            stack: ['Three.js', 'WebGL', '3D Spatial GIS', 'JavaScript', 'Cadastre Engine', 'HTML5 Canvas'],
            repoUrl: 'https://github.com/RushalBangar/Bhu-Aadhaar-3D',
            cloneCmd: 'git clone https://github.com/RushalBangar/Bhu-Aadhaar-3D.git'
        }
    };

    const projectModal = document.getElementById('project-modal');
    const projectModalContent = document.getElementById('project-modal-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    function openProjectModal(projectId) {
        const bp = projectBlueprints[projectId];
        if (!bp || !projectModalContent) return;

        projectModalContent.innerHTML = `
            <div class="blueprint-header">
                <div class="blueprint-tag">
                    <span class="pulse-dot"></span>
                    <span>${bp.tag}</span>
                </div>
                <h2 class="blueprint-title">${bp.title}</h2>
                <p class="blueprint-desc">${bp.desc}</p>
            </div>

            <!-- Architecture Pipeline -->
            <div class="blueprint-section">
                <h3 class="blueprint-section-title">System Architecture &amp; Data Pipeline</h3>
                <div class="architecture-pipeline">
                    ${bp.pipeline.map((node, i) => `
                        <div class="arch-node">
                            <div class="arch-node-title">${node.title}</div>
                            <div class="arch-node-sub">${node.sub}</div>
                        </div>
                        ${i < bp.pipeline.length - 1 ? '<span class="arch-connector">&rarr;</span>' : ''}
                    `).join('')}
                </div>
            </div>

            <!-- Engineering Highlights -->
            <div class="blueprint-section">
                <h3 class="blueprint-section-title">Engineering Innovations &amp; Impact</h3>
                <div class="blueprint-grid">
                    ${bp.highlights.map(hl => `
                        <div class="blueprint-item">
                            <div class="blueprint-item-title">${hl.title}</div>
                            <div class="blueprint-item-text">${hl.text}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Tech Stack -->
            <div class="blueprint-section">
                <h3 class="blueprint-section-title">Verified Technologies</h3>
                <div class="blueprint-tech-list">
                    ${bp.stack.map(tech => `<span class="blueprint-tech-badge">${tech}</span>`).join('')}
                </div>
            </div>

            <!-- Quick Clone Box -->
            <div class="blueprint-section">
                <h3 class="blueprint-section-title">Terminal Quick Clone</h3>
                <div class="blueprint-clone-box">
                    <span class="blueprint-clone-cmd">${bp.cloneCmd}</span>
                    <button class="blueprint-copy-btn magnetic-target" data-copy-cmd="${bp.cloneCmd}">Copy</button>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="blueprint-footer">
                <a href="${bp.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary magnetic-target" data-cursor-text="GITHUB">
                    <span class="btn-text">Launch Repository</span>
                </a>
                <button class="btn btn-secondary magnetic-target" id="modal-dismiss-btn" data-cursor-text="CLOSE">
                    <span class="btn-text">Dismiss Blueprint</span>
                </button>
            </div>
        `;

        // Wire copy button inside modal
        projectModalContent.querySelector('.blueprint-copy-btn')?.addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            const cmd = btn.getAttribute('data-copy-cmd');
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(cmd);
                } else {
                    const temp = document.createElement('textarea');
                    temp.value = cmd;
                    document.body.appendChild(temp);
                    temp.select();
                    document.execCommand('copy');
                    document.body.removeChild(temp);
                }
                btn.textContent = 'Copied!';
                showToast(`✓ Copied: ${cmd}`);
                setTimeout(() => (btn.textContent = 'Copy'), 2000);
            } catch (err) {
                showToast(`✓ Copied: ${cmd}`);
            }
        });

        // Wire dismiss button
        projectModalContent.querySelector('#modal-dismiss-btn')?.addEventListener('click', closeProjectModal);

        projectModal.classList.add('active');
        projectModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeProjectModal() {
        if (!projectModal || !projectModal.classList.contains('active')) return;
        projectModal.classList.remove('active');
        projectModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Attach click listeners to all blueprint triggers
    document.querySelectorAll('[data-blueprint-id]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const id = el.getAttribute('data-blueprint-id');
            if (id) openProjectModal(id);
        });
    });

    modalCloseBtn?.addEventListener('click', closeProjectModal);
    projectModal?.addEventListener('click', (e) => {
        if (e.target === projectModal) closeProjectModal();
    });

    // Refresh ScrollTrigger cleanly
    requestAnimationFrame(() => {
        ScrollTrigger.refresh();
    });
}
