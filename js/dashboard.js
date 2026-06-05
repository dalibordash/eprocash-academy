/* ================================================================
   EPROCASH ACADEMY 2.0 — js/dashboard.js
   Sistema completo del área privada

   ESTADO:
   ✅ Funcional ahora con localStorage
   🔄 NEXT.JS: cada función marcada para migración a Supabase

   Módulos:
   01. Configuración XP y niveles
   02. Configuración de logros
   03. Configuración de rutas de aprendizaje
   04. Guardar / cargar datos
   05. Sistema de XP
   06. Sistema de logros
   07. Sistema de progreso
   08. Protección de rutas privadas
   09. Render del dashboard
   10. Render de rutas
   11. Render de logros
   12. Render de recursos
   13. Utilidades
================================================================ */

'use strict';

/* ================================================================
   01. CONFIGURACIÓN XP Y NIVELES
================================================================ */
const XP_CONFIG = {
    niveles: [
        { nivel: 1, nombre: 'Iniciado',   xp: 0    },
        { nivel: 2, nombre: 'Aprendiz',   xp: 100  },
        { nivel: 3, nombre: 'Trader',     xp: 300  },
        { nivel: 4, nombre: 'Analista',   xp: 600  },
        { nivel: 5, nombre: 'Estratega',  xp: 1000 },
        { nivel: 6, nombre: 'Experto',    xp: 1500 },
        { nivel: 7, nombre: 'Maestro',    xp: 2500 },
        { nivel: 8, nombre: 'Leyenda',    xp: 4000 }
    ],
    acciones: {
        registro:           20,
        primera_leccion:    15,
        leccion_completada: 10,
        modulo_completado:  50,
        nivel_completado:   150,
        logro_desbloqueado: 30,
        racha_7_dias:       50,
        recurso_descargado: 5,
        evento_asistido:    25
    },
    evolucion_zenix: {
        base:     [1, 3],
        mejorado: [4, 5],
        avanzado: [6, 7],
        maestro:  [8, 8]
    }
};


/* ================================================================
   02. CONFIGURACIÓN DE LOGROS
================================================================ */
const LOGROS_CONFIG = [
    {
        id:          'bienvenido',
        nombre:      'Bienvenido a Eprocash',
        descripcion: 'Te has registrado en la academia',
        emoji:       '🎉',
        xp:          20,
        condicion:   (perfil) => true,  /* Se otorga al registrarse */
        badge_img:   'images/badges/badge_bienvenido.png'
    },
    {
        id:          'primera_leccion',
        nombre:      'Primera Lección',
        descripcion: 'Completaste tu primera lección',
        emoji:       '📚',
        xp:          15,
        condicion:   (perfil) => perfil.lecciones_completadas >= 1,
        badge_img:   'images/badges/badge_primera-leccion.png'
    },
    {
        id:          'racha_3',
        nombre:      'En Racha',
        descripcion: '3 días consecutivos de aprendizaje',
        emoji:       '🔥',
        xp:          30,
        condicion:   (perfil) => perfil.racha_actual >= 3,
        badge_img:   'images/badges/badge_racha-3.png'
    },
    {
        id:          'racha_7',
        nombre:      'Imparable',
        descripcion: '7 días consecutivos de aprendizaje',
        emoji:       '⚡',
        xp:          50,
        condicion:   (perfil) => perfil.racha_actual >= 7,
        badge_img:   'images/badges/badge_racha-7.png'
    },
    {
        id:          'nivel_2',
        nombre:      'Subiendo el Nivel',
        descripcion: 'Alcanzaste el nivel 2',
        emoji:       '⬆️',
        xp:          30,
        condicion:   (perfil) => perfil.nivel >= 2,
        badge_img:   'images/badges/badge_nivel-2.png'
    },
    {
        id:          'modulo_1',
        nombre:      'Módulo Completado',
        descripcion: 'Completaste el primer módulo',
        emoji:       '✅',
        xp:          50,
        condicion:   (perfil) => (perfil.modulos_completados || []).includes('basico_m1'),
        badge_img:   'images/badges/badge_modulo-1.png'
    },
    {
        id:          'zenix_epico',
        nombre:      'Zenix Épico',
        descripcion: 'Obtuviste un Zenix de rareza Épica',
        emoji:       '🟡',
        xp:          100,
        condicion:   (perfil) => perfil.zenix_activo?.rareza_id === 'epico',
        badge_img:   'images/badges/badge_zenix-epico.png'
    }
];


/* ================================================================
   03. CONFIGURACIÓN DE RUTAS DE APRENDIZAJE
   Preparado para carga dinámica desde CMS/Supabase en el futuro
================================================================ */
const RUTAS_CONFIG = {
    basico: {
        id:       'basico',
        nombre:   'Nivel Básico',
        subtitulo:'Fundamentos del Trading',
        emoji:    '📗',
        color:    '#00e59b',
        desbloqueado: true,
        modulos: [
            {
                id:     'basico_m1',
                nombre: 'Introducción a los Mercados',
                emoji:  '🏦',
                lecciones: [
                    { id: 'b1_l1', nombre: '¿Qué es el trading?',         xp: 10, duracion: '8 min',  video_id: null },
                    { id: 'b1_l2', nombre: 'Tipos de mercados financieros',xp: 10, duracion: '10 min', video_id: null },
                    { id: 'b1_l3', nombre: 'Actores del mercado',          xp: 10, duracion: '7 min',  video_id: null },
                    { id: 'b1_l4', nombre: 'Cómo leer un precio',          xp: 10, duracion: '9 min',  video_id: null }
                ]
            },
            {
                id:     'basico_m2',
                nombre: 'Velas Japonesas',
                emoji:  '🕯️',
                lecciones: [
                    { id: 'b2_l1', nombre: 'Anatomía de una vela',         xp: 10, duracion: '8 min',  video_id: null },
                    { id: 'b2_l2', nombre: 'Velas alcistas y bajistas',    xp: 10, duracion: '10 min', video_id: null },
                    { id: 'b2_l3', nombre: 'Patrones de reversión',        xp: 15, duracion: '12 min', video_id: null },
                    { id: 'b2_l4', nombre: 'Patrones de continuación',     xp: 15, duracion: '12 min', video_id: null }
                ]
            },
            {
                id:     'basico_m3',
                nombre: 'Gestión de Riesgo Básica',
                emoji:  '🛡️',
                lecciones: [
                    { id: 'b3_l1', nombre: '¿Qué es el riesgo?',           xp: 10, duracion: '8 min',  video_id: null },
                    { id: 'b3_l2', nombre: 'Stop loss y take profit',       xp: 10, duracion: '10 min', video_id: null },
                    { id: 'b3_l3', nombre: 'Tamaño de posición',            xp: 15, duracion: '11 min', video_id: null },
                    { id: 'b3_l4', nombre: 'Regla del 1-2%',                xp: 15, duracion: '9 min',  video_id: null }
                ]
            },
            {
                id:     'basico_m4',
                nombre: 'Psicología del Trader',
                emoji:  '🧠',
                lecciones: [
                    { id: 'b4_l1', nombre: 'Emociones en el trading',      xp: 10, duracion: '10 min', video_id: null },
                    { id: 'b4_l2', nombre: 'FOMO y cómo controlarlo',      xp: 10, duracion: '8 min',  video_id: null },
                    { id: 'b4_l3', nombre: 'Disciplina y constancia',      xp: 15, duracion: '9 min',  video_id: null },
                    { id: 'b4_l4', nombre: 'Diario de trading',            xp: 15, duracion: '7 min',  video_id: null }
                ]
            }
        ]
    },
    intermedio: {
        id:       'intermedio',
        nombre:   'Nivel Intermedio',
        subtitulo:'Análisis y Estrategia',
        emoji:    '📘',
        color:    '#00cfff',
        desbloqueado: false,
        requiere: 'Completar Nivel Básico',
        modulos: [
            {
                id:     'inter_m1',
                nombre: 'Análisis Técnico',
                emoji:  '📊',
                lecciones: [
                    { id: 'i1_l1', nombre: 'Tendencias y estructura',      xp: 15, duracion: '12 min', video_id: null },
                    { id: 'i1_l2', nombre: 'Soporte y resistencia',        xp: 15, duracion: '11 min', video_id: null },
                    { id: 'i1_l3', nombre: 'Indicadores principales',      xp: 15, duracion: '14 min', video_id: null },
                    { id: 'i1_l4', nombre: 'RSI, MACD y Medias móviles',   xp: 20, duracion: '15 min', video_id: null }
                ]
            },
            {
                id:     'inter_m2',
                nombre: 'Estrategias de Trading',
                emoji:  '🎯',
                lecciones: [
                    { id: 'i2_l1', nombre: 'Trading en tendencia',         xp: 15, duracion: '12 min', video_id: null },
                    { id: 'i2_l2', nombre: 'Trading en rango',             xp: 15, duracion: '10 min', video_id: null },
                    { id: 'i2_l3', nombre: 'Breakouts y rupturas',         xp: 20, duracion: '13 min', video_id: null },
                    { id: 'i2_l4', nombre: 'Construcción de estrategia',   xp: 25, duracion: '16 min', video_id: null }
                ]
            }
        ]
    },
    avanzado: {
        id:       'avanzado',
        nombre:   'Nivel Avanzado',
        subtitulo:'Trading Profesional',
        emoji:    '📕',
        color:    '#a855f7',
        desbloqueado: false,
        requiere: 'Completar Nivel Intermedio',
        modulos: [
            {
                id:     'avanz_m1',
                nombre: 'Price Action',
                emoji:  '📈',
                lecciones: [
                    { id: 'a1_l1', nombre: 'Estructura de mercado',        xp: 20, duracion: '15 min', video_id: null },
                    { id: 'a1_l2', nombre: 'Order blocks',                 xp: 20, duracion: '14 min', video_id: null },
                    { id: 'a1_l3', nombre: 'Fair Value Gaps',              xp: 20, duracion: '13 min', video_id: null },
                    { id: 'a1_l4', nombre: 'Liquidity hunting',            xp: 25, duracion: '16 min', video_id: null }
                ]
            },
            {
                id:     'avanz_m2',
                nombre: 'Plan de Trading',
                emoji:  '📋',
                lecciones: [
                    { id: 'a2_l1', nombre: 'Crear tu plan de trading',     xp: 20, duracion: '15 min', video_id: null },
                    { id: 'a2_l2', nombre: 'Backtesting de estrategias',   xp: 25, duracion: '18 min', video_id: null },
                    { id: 'a2_l3', nombre: 'Gestión avanzada del riesgo',  xp: 25, duracion: '16 min', video_id: null },
                    { id: 'a2_l4', nombre: 'Trading profesional',          xp: 30, duracion: '20 min', video_id: null }
                ]
            }
        ]
    }
};


/* ================================================================
   04. GUARDAR / CARGAR DATOS
   🔄 NEXT.JS: reemplazar con Supabase calls
================================================================ */
const DB_KEY = 'epc_user';

function cargarPerfil() {
    /* 🔄 NEXT.JS: reemplazar con
       const { data } = await supabase.from('users').select('*').eq('id', userId)
    */
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : null;
}

function guardarPerfil(perfil) {
    /* 🔄 NEXT.JS: reemplazar con
       await supabase.from('users').update(perfil).eq('id', perfil.id)
    */
    localStorage.setItem(DB_KEY, JSON.stringify(perfil));
}

function cargarProgreso() {
    /* 🔄 NEXT.JS: reemplazar con
       const { data } = await supabase.from('progress').select('*').eq('user_id', userId)
    */
    const perfil = cargarPerfil();
    return {
        lecciones_completadas: perfil?.lecciones_completadas || [],
        modulos_completados:   perfil?.modulos_completados   || [],
        nivel_completado:      perfil?.nivel_completado      || null
    };
}


/* ================================================================
   05. SISTEMA DE XP
================================================================ */
function calcularNivel(xp_total) {
    const niveles = [...XP_CONFIG.niveles].reverse();
    for (const n of niveles) {
        if (xp_total >= n.xp) return n;
    }
    return XP_CONFIG.niveles[0];
}

function calcularProgresoNivel(xp_total) {
    const nivelActual   = calcularNivel(xp_total);
    const indexActual   = XP_CONFIG.niveles.findIndex(n => n.nivel === nivelActual.nivel);
    const nivelSiguiente= XP_CONFIG.niveles[indexActual + 1];

    if (!nivelSiguiente) return { pct: 100, xp_falta: 0, xp_siguiente: nivelActual.xp };

    const xp_en_nivel    = xp_total - nivelActual.xp;
    const xp_para_subir  = nivelSiguiente.xp - nivelActual.xp;
    const pct            = Math.min(Math.floor((xp_en_nivel / xp_para_subir) * 100), 100);

    return {
        pct,
        xp_falta:      nivelSiguiente.xp - xp_total,
        xp_siguiente:  nivelSiguiente.xp,
        nombre_siguiente: nivelSiguiente.nombre
    };
}

function ganarXP(accion) {
    const perfil = cargarPerfil();
    if (!perfil) return;

    const cantidad = XP_CONFIG.acciones[accion] || 0;
    if (cantidad === 0) return;

    perfil.xp     = (perfil.xp || 0) + cantidad;
    perfil.nivel  = calcularNivel(perfil.xp).nivel;

    /* Actualizar evolución del Zenix según nivel */
    const evol = XP_CONFIG.evolucion_zenix;
    if (perfil.nivel >= evol.maestro[0])       perfil.zenix_activo.evolucion = 'maestro';
    else if (perfil.nivel >= evol.avanzado[0]) perfil.zenix_activo.evolucion = 'avanzado';
    else if (perfil.nivel >= evol.mejorado[0]) perfil.zenix_activo.evolucion = 'mejorado';
    else                                        perfil.zenix_activo.evolucion = 'base';

    guardarPerfil(perfil);
    verificarLogros(perfil);
    return cantidad;
}


/* ================================================================
   06. SISTEMA DE LOGROS
================================================================ */
function verificarLogros(perfil) {
    const logros_actuales = perfil.logros || [];
    let actualizado = false;

    LOGROS_CONFIG.forEach(logro => {
        const yaDesbloqueado = logros_actuales.find(l => l.id === logro.id);
        if (!yaDesbloqueado && logro.condicion(perfil)) {
            logros_actuales.push({
                id:     logro.id,
                fecha:  new Date().toISOString()
            });
            perfil.xp += logro.xp;
            actualizado = true;
            mostrarNotificacionLogro(logro);
        }
    });

    if (actualizado) {
        perfil.logros = logros_actuales;
        guardarPerfil(perfil);
    }
}

function mostrarNotificacionLogro(logro) {
    const notif = document.createElement('div');
    notif.className = 'logro-notif';
    notif.innerHTML = `
        <div class="logro-notif-inner">
            <span class="logro-notif-emoji">${logro.emoji}</span>
            <div>
                <strong>¡Logro desbloqueado!</strong>
                <span>${logro.nombre}</span>
                <span class="logro-notif-xp">+${logro.xp} XP</span>
            </div>
        </div>
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 100);
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => document.body.removeChild(notif), 400);
    }, 3500);
}


/* ================================================================
   07. SISTEMA DE PROGRESO
================================================================ */
function completarLeccion(leccion_id, xp) {
    /* 🔄 NEXT.JS: reemplazar con
       await supabase.from('progress').upsert({ user_id, leccion_id, completada: true })
    */
    const perfil = cargarPerfil();
    if (!perfil) return;

    if (!perfil.lecciones_completadas) perfil.lecciones_completadas = [];

    if (!perfil.lecciones_completadas.includes(leccion_id)) {
        perfil.lecciones_completadas.push(leccion_id);
        guardarPerfil(perfil);
        ganarXP('leccion_completada');
        verificarLogros(perfil);
    }
}

function getLeccionesCompletadas() {
    const perfil = cargarPerfil();
    return perfil?.lecciones_completadas || [];
}

function getProgresoRuta(nivel_id) {
    const config = RUTAS_CONFIG[nivel_id];
    if (!config) return { total: 0, completadas: 0, pct: 0 };

    const completadas_ids = getLeccionesCompletadas();
    let total = 0;
    let completadas = 0;

    config.modulos.forEach(modulo => {
        modulo.lecciones.forEach(leccion => {
            total++;
            if (completadas_ids.includes(leccion.id)) completadas++;
        });
    });

    return {
        total,
        completadas,
        pct: total > 0 ? Math.floor((completadas / total) * 100) : 0
    };
}

function getProgresoTotal() {
    const basico      = getProgresoRuta('basico');
    const intermedio  = getProgresoRuta('intermedio');
    const avanzado    = getProgresoRuta('avanzado');

    const total       = basico.total + intermedio.total + avanzado.total;
    const completadas = basico.completadas + intermedio.completadas + avanzado.completadas;

    return {
        total,
        completadas,
        pct: total > 0 ? Math.floor((completadas / total) * 100) : 0,
        basico,
        intermedio,
        avanzado
    };
}

function getProximaLeccion() {
    const completadas = getLeccionesCompletadas();

    for (const nivel_id of ['basico', 'intermedio', 'avanzado']) {
        const nivel = RUTAS_CONFIG[nivel_id];
        if (!nivel.desbloqueado && nivel_id !== 'basico') continue;

        for (const modulo of nivel.modulos) {
            for (const leccion of modulo.lecciones) {
                if (!completadas.includes(leccion.id)) {
                    return { leccion, modulo, nivel };
                }
            }
        }
    }
    return null;
}


/* ================================================================
   08. PROTECCIÓN DE RUTAS PRIVADAS
================================================================ */
function protegerRuta() {
    const perfil = cargarPerfil();
    if (!perfil) {
        /* Guarda la URL actual para redirigir después del login */
        sessionStorage.setItem('epc_redirect', window.location.href);
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

function verificarYRedirigir() {
    const redirect = sessionStorage.getItem('epc_redirect');
    if (redirect) {
        sessionStorage.removeItem('epc_redirect');
        window.location.href = redirect;
    }
}


/* ================================================================
   09. RENDER DEL DASHBOARD
================================================================ */
function renderDashboard() {
    if (!protegerRuta()) return;

    const perfil    = cargarPerfil();
    const zenix     = perfil.zenix_activo;
    const nivelInfo = calcularNivel(perfil.xp || 0);
    const progNivel = calcularProgresoNivel(perfil.xp || 0);
    const progTotal = getProgresoTotal();
    const proxLec   = getProximaLeccion();

    /* Bienvenida */
    el('dash-nombre',      perfil.nombre.split(' ')[0]);
    el('dash-nivel',       'Nivel ' + nivelInfo.nivel + ' — ' + nivelInfo.nombre);
    el('dash-xp',          (perfil.xp || 0) + ' XP');
    el('dash-lecciones',   (perfil.lecciones_completadas || []).length);
    el('dash-racha',       (perfil.racha_actual || 0) + ' días');

    /* Mi Zenix en dashboard */
    setImg('dash-zenix-img', zenix.imagen);
    el('dash-zenix-nombre',  zenix.nombre);
    setStyle('dash-zenix-rareza', zenix, 'dash');
    el('dash-zenix-nivel',   'Nivel ' + nivelInfo.nivel);

    /* Barra XP */
    const xpBar = document.getElementById('dash-xp-bar');
    if (xpBar) {
        setTimeout(() => { xpBar.style.width = progNivel.pct + '%'; }, 300);
    }
    el('dash-xp-label', (perfil.xp || 0) + ' / ' + progNivel.xp_siguiente + ' XP');

    /* Progreso general */
    el('dash-prog-pct',   progTotal.pct + '%');
    el('dash-prog-texto', progTotal.completadas + ' de ' + progTotal.total + ' lecciones');
    const progBar = document.getElementById('dash-prog-bar');
    if (progBar) setTimeout(() => { progBar.style.width = progTotal.pct + '%'; }, 300);

    /* Próxima lección */
    if (proxLec) {
        el('dash-prox-leccion', proxLec.leccion.nombre);
        el('dash-prox-modulo',  proxLec.modulo.nombre);
        el('dash-prox-nivel',   proxLec.nivel.nombre);
        el('dash-prox-duracion', proxLec.leccion.duracion);
    } else {
        el('dash-prox-leccion', '¡Todas las lecciones completadas!');
    }

    /* Logros recientes */
    renderLogrosRecientes(perfil);

    /* Frase del día de Zenix */
    renderFraseZenix();
}


/* ================================================================
   10. RENDER DE RUTAS DE APRENDIZAJE
================================================================ */
function renderRutas() {
    if (!protegerRuta()) return;

    const completadas = getLeccionesCompletadas();

    Object.values(RUTAS_CONFIG).forEach(nivel => {
        const contenedor = document.getElementById('nivel-' + nivel.id);
        if (!contenedor) return;

        const progreso = getProgresoRuta(nivel.id);

        /* Actualizar barra de progreso del nivel */
        const barEl = document.getElementById('prog-' + nivel.id);
        if (barEl) setTimeout(() => { barEl.style.width = progreso.pct + '%'; }, 400);
        el('prog-' + nivel.id + '-label', progreso.completadas + '/' + progreso.total);

        if (!nivel.desbloqueado) return;

        nivel.modulos.forEach(modulo => {
            const moduloEl = document.getElementById('modulo-' + modulo.id);
            if (!moduloEl) return;

            let completadasModulo = 0;
            modulo.lecciones.forEach(leccion => {
                const lecEl = document.getElementById('lec-' + leccion.id);
                if (lecEl) {
                    const isDone = completadas.includes(leccion.id);
                    if (isDone) {
                        lecEl.classList.add('leccion-done');
                        completadasModulo++;
                    }
                }
            });

            /* Badge del módulo */
            const badgeModulo = document.getElementById('badge-' + modulo.id);
            if (badgeModulo) {
                const pctModulo = Math.floor((completadasModulo / modulo.lecciones.length) * 100);
                badgeModulo.textContent = pctModulo + '%';
            }
        });
    });
}


/* ================================================================
   11. RENDER DE LOGROS
================================================================ */
function renderLogros() {
    if (!protegerRuta()) return;

    const perfil          = cargarPerfil();
    const logros_usuario  = perfil.logros || [];
    const nivelInfo       = calcularNivel(perfil.xp || 0);
    const progNivel       = calcularProgresoNivel(perfil.xp || 0);

    el('logros-xp-total', (perfil.xp || 0) + ' XP');
    el('logros-nivel',    'Nivel ' + nivelInfo.nivel + ' — ' + nivelInfo.nombre);
    el('logros-racha',    (perfil.racha_actual || 0) + ' días');

    const xpBar = document.getElementById('logros-xp-bar');
    if (xpBar) setTimeout(() => { xpBar.style.width = progNivel.pct + '%'; }, 300);

    const grid = document.getElementById('logros-grid');
    if (!grid) return;

    grid.innerHTML = '';

    LOGROS_CONFIG.forEach(logro => {
        const desbloqueado = logros_usuario.find(l => l.id === logro.id);
        const fecha = desbloqueado
            ? new Date(desbloqueado.fecha).toLocaleDateString('es-ES')
            : null;

        const card = document.createElement('div');
        card.className = 'logro-card' + (desbloqueado ? ' logro-activo' : ' logro-bloqueado');
        card.innerHTML = `
            <div class="logro-emoji">${desbloqueado ? logro.emoji : '🔒'}</div>
            <div class="logro-info">
                <h4>${logro.nombre}</h4>
                <p>${logro.descripcion}</p>
                <span class="logro-xp">+${logro.xp} XP</span>
                ${fecha ? `<span class="logro-fecha">${fecha}</span>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}


/* ================================================================
   12. RENDER DE RECURSOS
================================================================ */
function renderRecursos() {
    if (!protegerRuta()) return;

    /* 🔮 PREPARADO: en el futuro los recursos vendrán de Supabase */
    const perfil = cargarPerfil();

    /* Registrar XP si es primera visita a recursos */
    const recursos_visitados = perfil.recursos_visitados || [];
    if (!recursos_visitados.includes('primera_visita')) {
        recursos_visitados.push('primera_visita');
        perfil.recursos_visitados = recursos_visitados;
        guardarPerfil(perfil);
    }
}

function registrarDescargaRecurso(recurso_id) {
    ganarXP('recurso_descargado');
    const perfil = cargarPerfil();
    if (!perfil) return;

    if (!perfil.recursos_descargados) perfil.recursos_descargados = [];
    if (!perfil.recursos_descargados.includes(recurso_id)) {
        perfil.recursos_descargados.push(recurso_id);
        guardarPerfil(perfil);
    }
}


/* ================================================================
   13. UTILIDADES
================================================================ */

/* Frases motivacionales de Zenix */
const FRASES_ZENIX = [
    "El sistema no te enseñó esto por algo.",
    "La información es el mejor activo.",
    "Mientras dormían, el bot operaba.",
    "No pidas permiso para ser libre.",
    "Cada lección es un paso más hacia la libertad financiera.",
    "El trader exitoso no adivina — gestiona el riesgo.",
    "Consistencia > perfección. Actúa hoy.",
    "Tu Zenix evoluciona cuando tú evolucionas.",
    "El mercado premia la paciencia y la disciplina.",
    "Aprende hoy lo que el sistema nunca te enseñó."
];

function renderFraseZenix() {
    const el_frase = document.getElementById('zenix-frase');
    if (!el_frase) return;
    const idx = new Date().getDate() % FRASES_ZENIX.length;
    el_frase.textContent = '"' + FRASES_ZENIX[idx] + '"';
}

function renderLogrosRecientes(perfil) {
    const contenedor = document.getElementById('logros-recientes');
    if (!contenedor) return;

    const logros_usuario = (perfil.logros || []).slice(-3).reverse();
    contenedor.innerHTML = '';

    if (logros_usuario.length === 0) {
        contenedor.innerHTML = '<p class="no-logros">Completa tu primera lección para ganar logros</p>';
        return;
    }

    logros_usuario.forEach(lu => {
        const config = LOGROS_CONFIG.find(l => l.id === lu.id);
        if (!config) return;
        const div = document.createElement('div');
        div.className = 'logro-mini';
        div.innerHTML = `
            <span class="logro-mini-emoji">${config.emoji}</span>
            <span class="logro-mini-nombre">${config.nombre}</span>
        `;
        contenedor.appendChild(div);
    });
}

/* Helper para setText */
function el(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}

/* Helper para setSrc */
function setImg(id, src) {
    const element = document.getElementById(id);
    if (element) element.src = src;
}

/* Helper para estilos de rareza */
function setStyle(id, zenix, prefix) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent    = zenix.rareza_emoji + ' ' + zenix.rareza;
    element.style.color    = zenix.rareza_color;
    element.style.borderColor = zenix.rareza_color + '50';
    element.style.background  = zenix.rareza_color + '15';
}

/* Logout */
function cerrarSesion() {
    localStorage.removeItem('epc_user');
    window.location.href = '../index.html';
}

/* Exportar */
window.DashboardSystem = {
    XP_CONFIG,
    RUTAS_CONFIG,
    LOGROS_CONFIG,
    cargarPerfil,
    guardarPerfil,
    ganarXP,
    completarLeccion,
    calcularNivel,
    calcularProgresoNivel,
    getProgresoTotal,
    getProgresoRuta,
    getProximaLeccion,
    getLeccionesCompletadas,
    verificarLogros,
    protegerRuta,
    renderDashboard,
    renderRutas,
    renderLogros,
    renderRecursos,
    cerrarSesion,
    FRASES_ZENIX
};