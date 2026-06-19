/* ============================================================
   ACADEMIA.JS — Eprocash Academy v3.0
   Funciones:
   1. Sistema de progreso por módulo (localStorage, sin backend aún)
   2. Tabs de contenido (Video / PDF / Artículo) dentro de cada lección
   3. Marcado de lección como completada al click
   NOTA: no se modifica js/app.js existente (theme toggle, menu mobile,
   scroll reveal). Este archivo es aditivo y se carga después de app.js.
============================================================ */

const AcademiaProgress = (() => {
  const STORAGE_KEY = 'eprocash_academia_progress';

  function getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveAll(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* almacenamiento no disponible — falla silenciosa, no rompe la UI */
    }
  }

  function getModuleProgress(moduleId, totalLessons) {
    const all = getAll();
    const completed = (all[moduleId] || []).length;
    const pct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
    return { completed, total: totalLessons, pct };
  }

  function isLessonCompleted(moduleId, lessonId) {
    const all = getAll();
    return (all[moduleId] || []).includes(lessonId);
  }

  function toggleLesson(moduleId, lessonId) {
    const all = getAll();
    if (!all[moduleId]) all[moduleId] = [];
    const idx = all[moduleId].indexOf(lessonId);
    if (idx >= 0) {
      all[moduleId].splice(idx, 1);
    } else {
      all[moduleId].push(lessonId);
    }
    saveAll(all);
    return all[moduleId].includes(lessonId);
  }

  return { getModuleProgress, isLessonCompleted, toggleLesson };
})();

/* ── Pinta barras de progreso de cada module-card en el hub ── */
function initModuleCardsProgress() {
  const cards = document.querySelectorAll('[data-module-id]');
  let totalCompleted = 0;
  let totalLessons = 0;

  cards.forEach(card => {
    const moduleId = card.getAttribute('data-module-id');
    const total = parseInt(card.getAttribute('data-total-lessons') || '0', 10);
    const { completed, pct } = AcademiaProgress.getModuleProgress(moduleId, total);

    const fill = card.querySelector('.progress-bar-fill');
    if (fill) fill.style.width = pct + '%';

    const metaCompleted = card.querySelector('.module-completed-count');
    if (metaCompleted) metaCompleted.textContent = `${completed}/${total} lecciones`;

    totalCompleted += completed;
    totalLessons += total;
  });

  const summaryValue = document.getElementById('global-progress-value');
  const summaryFill = document.getElementById('global-progress-fill');
  if (summaryValue) {
    const pct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
    summaryValue.textContent = `${totalCompleted} de ${totalLessons} lecciones completadas`;
    if (summaryFill) summaryFill.style.width = pct + '%';
  }
}

/* ── Tabs de contenido dentro de una lección (Video/PDF/Artículo) ── */
function initContentTabs() {
  const tabGroups = document.querySelectorAll('.content-tabs');
  tabGroups.forEach(group => {
    const tabs = group.querySelectorAll('.content-tab:not([disabled])');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-tab-target');
        const parent = group.closest('.module-content-block') || document;

        parent.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
        parent.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const panel = parent.querySelector(`[data-panel="${targetId}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  });
}

/* ── Lista de lecciones: click para marcar como completada y mostrar contenido ── */
function initLessonsList() {
  const moduleId = document.body.getAttribute('data-module-id');
  if (!moduleId) return;

  const items = document.querySelectorAll('.lesson-item');
  items.forEach(item => {
    const lessonId = item.getAttribute('data-lesson-id');
    if (!lessonId) return;

    if (AcademiaProgress.isLessonCompleted(moduleId, lessonId)) {
      item.classList.add('completed');
      const icon = item.querySelector('.lesson-status-icon');
      if (icon) icon.innerHTML = '<i class="fa-solid fa-check"></i>';
    }

    if (item.classList.contains('locked')) return;

    item.addEventListener('click', (e) => {
      /* Si el click fue en el ícono de check, alterna completado sin abrir contenido */
      if (e.target.closest('.lesson-status-icon')) {
        const nowCompleted = AcademiaProgress.toggleLesson(moduleId, lessonId);
        item.classList.toggle('completed', nowCompleted);
        const icon = item.querySelector('.lesson-status-icon');
        if (icon) icon.innerHTML = nowCompleted ? '<i class="fa-solid fa-check"></i>' : '';
        updateModuleHeroProgress(moduleId);
        return;
      }

      /* Activa visualmente la lección seleccionada */
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      /* Si la lección tiene un bloque de contenido asociado, lo muestra */
      const targetBlock = document.getElementById('content-' + lessonId);
      if (targetBlock) {
        document.querySelectorAll('.module-content-block').forEach(b => b.style.display = 'none');
        targetBlock.style.display = 'block';
        targetBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  updateModuleHeroProgress(moduleId);
}

function updateModuleHeroProgress(moduleId) {
  const totalAttr = document.body.getAttribute('data-total-lessons');
  const total = parseInt(totalAttr || '0', 10);
  const { completed, pct } = AcademiaProgress.getModuleProgress(moduleId, total);

  const valueEl = document.getElementById('module-progress-value');
  const fillEl = document.getElementById('module-progress-fill');
  const countEl = document.getElementById('module-progress-count');

  if (valueEl) valueEl.textContent = pct + '%';
  if (fillEl) fillEl.style.width = pct + '%';
  if (countEl) countEl.textContent = `${completed} de ${total} lecciones`;
}

document.addEventListener('DOMContentLoaded', () => {
  initModuleCardsProgress();
  initContentTabs();
  initLessonsList();
});