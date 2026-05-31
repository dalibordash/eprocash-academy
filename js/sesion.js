/* ================================================================
   EPROCASH ACADEMY — js/sesion.js
   Sistema de memoria de sesión y navbar dinámico
   Módulos:
   01. Verificar sesión activa
   02. Actualizar navbar según sesión
   03. Cerrar sesión
================================================================ */

'use strict';

const STORAGE_KEY = 'epc_user';

/* Carga el perfil guardado */
function cargarSesion() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

/* Actualiza el navbar según si hay sesión o no */
function actualizarNavbar() {
    const perfil   = cargarSesion();
    const rightIcons = document.querySelector('.right-icons');
    if (!rightIcons) return;

    if (perfil) {
        /* Usuario logueado — mostrar miniatura Zenix + nombre */
        const zenix = perfil.zenix_activo;
        rightIcons.innerHTML = `
            <button id="theme-toggle" title="Cambiar tema">
                <i class="fa-solid fa-moon" id="theme-icon"></i>
            </button>
            <a href="perfil.html" class="nav-user-btn">
                <div class="nav-zenix-mini" style="--rarity-color:${zenix.rareza_color}">
                    <img src="${zenix.imagen}" alt="${zenix.nombre}">
                </div>
                <span class="nav-user-name">${perfil.nombre.split(' ')[0]}</span>
                <span class="nav-user-badge" style="color:${zenix.rareza_color}">
                    ${zenix.rareza_emoji}
                </span>
            </a>
            <button class="nav-logout-btn" id="nav-logout-btn" title="Cerrar sesión">
                <i class="fa-solid fa-right-from-bracket"></i>
            </button>
        `;

        /* Botón cerrar sesión */
        const logoutBtn = document.getElementById('nav-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem(STORAGE_KEY);
                window.location.reload();
            });
        }

    } else {
        /* Sin sesión — mostrar login y registro */
        rightIcons.innerHTML = `
            <button id="theme-toggle" title="Cambiar tema">
                <i class="fa-solid fa-moon" id="theme-icon"></i>
            </button>
            <a href="login.html" class="login-btn">Iniciar sesión</a>
            <a href="registro.html" class="register-btn">
                Registrarse <i class="fa-solid fa-arrow-right"></i>
            </a>
        `;
    }

    /* Re-inicializar tema después de reconstruir navbar */
    initThemeAfterNavbar();
}

/* Re-inicializa el toggle de tema después de reconstruir el navbar */
function initThemeAfterNavbar() {
    const btn  = document.getElementById('theme-toggle');
    const THEME_KEY = 'epc-theme';

    if (!btn) return;

    /* Aplica tema guardado */
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    if (saved === 'light') {
        document.body.classList.add('light-mode');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.className = 'fa-solid fa-sun';
    }

    btn.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-mode');
        if (isLight) {
            document.body.classList.remove('light-mode');
            const icon = document.getElementById('theme-icon');
            if (icon) icon.className = 'fa-solid fa-moon';
            localStorage.setItem(THEME_KEY, 'dark');
        } else {
            document.body.classList.add('light-mode');
            const icon = document.getElementById('theme-icon');
            if (icon) icon.className = 'fa-solid fa-sun';
            localStorage.setItem(THEME_KEY, 'light');
        }
    });
}

/* Ejecuta al cargar la página */
document.addEventListener('DOMContentLoaded', actualizarNavbar);

/* Exportar */
window.SesionSystem = { cargarSesion, actualizarNavbar };