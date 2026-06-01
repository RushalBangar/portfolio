// Wait for DOM and window to load
window.addEventListener('load', () => {
    
    // 1. Initialize Lenis for Buttery Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for premium feel
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    // Remove Loader
    gsap.to('.loader-text', { opacity: 1, duration: 1, ease: 'power2.inOut' });
    gsap.to('.loader', {
        y: '-100%',
        duration: 1.5,
        delay: 1.5,
        ease: 'expo.inOut',
        onComplete: () => {
            document.body.classList.remove('loading');
            initAnimations();
        }
    });

    // 3. Initialize Animations
    function initAnimations() {
        
        const horizontalContainer = document.querySelector('.horizontal-container');
        const panels = gsap.utils.toArray('.panel');
        
        // Calculate the total scroll distance based on the width of all panels combined minus the viewport width
        // panels.length * 100vw = 400vw. We need to move left by 300vw.
        const totalScrollDistance = horizontalContainer.scrollWidth - window.innerWidth;

        // HORIZONTAL SCROLL TRIGGER
        gsap.to(horizontalContainer, {
            x: () => -totalScrollDistance,
            ease: "none",
            scrollTrigger: {
                trigger: "#smooth-wrapper",
                pin: true,
                scrub: 0.5, // Smooth scrubbing
                end: () => "+=" + totalScrollDistance, // The distance to scroll vertically
                invalidateOnRefresh: true // Recalculates on resize
            }
        });

        // PARALLAX EFFECTS INSIDE HORIZONTAL SCROLL
        // We select elements with data-speed and move them on the x axis slightly differently than the container
        const parallaxElements = gsap.utils.toArray('[data-speed]');
        
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-speed'));
            // If speed < 1, it moves slower. If speed > 1, it moves faster.
            // Since the container is moving left, we offset the element to the right or left
            const offset = (1 - speed) * window.innerWidth;
            
            gsap.to(el, {
                x: offset,
                ease: "none",
                scrollTrigger: {
                    trigger: "#smooth-wrapper",
                    scrub: 0.5,
                    start: "top top",
                    end: () => "+=" + totalScrollDistance,
                    invalidateOnRefresh: true
                }
            });
        });
        
        // Intro animations for Hero
        const tl = gsap.timeline();
        tl.fromTo('.huge-title', 
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: 'expo.out', stagger: 0.2 }
        )
        .fromTo('.hero-desc',
            { opacity: 0 },
            { opacity: 1, duration: 1, ease: 'power2.out' },
            "-=1"
        )
        .fromTo('.hero-avatar',
            { scale: 0.8, opacity: 0, rotationY: -90 },
            { scale: 1, opacity: 1, rotationY: 0, duration: 2, ease: 'elastic.out(1, 0.7)' },
            "-=1.5"
        );
    }
});
