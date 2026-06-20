/* ================================================================
   EPROCASH ACADEMY — js/app.js  v2.2 (fix navegación mobile dropdown)
================================================================ */

'use strict';

/* ─── Helpers ─────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ================================================================
   01. NAVBAR — cambia estilo al hacer scroll
================================================================ */
(function initNavbarScroll() {
    const navbar = $('#navbar');
    if (!navbar) return;

    function onScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();


/* ================================================================
   02. MENÚ HAMBURGUESA (mobile)
================================================================ */
(function initMobileMenu() {
    const toggle  = $('#menu-toggle');
    const nav     = $('nav');
    const overlay = $('#menu-overlay');
    if (!toggle || !nav || !overlay) return;

    function openMenu() {
        toggle.classList.add('open');
        nav.classList.add('open');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        toggle.classList.remove('open');
        nav.classList.remove('open');
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
        nav.classList.contains('open') ? closeMenu() : openMenu();
    });

    overlay.addEventListener('click', closeMenu);

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closeMenu();
    });
})();


/* ================================================================
   03. DROPDOWN MOBILE — CORREGIDO (v2.2)
   ANTES: el click en TODO el <a> (texto + flecha) hacía preventDefault,
   así que un link real como "Academia" (href="academia.html") nunca
   navegaba en mobile, solo abría el submenú.

   AHORA: si el <li> tiene un elemento .dropdown-arrow-trigger separado
   (icono de flecha envuelto aparte), SOLO ese elemento abre/cierra el
   submenú y detiene la propagación. El resto del <a> (el texto) navega
   con normalidad usando su href.

   Para los <li> que NO tengan .dropdown-arrow-trigger (ej. "Herramientas",
   que no tiene página propia todavía), se mantiene el comportamiento
   anterior: todo el <a> abre el submenú, sin romper nada existente.
================================================================ */
(function initMobileDropdowns() {
    $$('.has-dropdown').forEach(li => {
        const trigger      = $('a', li);
        const arrowTrigger = $('.dropdown-arrow-trigger', li);
        if (!trigger) return;

        if (arrowTrigger) {
            /* Caso nuevo: link con href real + flecha separada */
            arrowTrigger.addEventListener('click', e => {
                if (window.innerWidth > 900) return;
                e.preventDefault();
                e.stopPropagation();
                li.classList.toggle('open');
            });
            /* El <a> padre conserva su comportamiento normal de navegación.
               No se le agrega preventDefault: en mobile, tocar el texto
               navega directo al href. */
        } else {
            /* Caso anterior, sin cambios: el <a> completo abre el submenú */
            trigger.addEventListener('click', e => {
                if (window.innerWidth > 900) return;
                e.preventDefault();
                li.classList.toggle('open');
            });
        }
    });
})();


/* ================================================================
   04. DARK / LIGHT MODE
================================================================ */
(function initTheme() {
    const btn  = $('#theme-toggle');
    const icon = $('#theme-icon');
    if (!btn) return;

    const STORAGE_KEY = 'epc-theme';

    function applyTheme(mode) {
        if (mode === 'light') {
            document.body.classList.add('light-mode');
            if (icon) {
                icon.className = 'fa-solid fa-sun';
            }
        } else {
            document.body.classList.remove('light-mode');
            if (icon) {
                icon.className = 'fa-solid fa-moon';
            }
        }
        localStorage.setItem(STORAGE_KEY, mode);
    }

    /* Carga preferencia guardada. Si no hay, usa dark por defecto */
    const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
    applyTheme(saved);

    btn.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-mode');
        applyTheme(isLight ? 'dark' : 'light');
    });
})();


/* ================================================================
   05. SLIDER
================================================================ */
(function initSlider() {
    const slider   = $('#slider');
    const dotsWrap = $('#slider-dots');
    const btnPrev  = $('#slider-prev');
    const btnNext  = $('#slider-next');
    if (!slider) return;

    const slides  = $$('.slide', slider);
    const total   = slides.length;
    let current   = 0;
    let timer     = null;
    const DELAY   = 4500;

    /* Asegurarse de que solo el primero tiene .active al inicio */
    slides.forEach((s, i) => {
        s.classList.toggle('active', i === 0);
    });

    /* Generar dots */
    if (dotsWrap) {
        dotsWrap.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Slide ' + (i + 1));
            dot.addEventListener('click', () => { goTo(i); resetTimer(); });
            dotsWrap.appendChild(dot);
        });
    }

    function updateDots() {
        if (!dotsWrap) return;
        $$('.dot', dotsWrap).forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    function goTo(index) {
        slides[current].classList.remove('active');
        slides[current].classList.add('exit');

        const prev = current;
        setTimeout(() => slides[prev].classList.remove('exit'), 520);

        current = (index + total) % total;
        slides[current].classList.add('active');
        updateDots();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function resetTimer() {
        clearInterval(timer);
        timer = setInterval(next, DELAY);
    }

    if (btnPrev) btnPrev.addEventListener('click', () => { prev(); resetTimer(); });
    if (btnNext) btnNext.addEventListener('click', () => { next(); resetTimer(); });

    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', resetTimer);

    /* Swipe táctil */
    let touchX = 0;
    slider.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
        const diff = touchX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); resetTimer(); }
    }, { passive: true });

    resetTimer();
})();


/* ================================================================
   06. CONTADOR ANIMADO — hero stats
================================================================ */
(function initCounters() {
    const counters = $$('.stat-num');
    if (!counters.length) return;

    let started = false;

    function animateCount(el) {
        const target   = parseInt(el.dataset.target, 10);
        const duration = 1800;
        const start    = performance.now();

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString('es');
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* Dispara cuando el hero entra en pantalla */
    const heroStats = $('.hero-stats');
    if (!heroStats) return;

    const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !started) {
            started = true;
            counters.forEach(animateCount);
            obs.disconnect();
        }
    }, { threshold: 0.3 });

    obs.observe(heroStats);
})();


/* ================================================================
   07. NEWSLETTER — validación
================================================================ */
(function initNewsletter() {
    const form    = $('#cta-form');
    const input   = $('#cta-email');
    const success = $('#form-success');
    const error   = $('#form-error');
    if (!form) return;

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        success.style.display = 'none';
        error.style.display   = 'none';

        if (!isValidEmail(input.value)) {
            error.style.display = 'flex';
            input.focus();
            return;
        }

        /* Aquí conectarás tu API de email en el futuro */
        success.style.display = 'flex';
        input.value = '';
        setTimeout(() => { success.style.display = 'none'; }, 5000);
    });

    if (input) {
        input.addEventListener('input', () => {
            error.style.display = 'none';
        });
    }
})();


/* ================================================================
   08. BOTÓN SCROLL TO TOP
================================================================ */
(function initScrollTop() {
    const btn = $('#scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();