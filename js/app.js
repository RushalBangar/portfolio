// ------------------------------------------------
// Project Name: Braxton - Personal Portfolio & Resume HTML Template
// File name: app.js — Enhanced for Premium Professional Edition
// ------------------------------------------------

// ------------------------------------------------
// Table of Contents
// ------------------------------------------------
//
//  01. Loader & Loading Animation
//  02. Bootstrap Scroll Spy Plugin Settings
//  03. Lenis Scroll Plugin
//  04. Parallax
//  05. Scroll Animations (Refined)
//  06. Smooth Scrolling
//  07. Swiper Slider
//  08. Contact Form
//  09. Modernizr SVG Fallback
//  10. Chrome Smooth Scroll
//  11. Images Moving Ban
//  12. Detecting Mobile/Desktop
//  13. PhotoSwipe Gallery Images Replace
//  14. Color Switch
//  15. Reading Progress Bar
//  16. Back to Top Button
//  17. Header Glassmorphism on Scroll
//  18. Achievement Counter Animation
//  19. Reduced Motion Check
//
// ------------------------------------------------

// ------------------------------------------------
// Reduced Motion Check (run before anything else)
// ------------------------------------------------
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

$(function() {

  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  // --------------------------------------------- //
  // Loader & Loading Animation Start
  // --------------------------------------------- //
  const content = document.querySelector('body');
  const imgLoad = imagesLoaded(content);

  imgLoad.on('done', instance => {

    document.getElementById("loaderContent").classList.add("fade-out");
    setTimeout(() => {
      document.getElementById("loader").classList.add("loaded");
    }, 300);

    if (!prefersReducedMotion) {
      gsap.set(".animate-headline", {y: 28, opacity: 0});
      ScrollTrigger.batch(".animate-headline", {
        interval: 0.1,
        batchMax: 4,
        duration: 6,
        onEnter: batch => gsap.to(batch, {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          stagger: {each: 0.12, grid: [1, 4]},
          overwrite: true
        }),
        onLeave: batch => gsap.set(batch, {opacity: 1, y: 0, overwrite: true}),
        onEnterBack: batch => gsap.to(batch, {opacity: 1, y: 0, stagger: 0.12, overwrite: true}),
        onLeaveBack: batch => gsap.set(batch, {opacity: 0, y: 28, overwrite: true})
      });
    }

  });
  // --------------------------------------------- //
  // Loader & Loading Animation End
  // --------------------------------------------- //

  // --------------------------------------------- //
  // Bootstrap Scroll Spy Plugin Settings Start
  // --------------------------------------------- //
  const scrollSpy = new bootstrap.ScrollSpy(document.body, {
    target: '#menu',
    smoothScroll: true,
    rootMargin: '0px 0px -40%',
  });
  // --------------------------------------------- //
  // Bootstrap Scroll Spy Plugin Settings End
  // --------------------------------------------- //

  // --------------------------------------------- //
  // Lenis Scroll Plugin Start
  // --------------------------------------------- //
  const lenis = new Lenis();
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  // --------------------------------------------- //
  // Lenis Scroll Plugin End
  // --------------------------------------------- //

  // --------------------------------------------- //
  // Parallax Start
  // --------------------------------------------- //
  if (!prefersReducedMotion) {
    gsap.to("[data-speed]", {
      y: (i, el) => (1 - parseFloat(el.getAttribute("data-speed"))) * ScrollTrigger.maxScroll(window),
      ease: "none",
      scrollTrigger: {
        start: 0,
        end: "max",
        invalidateOnRefresh: true,
        scrub: 0
      }
    });
  }
  // --------------------------------------------- //
  // Parallax End
  // --------------------------------------------- //

  // --------------------------------------------- //
  // Scroll Animations Start (Refined)
  // --------------------------------------------- //
  if (!prefersReducedMotion) {

    // Animation In Up — refined y value and easing
    const animateInUp = document.querySelectorAll(".animate-in-up");
    animateInUp.forEach((element) => {
      gsap.fromTo(element, {
        opacity: 0,
        y: 28,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          toggleActions: 'play none none reverse',
        }
      });
    });

    // Animation Rotation
    const animateRotation = document.querySelectorAll(".animate-rotation");
    animateRotation.forEach((section) => {
      var value = $(section).data("value");
      gsap.fromTo(section, {
        rotate: 0,
      }, {
        rotate: value,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          scrub: true,
          toggleActions: 'play none none reverse',
        }
      });
    });

    // Animation Cards Stack — Grid 2x
    gsap.set(".animate-card-2", {y: 60, opacity: 0});
    ScrollTrigger.batch(".animate-card-2", {
      interval: 0.1,
      batchMax: 2,
      duration: 6,
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        stagger: {each: 0.12, grid: [1, 2]},
        overwrite: true
      }),
      onLeave: batch => gsap.set(batch, {opacity: 1, y: 0, overwrite: true}),
      onEnterBack: batch => gsap.to(batch, {opacity: 1, y: 0, stagger: 0.12, overwrite: true}),
      onLeaveBack: batch => gsap.set(batch, {opacity: 0, y: 60, overwrite: true})
    });

    // Grid 3x
    gsap.set(".animate-card-3", {y: 36, opacity: 0});
    ScrollTrigger.batch(".animate-card-3", {
      interval: 0.1,
      batchMax: 3,
      duration: 3,
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        stagger: {each: 0.12, grid: [1, 3]},
        overwrite: true
      }),
      onLeave: batch => gsap.set(batch, {opacity: 1, y: 0, overwrite: true}),
      onEnterBack: batch => gsap.to(batch, {opacity: 1, y: 0, stagger: 0.12, overwrite: true}),
      onLeaveBack: batch => gsap.set(batch, {opacity: 0, y: 36, overwrite: true})
    });

    // Grid 5x
    gsap.set(".animate-card-5", {y: 36, opacity: 0});
    ScrollTrigger.batch(".animate-card-5", {
      interval: 0.1,
      batchMax: 5,
      delay: 1000,
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        stagger: {each: 0.10, grid: [1, 5]},
        overwrite: true
      }),
      onLeave: batch => gsap.set(batch, {opacity: 1, y: 0, overwrite: true}),
      onEnterBack: batch => gsap.to(batch, {opacity: 1, y: 0, stagger: 0.10, overwrite: true}),
      onLeaveBack: batch => gsap.set(batch, {opacity: 0, y: 36, overwrite: true})
    });

    ScrollTrigger.addEventListener("refreshInit", () => gsap.set(".animate-card-2", {y: 0, opacity: 1}));
    ScrollTrigger.addEventListener("refreshInit", () => gsap.set(".animate-card-3", {y: 0, opacity: 1}));
    ScrollTrigger.addEventListener("refreshInit", () => gsap.set(".animate-card-5", {y: 0, opacity: 1}));

  }
  // --------------------------------------------- //
  // Scroll Animations End
  // --------------------------------------------- //

  // --------------------------------------------- //
  // Smooth Scrolling Start
  // --------------------------------------------- //
  $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function(event) {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000, function() {
          var $target = $(target);
          $target.focus();
          if ($target.is(":focus")) {
            return false;
          } else {
            $target.attr('tabindex','-1');
            $target.focus();
          };
        });
      }
    }
  });
  // --------------------------------------------- //
  // Smooth Scrolling End
  // --------------------------------------------- //

  // --------------------------------------------- //
  // Swiper Slider Start
  // --------------------------------------------- //
  const toolsSlider = document.querySelector("tools-slider");
  const testimonialsSlider = document.querySelector("testimonials-slider");

  if (!toolsSlider) {
    const swiper = new Swiper('.swiper-tools', {
      spaceBetween: 20,
      autoplay: {
        delay: 1500,
        disableOnInteraction: false,
      },
      loop: true,
      grabCursor: true,
      loopFillGroupWithBlank: true,
      breakpoints: {
        1600: { slidesPerView: 5 },
        1200: { slidesPerView: 4 },
        768:  { slidesPerView: 3 },
        576:  { slidesPerView: 2 },
        0:    { slidesPerView: 2 }
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
    });
  };

  if (document.querySelector('.swiper-testimonials')) {
    const swiper = new Swiper('.swiper-testimonials', {
      slidesPerView: 1,
      spaceBetween: 20,
      autoplay: true,
      speed: 1000,
      loop: true,
      loopFillGroupWithBlank: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  };
  // --------------------------------------------- //
  // Swiper Slider End
  // --------------------------------------------- //

  // --------------------------------------------- //
  // Contact Form - handled by inline Formspree handler in index.html
  // --------------------------------------------- //

  // --------------------------------------------- //
  // Modernizr SVG Fallback Start
  // --------------------------------------------- //
  if(!Modernizr.svg) {
    $("img[src*='svg']").attr("src", function() {
      return $(this).attr("src").replace(".svg", ".png");
    });
  };
  // --------------------------------------------- //
  // Modernizr SVG Fallback End
  // --------------------------------------------- //

  // --------------------------------------------- //
  // Chrome Smooth Scroll Start
  // --------------------------------------------- //
  try {
    $.browserSelector();
    if($("html").hasClass("chrome")) {
      $.smoothScroll();
    }
  } catch(err) {
  };
  // --------------------------------------------- //
  // Chrome Smooth Scroll End
  // --------------------------------------------- //

  // --------------------------------------------- //
  // Images Moving Ban Start
  // --------------------------------------------- //
  $("img, a").on("dragstart", function(event) { event.preventDefault(); });
  // --------------------------------------------- //
  // Images Moving Ban End
  // --------------------------------------------- //

  // --------------------------------------------- //
  // Detecting Mobile/Desktop Start
  // --------------------------------------------- //
  var isMobile = false;
  if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    $('html').addClass('touch');
    isMobile = true;
  } else {
    $('html').addClass('no-touch');
    isMobile = false;
  }
  var isIE = /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || /MSIE 10/i.test(navigator.userAgent) || /Edge\/\d+/.test(navigator.userAgent);
  // --------------------------------------------- //
  // Detecting Mobile/Desktop End
  // --------------------------------------------- //

  // --------------------------------------------- //
  // PhotoSwipe Gallery Images Replace Start
  // --------------------------------------------- //
  $('.gallery__link').each(function(){
    $(this)
    .append('<div class="picture"></div>')
    .children('.picture').css({'background-image': 'url('+ $(this).attr('data-image') +')'});
  });
  // --------------------------------------------- //
  // PhotoSwipe Gallery Images Replace End
  // --------------------------------------------- //

  // --------------------------------------------- //
  // Achievement Counter Animation Start
  // --------------------------------------------- //
  function animateCounter(el, target, suffix, duration) {
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + suffix;
      }
    }
    requestAnimationFrame(update);
  }

  const counterEls = document.querySelectorAll('.achievements__number');
  if (counterEls.length > 0 && !prefersReducedMotion) {
    const counterData = [
      { target: 10, suffix: '+' },  // Projects
      { target: 1,  suffix: '+' },  // Years of experience
      { target: 15, suffix: '+' },  // Skills Mastered
    ];

    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const data = counterData[i] !== undefined ? counterData[i] : { target: 0, suffix: '' };
          animateCounter(entry.target, data.target, data.suffix, 1500);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(el => {
      el.textContent = '0';
      counterObserver.observe(el);
    });
  }
  // --------------------------------------------- //
  // Achievement Counter Animation End
  // --------------------------------------------- //

});

// --------------------------------------------- //
// Color Switch Start
// --------------------------------------------- //
const themeBtn = document.querySelector('.color-switcher');

function getCurrentTheme(){
  let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  localStorage.getItem('template.theme') ? theme = localStorage.getItem('template.theme') : null;
  return theme;
}

function loadTheme(theme){
  const root = document.querySelector(':root');
  if(theme === "light"){
    themeBtn.innerHTML = `<em></em><i class="ph-bold ph-moon-stars"></i>`;
  } else {
    themeBtn.innerHTML = `<em></em><i class="ph-bold ph-sun"></i>`;
  }
  root.setAttribute('color-scheme', `${theme}`);
};

themeBtn.addEventListener('click', () => {
  let theme = getCurrentTheme();
  if(theme === 'dark'){
    theme = 'light';
  } else {
    theme = 'dark';
  }
  localStorage.setItem('template.theme', `${theme}`);
  loadTheme(theme);
});

window.addEventListener('DOMContentLoaded', () => {
  loadTheme(getCurrentTheme());
});
// --------------------------------------------- //
// Color Switch End
// --------------------------------------------- //

// --------------------------------------------- //
// Reading Progress Bar Start
// --------------------------------------------- //
(function() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
    progressBar.setAttribute('aria-valuenow', Math.round(progress));
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();
// --------------------------------------------- //
// Reading Progress Bar End
// --------------------------------------------- //

// --------------------------------------------- //
// Back to Top Button Start
// --------------------------------------------- //
(function() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 320) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }, { passive: true });

  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
// --------------------------------------------- //
// Back to Top Button End
// --------------------------------------------- //

// --------------------------------------------- //
// Header Glassmorphism on Scroll Start
// --------------------------------------------- //
(function() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }, { passive: true });
})();
// --------------------------------------------- //
// Header Glassmorphism on Scroll End
// --------------------------------------------- //
