/* ================================================================
   BOTS.JS — Eprocash Academy v3.0
   Página de Bots de Trading

   ARQUITECTURA PREPARADA PARA INTEGRACIONES FUTURAS:
   El objeto BotsRegistry centraliza la configuración de cada bot.
   Hoy solo se usa para mostrar el estado (badge) en la UI, pero está
   diseñado para que en el futuro cada entrada pueda conectarse a:
   - Un endpoint propio (ej. estado en vivo desde un VPS)
   - Un bot de Telegram (ej. mostrar últimas señales reales)
   - Una cuenta MT5 (ej. mostrar operaciones abiertas)

   Cuando se conecte una integración real, solo hay que:
   1. Cambiar el campo `estado` de la entrada correspondiente
   2. Agregar la función fetchEstadoEnVivo() específica de ese bot
   3. Llamarla desde initBotsRegistry() sin tocar el resto del archivo
================================================================ */

'use strict';

/* ================================================================
   1. BotsRegistry — configuración centralizada, lista para integrarse
================================================================ */
const BotsRegistry = {
  'bot-senales': {
    nombre: 'Bot de señales',
    estado: 'operativo',        // operativo | desarrollo | planeado
    integraciones: {
      telegram: { conectado: true, descripcion: 'Envía alertas al canal de Telegram vía BotFather' },
      api: { conectado: false, descripcion: 'Endpoint REST para consultar señales — pendiente' }
    }
  },
  'bot-ejecucion': {
    nombre: 'Bot de ejecución automática',
    estado: 'desarrollo',
    integraciones: {
      mt5: { conectado: true, descripcion: 'Conectado a cuenta demo XM vía MetaTrader5 (Python)' },
      mt5_real: { conectado: false, descripcion: 'Ejecución en cuenta real — pendiente de backtesting' }
    }
  },
  'bot-monitor': {
    nombre: 'Bot monitor',
    estado: 'planeado',
    integraciones: {
      vps: { conectado: false, descripcion: 'Monitoreo de salud del sistema en VPS 24/7 — planeado' },
      alertas: { conectado: false, descripcion: 'Alertas de caída del bot vía Telegram — planeado' }
    }
  }
};

/* Punto de extensión futuro: cuando exista un backend real, esta función
   reemplaza los datos estáticos de arriba por datos en vivo. Por ahora
   no hace nada porque no hay backend — está aquí para que la integración
   futura sea un cambio aislado, no una reescritura de la página. */
async function fetchEstadoEnVivo(botId) {
  // Ejemplo futuro:
  // const res = await fetch(`https://tu-api.com/bots/${botId}/estado`);
  // const data = await res.json();
  // return data.estado;
  return null; // sin backend todavía, se usa el estado estático del registry
}

/* ================================================================
   2. TABS de los 3 módulos en el hub → scroll a sección ancla
   (no requiere JS especial, son <a href="#bot-x">, pero se agrega
   smooth scroll consistente con el resto del sitio)
================================================================ */
function initBotsCardScroll() {
  document.querySelectorAll('[data-bots-scroll]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').replace('#', '');
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ================================================================
   3. SUBTABS internas de cada módulo (Descripción/Funcionamiento/etc.)
================================================================ */
function initBotsSubtabs() {
  document.querySelectorAll('.bots-detail-section').forEach(section => {
    const tabs = section.querySelectorAll('.bots-subtab');
    const panels = section.querySelectorAll('.bots-subpanel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-bots-subtab');

        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const panel = section.querySelector(`[data-bots-subpanel="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  });
}

/* ================================================================
   4. FAQ acordeón por módulo
================================================================ */
function initBotsFaq() {
  document.querySelectorAll('.bots-faq-item').forEach(item => {
    const question = item.querySelector('.bots-faq-q');
    if (!question) return;
    question.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      // Cierra los demás FAQ del mismo módulo (acordeón exclusivo por sección)
      const parentSection = item.closest('.bots-detail-section');
      if (parentSection) {
        parentSection.querySelectorAll('.bots-faq-item.open').forEach(other => {
          if (other !== item) other.classList.remove('open');
        });
      }
      item.classList.toggle('open', !wasOpen);
    });
  });
}

/* ================================================================
   5. Pinta el badge de estado en cada module-card del hub
   usando BotsRegistry, para que el estado se gestione en un solo lugar
================================================================ */
function initBotsStatusBadges() {
  document.querySelectorAll('[data-bot-id]').forEach(el => {
    const botId = el.getAttribute('data-bot-id');
    const config = BotsRegistry[botId];
    if (!config) return;

    const badge = el.querySelector('.bots-status');
    if (badge) {
      badge.className = 'bots-status ' + config.estado;
      const labels = { operativo: 'Operativo', desarrollo: 'En desarrollo', planeado: 'Planeado' };
      badge.textContent = labels[config.estado] || config.estado;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initBotsCardScroll();
  initBotsSubtabs();
  initBotsFaq();
  initBotsStatusBadges();
});