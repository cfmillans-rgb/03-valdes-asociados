/**
 * VALDÉS & ASOCIADOS — main.js
 * Carousel + FAQ Accordion + Scroll Fade-in + Form Validation + Navbar scroll
 */

(function () {
  'use strict';

  /* ============================================================
     UTILS
     ============================================================ */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     NAVBAR — shrink on scroll
     ============================================================ */
  const navbar = document.querySelector('.navbar-main');

  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     HERO — subtle parallax load effect
     ============================================================ */
  const hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(() => {
      hero.classList.add('loaded');
    });
  }

  /* ============================================================
     CAROUSEL — áreas de práctica
     ============================================================ */
  const carousel = document.querySelector('[data-carousel="va"]');

  if (carousel) {
    const track     = carousel.querySelector('[data-carousel-track]');
    const slides    = Array.from(carousel.querySelectorAll('[data-slide]'));
    const dotsWrap  = carousel.querySelector('[data-carousel-dots]');
    const prevBtn   = carousel.querySelector('[data-carousel-prev]');
    const nextBtn   = carousel.querySelector('[data-carousel-next]');
    const counterEl = carousel.querySelector('[data-carousel-counter]');

    let current    = 0;
    let total      = slides.length;
    let autoTimer  = null;
    let isAnimating = false;

    // Create dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'va-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('type', 'button');
      dot.setAttribute('aria-label', `Ir a diapositiva ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.querySelectorAll('.va-dot'));

    function updateUI() {
      // Move track
      if (prefersReducedMotion) {
        track.style.transition = 'none';
      }
      track.style.transform = `translateX(-${current * 100}%)`;

      // Dots
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-current', i === current ? 'true' : 'false');
      });

      // Counter
      if (counterEl) {
        counterEl.innerHTML =
          `<span class="current">${String(current + 1).padStart(2,'0')}</span> / ${String(total).padStart(2,'0')}`;
      }

      // ARIA on track
      slides.forEach((s, i) => {
        s.setAttribute('aria-hidden', i !== current ? 'true' : 'false');
      });

      // Prev/next disabled state
      if (prevBtn) prevBtn.setAttribute('aria-disabled', 'false');
      if (nextBtn) nextBtn.setAttribute('aria-disabled', 'false');
    }

    function goTo(index) {
      if (isAnimating) return;
      isAnimating = true;
      current = (index + total) % total;
      updateUI();
      setTimeout(() => { isAnimating = false; }, 700);
      resetAutoplay();
    }

    function goNext() { goTo(current + 1); }
    function goPrev() { goTo(current - 1); }

    if (nextBtn) nextBtn.addEventListener('click', goNext);
    if (prevBtn) prevBtn.addEventListener('click', goPrev);

    // Keyboard support
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    });

    // Touch / swipe
    let touchStartX = 0;
    let touchEndX   = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? goNext() : goPrev();
      }
    }, { passive: true });

    // Autoplay
    function startAutoplay() {
      if (prefersReducedMotion) return;
      autoTimer = setInterval(goNext, 4000);
    }

    function resetAutoplay() {
      clearInterval(autoTimer);
      startAutoplay();
    }

    // Pause on hover/focus
    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('focusin',    () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusout',   startAutoplay);

    // Init
    updateUI();
    startAutoplay();
  }

  /* ============================================================
     FAQ ACCORDION
     ============================================================ */
  const accordionItems = document.querySelectorAll('.va-accordion-item');

  accordionItems.forEach((item) => {
    const btn  = item.querySelector('.va-accordion-btn');
    const body = item.querySelector('.va-accordion-body');
    const inner = item.querySelector('.va-accordion-body-inner');

    if (!btn || !body) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all others (single-open accordion)
      accordionItems.forEach((other) => {
        if (other !== item && other.classList.contains('is-open')) {
          closeItem(other);
        }
      });

      if (isOpen) {
        closeItem(item);
      } else {
        openItem(item);
      }
    });

    // Keyboard
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  function openItem(item) {
    const body  = item.querySelector('.va-accordion-body');
    const inner = item.querySelector('.va-accordion-body-inner');
    const btn   = item.querySelector('.va-accordion-btn');
    item.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    if (prefersReducedMotion) {
      body.style.maxHeight = inner.scrollHeight + 'px';
    } else {
      body.style.maxHeight = inner.scrollHeight + 'px';
    }
  }

  function closeItem(item) {
    const body = item.querySelector('.va-accordion-body');
    const btn  = item.querySelector('.va-accordion-btn');
    item.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    body.style.maxHeight = '0';
  }

  /* ============================================================
     SCROLL FADE-IN (IntersectionObserver)
     ============================================================ */
  if (!prefersReducedMotion) {
    const sections = document.querySelectorAll('.fade-in-section');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    sections.forEach((el) => observer.observe(el));
  } else {
    // Show all immediately if reduced motion is preferred
    document.querySelectorAll('.fade-in-section').forEach((el) => {
      el.classList.add('is-visible');
    });
  }

  /* ============================================================
     CONTACT FORM — validation
     ============================================================ */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    const successMsg = document.getElementById('formSuccess');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      // Remove previous validation state
      contactForm.querySelectorAll('.form-control, .form-select').forEach((field) => {
        field.classList.remove('is-invalid', 'is-valid');
      });

      // Validate each required field
      contactForm.querySelectorAll('[required]').forEach((field) => {
        if (!field.value.trim()) {
          field.classList.add('is-invalid');
          valid = false;
        } else {
          // Email special check
          if (field.type === 'email') {
            const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRx.test(field.value.trim())) {
              field.classList.add('is-invalid');
              valid = false;
            } else {
              field.classList.add('is-valid');
            }
          } else {
            field.classList.add('is-valid');
          }
        }
      });

      if (valid) {
        // Simulate successful submission
        contactForm.style.display = 'none';
        if (successMsg) {
          successMsg.classList.add('show');
          successMsg.setAttribute('aria-live', 'polite');
          successMsg.focus();
        }
      } else {
        // Scroll to first invalid field
        const firstInvalid = contactForm.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
        }
      }
    });

    // Remove invalid on input
    contactForm.querySelectorAll('.form-control, .form-select').forEach((field) => {
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid') && field.value.trim()) {
          field.classList.remove('is-invalid');
          field.classList.add('is-valid');
        }
      });
    });
  }

  /* ============================================================
     SMOOTH SCROLL for anchor links
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight + 8 : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        if (prefersReducedMotion) {
          window.scrollTo({ top });
        } else {
          window.scrollTo({ top, behavior: 'smooth' });
        }
        // Close mobile menu if open
        const bsNavbar = document.querySelector('.navbar-collapse.show');
        if (bsNavbar) {
          const toggler = document.querySelector('.navbar-toggler');
          if (toggler) toggler.click();
        }
      }
    });
  });

  /* ============================================================
     ACTIVE NAV LINK on scroll (IntersectionObserver)
     ============================================================ */
  const navLinks = document.querySelectorAll('.navbar-main .nav-link[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  if (navLinks.length && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              link.classList.remove('active');
              if (link.getAttribute('href') === '#' + entry.target.id) {
                link.classList.add('active');
              }
            });
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ============================================================
     TOAST "EN CONSTRUCCIÓN" — links con data-wip
     ============================================================ */
  const wipToast      = document.getElementById('wipToast');
  const wipToastTitle = document.getElementById('wipToastTitle');
  const wipToastBody  = document.getElementById('wipToastBody');
  let wipTimer        = null;

  function showWipToast(label) {
    if (!wipToast) return;

    // Actualizar texto según el link
    const labels = {
      'LinkedIn':               ['LinkedIn — Próximamente', 'Estamos configurando nuestra presencia en LinkedIn.'],
      'Twitter / X':            ['Twitter / X — Próximamente', 'Próximamente podrá seguirnos en Twitter / X.'],
      'Política de Privacidad': ['Política de Privacidad', 'Este documento estará disponible en breve.'],
      'Términos de Uso':        ['Términos de Uso', 'Este documento estará disponible en breve.'],
    };

    const [title, body] = labels[label] || ['Página en construcción', 'Esta sección estará disponible próximamente.'];
    wipToastTitle.textContent = title;
    wipToastBody.textContent  = body;

    // Mostrar
    wipToast.style.opacity        = '1';
    wipToast.style.transform      = 'translateY(0)';
    wipToast.style.pointerEvents  = 'auto';

    // Auto-ocultar a los 4 s
    clearTimeout(wipTimer);
    wipTimer = setTimeout(hideWipToast, 4000);
  }

  function hideWipToast() {
    if (!wipToast) return;
    wipToast.style.opacity       = '0';
    wipToast.style.transform     = 'translateY(12px)';
    wipToast.style.pointerEvents = 'none';
  }

  document.querySelectorAll('[data-wip]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showWipToast(link.dataset.wip);
    });
  });

})();
