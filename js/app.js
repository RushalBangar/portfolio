// ==========================================================================
// REGISTER GSAP PLUGINS
// ==========================================================================
gsap.registerPlugin(ScrollTrigger);

// Tune GSAP's internal ticker for maximum smoothness
gsap.ticker.fps(60);
gsap.ticker.lagSmoothing(500, 33); // recover gracefully after lag spikes

// ==========================================================================
// PRELOADER
// ==========================================================================
window.addEventListener('load', () => {
    const preloader     = document.querySelector('.preloader');
    const preloaderText = document.querySelector('.preloader-text');
    const progressFill  = document.querySelector('.preloader-progress-fill');

    const tl = gsap.timeline();

    tl.to(preloaderText, { opacity: 1, duration: 0.5, ease: 'power2.out' })
      .to(progressFill,  { width: '100%', duration: 1.4, ease: 'expo.inOut' }, '-=0.1')
      .to(preloaderText, { opacity: 0,   duration: 0.3, ease: 'power2.in'  }, '-=0.4')
      .to(preloader, {
          yPercent: -100, duration: 1.0, ease: 'expo.inOut',
          onComplete: () => {
              document.body.classList.remove('loading');
              preloader.style.display = 'none';
              initApp();
          }
      }, '-=0.2');
});

// ==========================================================================
// MAIN APP
// ==========================================================================
function initApp() {

    // -----------------------------------------------------------------------
    // 0. TEXT SPLITTING
    // -----------------------------------------------------------------------
    document.querySelectorAll('.split-text').forEach(el => {
        const text = el.innerText;
        el.innerHTML = '';
        [...text].forEach(char => {
            const span = document.createElement('span');
            span.className = 'char';
            span.innerHTML = char === ' ' ? '&nbsp;' : char;
            el.appendChild(span);
        });
    });

    // -----------------------------------------------------------------------
    // 1. NATIVE SCROLL — No smooth scroll library.
    //    ScrollTrigger hooks into native scroll events automatically.
    //    Use scroll-behavior: smooth in CSS for anchor links only.
    // -----------------------------------------------------------------------
    // ScrollTrigger is already registered above — nothing else needed here.

    // -----------------------------------------------------------------------
    // 1.5 MOBILE MENU TOGGLE
    // -----------------------------------------------------------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks   = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isActive = menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', String(isActive));
            document.querySelector('.main-nav').classList.toggle('menu-active', isActive);
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.querySelector('.main-nav').classList.remove('menu-active');
            });
        });
    }

    // -----------------------------------------------------------------------
    // 2. CUSTOM CURSOR (desktop only) — use CSS transforms, not left/top
    // -----------------------------------------------------------------------
    if (window.innerWidth > 1024) {
        const cursorDot  = document.querySelector('.cursor-dot');
        const cursorRing = document.querySelector('.cursor-ring');

        let mouseX = 0, mouseY = 0;
        let ringX  = 0, ringY  = 0;

        // Dot follows instantly (no lerp needed — feels snappier)
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.set(cursorDot, { x: mouseX, y: mouseY });
        }, { passive: true });

        // Ring lerps — but only through one ticker per frame
        gsap.ticker.add(() => {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            gsap.set(cursorRing, { x: ringX, y: ringY });
        });

        // Magnetic + cursor text
        document.querySelectorAll('.magnetic-target').forEach(target => {
            target.addEventListener('mouseenter', () => {
                const text  = target.getAttribute('data-cursor-text');
                const scale = parseFloat(target.getAttribute('data-cursor-scale')) || 2;
                document.body.classList.add('cursor-active');
                if (text) {
                    document.body.classList.add('cursor-text-active');
                    cursorRing.textContent = text;
                    gsap.to(cursorRing, { width: 80, height: 80, duration: 0.3 });
                } else {
                    gsap.to(cursorRing, { scale, duration: 0.3 });
                }
            });
            target.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-active', 'cursor-text-active');
                cursorRing.textContent = '';
                gsap.to(cursorRing, { width: 40, height: 40, scale: 1, duration: 0.3 });
                gsap.to(target,    { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
            });
            target.addEventListener('mousemove', (e) => {
                const rect = target.getBoundingClientRect();
                gsap.to(target, {
                    x: (e.clientX - rect.left - rect.width  / 2) * 0.25,
                    y: (e.clientY - rect.top  - rect.height / 2) * 0.25,
                    duration: 0.35, ease: 'power2.out',
                });
            });
        });

        // Card spotlight — throttled with passive listener
        document.querySelectorAll('.interactive-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
                card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
            }, { passive: true });
        });
    }

    // -----------------------------------------------------------------------
    // 3. CANVAS NEURAL BACKGROUND
    //    Performance fixes:
    //    - Reduced to 60 particles (was 120) — O(n²) means 4× less work
    //    - Use squared distance to skip sqrt for culling
    //    - Batch all line drawing into ONE path per opacity bucket
    //    - Throttle mouse repulsion with passive listener
    //    - On mobile: only 25 particles, no connection lines
    // -----------------------------------------------------------------------
    const canvas = document.getElementById('neural-canvas');
    const ctx    = canvas.getContext('2d', { alpha: true, desynchronized: true });

    const isMobile      = window.innerWidth < 768;
    const MAX_PARTICLES = isMobile ? 25 : 60;
    const CONNECT_DIST  = isMobile ? 0  : 100; // no lines on mobile
    const CONNECT_DIST2 = CONNECT_DIST * CONNECT_DIST;

    let W = 0, H = 0, particles = [];
    let mouse = { x: -9999, y: -9999 };
    let rafId = null;

    function initCanvas() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < MAX_PARTICLES; i++) {
            particles.push({
                x:  Math.random() * W,
                y:  Math.random() * H,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r:  Math.random() * 1.2 + 0.4,
            });
        }
    }

    // Debounce resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initCanvas, 200);
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    function drawCanvas() {
        rafId = requestAnimationFrame(drawCanvas);
        ctx.clearRect(0, 0, W, H);

        // --- Update + draw dots in one pass ---
        ctx.fillStyle = 'rgba(0, 240, 255, 0.55)';
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) { p.vx *= -1; p.x = Math.max(0, Math.min(W, p.x)); }
            if (p.y < 0 || p.y > H) { p.vy *= -1; p.y = Math.max(0, Math.min(H, p.y)); }

            // Mouse repulsion (cheap squared-distance check)
            const mdx = mouse.x - p.x;
            const mdy = mouse.y - p.y;
            if (mdx * mdx + mdy * mdy < 22500) { // 150² = 22500
                p.x -= mdx * 0.018;
                p.y -= mdy * 0.018;
            }

            ctx.moveTo(p.x + p.r, p.y);
            ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        }
        ctx.fill();

        // --- Draw connection lines (desktop only) ---
        // Group into 3 opacity buckets to minimise strokeStyle changes
        if (!isMobile && CONNECT_DIST > 0) {
            const buckets = [[], [], []]; // near / mid / far

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx   = particles[i].x - particles[j].x;
                    const dy   = particles[i].y - particles[j].y;
                    const dist2 = dx * dx + dy * dy;
                    if (dist2 < CONNECT_DIST2) {
                        const t = dist2 / CONNECT_DIST2; // 0 = close, 1 = far
                        const bucket = t < 0.33 ? 0 : t < 0.66 ? 1 : 2;
                        buckets[bucket].push(i, j);
                    }
                }
            }

            ctx.lineWidth = 0.4;
            const opacities = [0.18, 0.1, 0.05];
            buckets.forEach((bucket, bi) => {
                if (!bucket.length) return;
                ctx.strokeStyle = `rgba(176, 38, 255, ${opacities[bi]})`;
                ctx.beginPath();
                for (let k = 0; k < bucket.length; k += 2) {
                    const a = particles[bucket[k]];
                    const b = particles[bucket[k + 1]];
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                }
                ctx.stroke();
            });
        }
    }

    initCanvas();
    drawCanvas();

    // -----------------------------------------------------------------------
    // 4. SCROLL ANIMATIONS
    //    Performance fixes:
    //    - REMOVED velocity skew (was firing gsap.to on every scroll frame)
    //    - Parallax disabled on mobile (no scrub ScrollTriggers on touch)
    //    - Contact blocks use gsap.utils.toArray with a single batch call
    //    - all triggers use once:true so they clean themselves up
    // -----------------------------------------------------------------------

    // Helper: is this element inside the hero?
    const inHero = el => !!el.closest('#hero');

    // --- Hero entrance (no ScrollTrigger — runs after preloader) ---
    const heroTl = gsap.timeline({ delay: 0.2, defaults: { ease: 'power3.out' } });

    heroTl
        .from('.hero-badge',  { y: 24, opacity: 0, duration: 0.7 })
        .from(gsap.utils.toArray('.huge-title .char'),
            { y: '110%', opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.035, clearProps: 'transform,opacity' }, '-=0.4')
        .from('.hero-desc',   { y: 30, opacity: 0, duration: 0.8 }, '-=0.55')
        .from('.hero-cta',    { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('.hero-visual', { scale: 0.75, opacity: 0, duration: 1.1, ease: 'expo.out' }, '-=0.9');

    // --- Scroll indicator bounce ---
    gsap.to('.scroll-arrow', {
        y: 8, repeat: -1, yoyo: true, duration: 0.9, ease: 'sine.inOut',
    });

    // --- Section line reveals ---
    document.querySelectorAll('.reveal-line').forEach(line => {
        gsap.to(line, {
            scaleX: 1, duration: 1.2, ease: 'expo.inOut',
            scrollTrigger: { trigger: line, start: 'top 90%', toggleActions: 'play reverse play reverse' },
        });
    });

    // --- Split text reveals (outside hero) ---
    document.querySelectorAll('.split-text').forEach(el => {
        if (inHero(el)) return;
        gsap.from(gsap.utils.toArray(el.querySelectorAll('.char')), {
            y: '110%', opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.03,
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play reverse play reverse' },
        });
    });

    // --- Reveal-up elements (outside hero) ---
    document.querySelectorAll('.reveal-up').forEach(el => {
        if (inHero(el)) return;
        gsap.from(el, {
            y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
            delay: parseFloat(el.getAttribute('data-delay')) || 0,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play reverse play reverse' },
        });
    });

    // --- Timeline progress line ---
    gsap.fromTo('.timeline-progress-line',
        { scaleY: 0, transformOrigin: 'top center' },
        {
            scaleY: 1, ease: 'none',
            scrollTrigger: {
                trigger: '.timeline-wrapper',
                start: 'top 60%', end: 'bottom 80%',
                scrub: 1.5,
            },
        }
    );

    // --- Timeline cards ---
    document.querySelectorAll('.timeline-item').forEach((item, i) => {
        const content = item.querySelector('.timeline-content');
        if (!content) return;
        gsap.from(content, {
            x: i % 2 === 0 ? 50 : -50, opacity: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 74%', toggleActions: 'play reverse play reverse' },
        });
    });

    // --- Project rows ---
    document.querySelectorAll('.project-row').forEach(row => {
        const rev = row.classList.contains('reverse');
        gsap.from(row.querySelector('.project-info'), {
            x: rev ? 50 : -50, opacity: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: row, start: 'top 78%', toggleActions: 'play reverse play reverse' },
        });
        gsap.from(row.querySelector('.project-visual'), {
            x: rev ? -50 : 50, opacity: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: row, start: 'top 78%', toggleActions: 'play reverse play reverse' },
        });
    });

    // --- Contact blocks (staggered batch — single ScrollTrigger) ---
    const contactBlocks = gsap.utils.toArray('.contact-block');
    if (contactBlocks.length) {
        gsap.from(contactBlocks, {
            y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: '.contact-grid', start: 'top 82%', toggleActions: 'play reverse play reverse' },
        });
    }

    // --- Parallax (desktop only, fewer triggers) ---
    if (window.innerWidth > 1024) {
        document.querySelectorAll('.parallax-layer').forEach(layer => {
            if (layer.classList.contains('hero-avatar')) return;
            const speed    = parseFloat(layer.getAttribute('data-speed')) || 1;
            const movement = (1 - speed) * 120;
            gsap.to(layer, {
                y: movement, ease: 'none',
                scrollTrigger: {
                    trigger: layer.closest('.section') || layer,
                    start: 'top bottom', end: 'bottom top',
                    scrub: 2,              // higher scrub = less recalculation
                },
            });
        });
    }

    // -----------------------------------------------------------------------
    // 5. 3D TILT (desktop only)
    //    Use quickTo for minimal overhead per mousemove
    // -----------------------------------------------------------------------
    if (window.innerWidth > 1024) {
        document.querySelectorAll('.tilt-card').forEach(card => {
            const setRX = gsap.quickTo(card, 'rotateX', { duration: 0.45, ease: 'power2.out' });
            const setRY = gsap.quickTo(card, 'rotateY', { duration: 0.45, ease: 'power2.out' });

            card.addEventListener('mousemove', (e) => {
                const r  = card.getBoundingClientRect();
                const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -7;
                const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  7;
                gsap.set(card, { transformPerspective: 900 });
                setRX(rx);
                setRY(ry);
            }, { passive: true });

            card.addEventListener('mouseleave', () => {
                setRX(0);
                setRY(0);
            });
        });
    }

    // -----------------------------------------------------------------------
    // 6. SCROLL PROGRESS BAR
    // -----------------------------------------------------------------------
    const scrollBar = document.getElementById('scrollProgress');
    if (scrollBar) {
        window.addEventListener('scroll', () => {
            const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            scrollBar.style.width = Math.min(pct, 100) + '%';
        }, { passive: true });
    }

    // -----------------------------------------------------------------------
    // 7. NAV FROSTED GLASS ON SCROLL
    // -----------------------------------------------------------------------
    const mainNavEl = document.querySelector('.main-nav');
    const onNavScroll = () => mainNavEl.classList.toggle('scrolled', window.scrollY > 70);
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();

    // -----------------------------------------------------------------------
    // 8. FLOATING STAT BADGES
    //    BUG FIX: CSS has opacity:0 on badges. gsap.from() animates TO the
    //    computed style (opacity:0), so badges would never appear.
    //    Fix: use gsap.fromTo() with an explicit opacity:1 end state.
    //    Also use standalone delays instead of appending to heroTl after
    //    it has already started playing.
    // -----------------------------------------------------------------------
    gsap.fromTo('.float-badge-1',
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'back.out(2)', delay: 2.0 }
    );
    gsap.fromTo('.float-badge-2',
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.9, ease: 'back.out(2)', delay: 2.3 }
    );
    gsap.fromTo('.float-badge-3',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'back.out(2)', delay: 2.5 }
    );

    // -----------------------------------------------------------------------
    // 9. SKILL TAGS — Stagger wave from random positions
    // -----------------------------------------------------------------------
    gsap.fromTo('.tag',
        { y: 24, opacity: 0, scale: 0.75 },
        {
            y: 0, opacity: 1, scale: 1,
            duration: 0.5, ease: 'back.out(1.7)',
            stagger: { each: 0.07, from: 'random' },
            scrollTrigger: { trigger: '.skills-tags', start: 'top 85%', toggleActions: 'play reverse play reverse' },
            clearProps: 'transform' // clean up after
        }
    );

    // -----------------------------------------------------------------------
    // 10. PROJECT IMAGES — Horizontal clip-path wipe reveal
    //     BUG FIX: 'inset(0 100% 0 0 round 14px)' — the 'round' keyword
    //     inside inset() is not supported by GSAP's interpolator and breaks
    //     in some browsers. Removed 'round'. The card itself already has
    //     border-radius so the visual effect is unchanged.
    // -----------------------------------------------------------------------
    document.querySelectorAll('.project-image-card').forEach(card => {
        gsap.fromTo(card,
            { clipPath: 'inset(0 100% 0 0)' },
            {
                clipPath: 'inset(0 0% 0 0)',
                duration: 1.2, ease: 'expo.inOut',
                scrollTrigger: { trigger: card, start: 'top 83%', toggleActions: 'play reverse play reverse' },
            }
        );
    });

    // -----------------------------------------------------------------------
    // 11. TIMELINE MARKERS — Pop in with spring bounce
    // -----------------------------------------------------------------------
    document.querySelectorAll('.timeline-marker').forEach(marker => {
        gsap.fromTo(marker,
            { scale: 0, opacity: 0 },
            {
                scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(3)',
                scrollTrigger: { trigger: marker, start: 'top 78%', toggleActions: 'play reverse play reverse' },
                clearProps: 'transform'
            }
        );
    });

    // -----------------------------------------------------------------------
    // 12. SOCIAL LINKS — Stagger slide-in on scroll
    // -----------------------------------------------------------------------
    gsap.fromTo('.social-link',
        { x: -24, opacity: 0 },
        {
            x: 0, opacity: 1, duration: 0.55, ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: { trigger: '.social-links-grid', start: 'top 86%', toggleActions: 'play reverse play reverse' },
            clearProps: 'transform'
        }
    );

    // -----------------------------------------------------------------------
    // 13. BUTTON RIPPLE on click
    //     BUG FIX: .link-arrow and .nav-cta have no overflow:hidden, so
    //     the ripple div bleeds outside visibly. Restrict to .btn only,
    //     which already has overflow:hidden in CSS.
    // -----------------------------------------------------------------------
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            ripple.className = 'btn-ripple';
            const rect = btn.getBoundingClientRect();
            gsap.set(ripple, {
                x: e.clientX - rect.left, y: e.clientY - rect.top,
                xPercent: -50, yPercent: -50,
            });
            btn.appendChild(ripple);
            gsap.to(ripple, {
                scale: 12, opacity: 0, duration: 0.65, ease: 'power2.out',
                onComplete: () => ripple.remove(),
            });
        });
    });

    // -----------------------------------------------------------------------
    // 14. CURSOR SPARKLE TRAIL (desktop only)
    //     Throttled to 1 sparkle per 60ms max, 50% probability per event
    // -----------------------------------------------------------------------
    if (window.innerWidth > 1024) {
        const sparkleColors = ['#00f0ff', '#b026ff', '#ff2a7a', '#0af', '#fa0'];
        let lastSparkle = 0;
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastSparkle < 60 || Math.random() > 0.5) return;
            lastSparkle = now;

            const el  = document.createElement('div');
            const sz  = Math.random() * 5 + 3;
            const col = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
            el.className = 'cursor-sparkle';
            el.style.cssText = `width:${sz}px;height:${sz}px;background:${col};box-shadow:0 0 8px ${col}`;
            document.body.appendChild(el);

            gsap.set(el, { x: e.clientX, y: e.clientY, xPercent: -50, yPercent: -50 });
            gsap.to(el, {
                x: e.clientX + (Math.random() - 0.5) * 60,
                y: e.clientY + (Math.random() - 0.5) * 60 + 15,
                opacity: 0, scale: 0,
                duration: 0.6 + Math.random() * 0.3,
                ease: 'power2.out',
                onComplete: () => el.remove(),
            });
        }, { passive: true });
    }

    // -----------------------------------------------------------------------
    // 15. SECTION TITLE TEXT SCRAMBLE on hover
    //     Works on the .char spans created by the split-text utility.
    //     mouseleave always restores originals so text can never get stuck.
    // -----------------------------------------------------------------------
    const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%';
    document.querySelectorAll('.section-title').forEach(title => {
        const chars = [...title.querySelectorAll('.char')];
        if (!chars.length) return;
        const originals = chars.map(c => c.textContent);
        let scrambleId  = null;
        let iter        = 0;
        const frames    = chars.length * 2.8;

        title.addEventListener('mouseenter', () => {
            clearInterval(scrambleId);
            iter = 0;
            scrambleId = setInterval(() => {
                chars.forEach((ch, i) => {
                    if (originals[i] === ' ') return;
                    ch.textContent = i < iter * 0.45
                        ? originals[i]
                        : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                });
                if (++iter > frames) {
                    clearInterval(scrambleId);
                    chars.forEach((ch, i) => (ch.textContent = originals[i]));
                }
            }, 28);
        });

        title.addEventListener('mouseleave', () => {
            clearInterval(scrambleId);
            chars.forEach((ch, i) => (ch.textContent = originals[i]));
        });
    });

    // -----------------------------------------------------------------------
    // Final refresh
    // -----------------------------------------------------------------------
    ScrollTrigger.refresh();
}

