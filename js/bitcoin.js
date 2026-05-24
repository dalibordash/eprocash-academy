/* ================================================================
   EPROCASH ACADEMY — js/bitcoin.js
   Módulos:
   01. Precio BTC en tiempo real (CoinGecko API — gratis, sin clave)
   02. Modal FAQ de Zenix con acordeón
================================================================ */

'use strict';


/* ================================================================
   01. PRECIO BTC EN TIEMPO REAL
   Usa la API pública de CoinGecko — sin necesidad de API key
================================================================ */
(function initBTCPrice() {

    /* Elementos del DOM */
    const heroPrice  = document.getElementById('hero-price');
    const heroChange = document.getElementById('hero-change');
    const floatPrice = document.getElementById('bpf-price');
    const floatChange= document.getElementById('bpf-change');

    /* URL de la API de CoinGecko */
    const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true';

    /* Formatea número como precio USD */
    function formatPrice(num) {
        return '$' + num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /* Actualiza todos los elementos con el precio */
    function updatePriceUI(price, change) {
        const priceStr  = formatPrice(price);
        const changeStr = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
        const isUp      = change >= 0;

        /* Hero card */
        if (heroPrice) heroPrice.textContent = priceStr;
        if (heroChange) {
            heroChange.textContent  = changeStr;
            heroChange.className    = 'btc-hc-change ' + (isUp ? 'up' : 'down');
        }

        /* Flotante */
        if (floatPrice) floatPrice.textContent = priceStr;
        if (floatChange) {
            floatChange.textContent = changeStr;
            floatChange.className   = 'bpf-change ' + (isUp ? 'up' : 'down');
        }
    }

    /* Muestra estado de error */
    function showError() {
        if (heroPrice)  heroPrice.textContent  = 'No disponible';
        if (heroChange) heroChange.textContent  = '—';
        if (floatPrice) floatPrice.textContent  = 'Error';
        if (floatChange)floatChange.textContent = '—';
    }

    /* Llama a la API */
    async function fetchPrice() {
        try {
            const res  = await fetch(API_URL);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            const price  = data.bitcoin.usd;
            const change = data.bitcoin.usd_24h_change;
            updatePriceUI(price, change);
        } catch (err) {
            console.warn('BTC price fetch error:', err.message);
            showError();
        }
    }

    /* Carga inicial */
    fetchPrice();

    /* Actualiza cada 60 segundos */
    setInterval(fetchPrice, 60000);

})();


/* ================================================================
   02. MODAL FAQ DE ZENIX
================================================================ */
(function initFAQ() {

    const btn     = document.getElementById('zenix-faq-btn');
    const modal   = document.getElementById('faq-modal');
    const overlay = document.getElementById('faq-overlay');
    const closeBtn= document.getElementById('faq-close');
    if (!btn || !modal) return;

    /* Abrir / cerrar modal */
    function openModal() {
        modal.classList.add('open');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
    function closeModal() {
        modal.classList.remove('open');
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    btn.addEventListener('click', () => {
        modal.classList.contains('open') ? closeModal() : openModal();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay)  overlay.addEventListener('click', closeModal);

    /* Cerrar con tecla Escape */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });

    /* Acordeón de preguntas */
    const questions = document.querySelectorAll('.faq-q');
    questions.forEach(q => {
        q.addEventListener('click', () => {
            const answer   = q.nextElementSibling;
            const isOpen   = q.classList.contains('open');

            /* Cierra todas */
            questions.forEach(oq => {
                oq.classList.remove('open');
                const oa = oq.nextElementSibling;
                if (oa) oa.style.display = 'none';
            });

            /* Abre la clickeada si estaba cerrada */
            if (!isOpen) {
                q.classList.add('open');
                if (answer) answer.style.display = 'block';
            }
        });
    });

})();