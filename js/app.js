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

    // Refresh ScrollTrigger cleanly
    requestAnimationFrame(() => {
        ScrollTrigger.refresh();
    });
}
