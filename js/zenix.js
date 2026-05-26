/* ================================================================
   EPROCASH ACADEMY — js/zenix.js
   Sistema de identidad digital coleccionable Zenix
   Módulos:
   01. Catálogo de Zenix con rarezas y metadata
   02. Sistema de asignación aleatoria por probabilidad
   03. Gestión de perfil en localStorage
   04. Animación de revelación al registrarse
   05. Render del perfil en perfil.html
================================================================ */

'use strict';


/* ================================================================
   01. CATÁLOGO COMPLETO DE ZENIX
   Cada Zenix tiene: id, nombre, imagen, rareza, personalidad,
   habilidad especial, descripción y color de rareza
================================================================ */
const ZENIX_CATALOG = [

    /* ── COMÚN (50% de probabilidad) ── */
    {
        id: 'zenix_original',
        nombre: 'Zenix Original',
        imagen: 'images/zenix_original.png',
        rareza: 'Común',
        rareza_id: 'comun',
        rareza_color: '#94a3b8',
        rareza_emoji: '⚪',
        personalidad: 'Clásico y confiable',
        habilidad: 'Visión Clara',
        descripcion: 'El Zenix original. El primero de todos. Representa los fundamentos del conocimiento financiero.',
        lore: 'Antes de que existiera cualquier otro Zenix, estaba él. El guardián del conocimiento original.'
    },
    {
        id: 'zenix_saludando',
        nombre: 'Zenix Embajador',
        imagen: 'images/zenix_saludando.png',
        rareza: 'Común',
        rareza_id: 'comun',
        rareza_color: '#94a3b8',
        rareza_emoji: '⚪',
        personalidad: 'Amigable y sociable',
        habilidad: 'Conexión Social',
        descripcion: 'Siempre listo para dar la bienvenida. El Zenix que conecta a toda la comunidad.',
        lore: 'Zenix Embajador fue el primero en abrir las puertas de Eprocash Academy al mundo.'
    },

    /* ── POCO COMÚN (25% de probabilidad) ── */
    {
        id: 'zenix_estudiante',
        nombre: 'Zenix Estudiante',
        imagen: 'images/zenix_estudiante.png',
        rareza: 'Poco común',
        rareza_id: 'poco_comun',
        rareza_color: '#00cfff',
        rareza_emoji: '🔵',
        personalidad: 'Curioso y dedicado',
        habilidad: 'Aprendizaje Acelerado',
        descripcion: 'Siempre con los libros en mano. Domina los conceptos más complejos de trading y finanzas.',
        lore: 'Zenix Estudiante dedicó miles de horas a estudiar los mercados. Su conocimiento no tiene límites.'
    },
    {
        id: 'zenix_guiño',
        nombre: 'Zenix Astuto',
        imagen: 'images/zenix_guiño.png',
        rareza: 'Poco común',
        rareza_id: 'poco_comun',
        rareza_color: '#00cfff',
        rareza_emoji: '🔵',
        personalidad: 'Inteligente y pícaro',
        habilidad: 'Intuición de Mercado',
        descripcion: 'Siempre un paso adelante. Lee el mercado como nadie y sabe cuándo actuar.',
        lore: 'Zenix Astuto nunca revela todos sus secretos. Pero cuando guiña el ojo, algo grande está por pasar.'
    },

    /* ── RARO (15% de probabilidad) ── */
    {
        id: 'zenix_bitcoin',
        nombre: 'Zenix Bitcoin',
        imagen: 'images/zenix_bitcoin.png',
        rareza: 'Raro',
        rareza_id: 'raro',
        rareza_color: '#a855f7',
        rareza_emoji: '🟣',
        personalidad: 'Visionario y audaz',
        habilidad: 'Dominio Cripto',
        descripcion: 'El maestro de las criptomonedas. Sostiene Bitcoin como símbolo del futuro financiero.',
        lore: 'Zenix Bitcoin fue el primero en entender el poder de la descentralización. Sostiene el futuro en su mano.'
    },
    {
        id: 'zenix_ejecutivo',
        nombre: 'Zenix Ejecutivo',
        imagen: 'images/zenix_ejecutivo.png',
        rareza: 'Raro',
        rareza_id: 'raro',
        rareza_color: '#a855f7',
        rareza_emoji: '🟣',
        personalidad: 'Estratégico y poderoso',
        habilidad: 'Visión Empresarial',
        descripcion: 'El Zenix de los negocios. Domina estrategias de inversión y gestión de capital.',
        lore: 'Zenix Ejecutivo construyó su fortuna con disciplina y estrategia. Cada decisión es calculada.'
    },

    /* ── ÉPICO (8% de probabilidad) ── */
    {
        id: 'zenix_hero',
        nombre: 'Zenix Hero',
        imagen: 'images/Zenix_hero.png',
        rareza: 'Épico',
        rareza_id: 'epico',
        rareza_color: '#f59e0b',
        rareza_emoji: '🟡',
        personalidad: 'Legendario y carismático',
        habilidad: 'Liderazgo Total',
        descripcion: 'El Zenix más reconocido. Símbolo de la academia y guía de toda la comunidad.',
        lore: 'Zenix Hero no nació siendo un héroe. Se convirtió en uno cuando decidió compartir su conocimiento con el mundo.'
    },
    {
        id: 'zenix_hippie',
        nombre: 'Zenix Libre',
        imagen: 'images/zenix_hippie.png',
        rareza: 'Épico',
        rareza_id: 'epico',
        rareza_color: '#f59e0b',
        rareza_emoji: '🟡',
        personalidad: 'Libre e independiente',
        habilidad: 'Libertad Financiera',
        descripcion: 'El Zenix que rompió todas las cadenas del sistema financiero tradicional.',
        lore: 'Zenix Libre descubrió que la verdadera riqueza no es el dinero, sino la libertad de elegir cómo vivir.'
    }
];

/* Pesos de rareza para asignación aleatoria */
const RAREZA_PESOS = {
    comun:      50,   /* 50% */
    poco_comun: 25,   /* 25% */
    raro:       15,   /* 15% */
    epico:       8,   /* 8%  */
    legendario:  2    /* 2% — reservado para futuras variantes */
};


/* ================================================================
   02. SISTEMA DE ASIGNACIÓN ALEATORIA POR PROBABILIDAD
================================================================ */

/* Selecciona rareza según pesos */
function seleccionarRareza() {
    const total = Object.values(RAREZA_PESOS).reduce((a, b) => a + b, 0);
    let random  = Math.random() * total;

    for (const [rareza, peso] of Object.entries(RAREZA_PESOS)) {
        random -= peso;
        if (random <= 0) return rareza;
    }
    return 'comun'; /* fallback */
}

/* Obtiene todos los Zenix de una rareza específica */
function zenixPorRareza(rareza_id) {
    return ZENIX_CATALOG.filter(z => z.rareza_id === rareza_id);
}

/* Asigna un Zenix aleatorio al usuario */
function asignarZenix() {
    let rareza  = seleccionarRareza();
    let opciones = zenixPorRareza(rareza);

    /* Si la rareza no tiene Zenix disponibles, baja a común */
    if (opciones.length === 0) {
        rareza   = 'comun';
        opciones = zenixPorRareza('comun');
    }

    /* Elige uno aleatorio dentro de la rareza */
    const index  = Math.floor(Math.random() * opciones.length);
    return opciones[index];
}


/* ================================================================
   03. GESTIÓN DEL PERFIL EN localStorage
   (Se reemplazará por Supabase en Fase 2)
================================================================ */

const STORAGE_KEY = 'epc_user';

/* Guarda el perfil completo del usuario */
function guardarPerfil(datos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
}

/* Carga el perfil del usuario */
function cargarPerfil() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

/* Crea un perfil nuevo con Zenix asignado */
function crearPerfil(nombre, email) {
    const zenix    = asignarZenix();
    const perfil   = {
        id:           Date.now().toString(),
        nombre:       nombre,
        email:        email,
        fecha_registro: new Date().toISOString(),
        zenix_activo: zenix,
        coleccion:    [zenix],
        xp:           0,
        nivel:        1,
        logros:       []
    };
    guardarPerfil(perfil);
    return perfil;
}

/* Verifica si el usuario ya está registrado */
function usuarioRegistrado() {
    return cargarPerfil() !== null;
}


/* ================================================================
   04. ANIMACIÓN DE REVELACIÓN AL REGISTRARSE
   Se activa en registro.html después del submit del formulario
================================================================ */

function mostrarRevealZenix(zenix, onComplete) {

    /* Crear overlay de revelación */
    const overlay = document.createElement('div');
    overlay.className = 'zenix-reveal-overlay';
    overlay.innerHTML = `
        <div class="zenix-reveal-box">

            <!-- Paso 1: partículas y suspenso -->
            <div class="reveal-step step-1 active">
                <div class="reveal-particles">
                    <span></span><span></span><span></span>
                    <span></span><span></span><span></span>
                </div>
                <div class="reveal-logo">
                    <img src="images/favicon.png" alt="Zenix">
                </div>
                <h2 class="reveal-title">Asignando tu Zenix...</h2>
                <p class="reveal-subtitle">El destino está eligiendo tu identidad digital</p>
                <div class="reveal-bar">
                    <div class="reveal-bar-fill"></div>
                </div>
            </div>

            <!-- Paso 2: revelación del Zenix -->
            <div class="reveal-step step-2">
                <div class="reveal-rarity-badge" style="--rarity-color:${zenix.rareza_color}">
                    ${zenix.rareza_emoji} ${zenix.rareza}
                </div>
                <div class="reveal-zenix-img-wrap">
                    <div class="reveal-glow" style="--rarity-color:${zenix.rareza_color}"></div>
                    <img src="${zenix.imagen}" alt="${zenix.nombre}" class="reveal-zenix-img">
                </div>
                <h2 class="reveal-zenix-name">${zenix.nombre}</h2>
                <p class="reveal-zenix-personalidad">${zenix.personalidad}</p>
                <p class="reveal-zenix-habilidad">
                    <i class="fa-solid fa-bolt"></i> Habilidad: <strong>${zenix.habilidad}</strong>
                </p>
                <p class="reveal-zenix-desc">${zenix.descripcion}</p>
                <button class="reveal-continue primary-btn" id="reveal-continue">
                    Ver mi perfil <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>

        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    /* Animar barra de carga */
    const barFill = overlay.querySelector('.reveal-bar-fill');
    let width = 0;
    const barInterval = setInterval(() => {
        width += 2;
        barFill.style.width = width + '%';
        if (width >= 100) clearInterval(barInterval);
    }, 40);

    /* Después de 2.5s mostrar el Zenix */
    setTimeout(() => {
        const step1 = overlay.querySelector('.step-1');
        const step2 = overlay.querySelector('.step-2');
        step1.classList.remove('active');
        step1.classList.add('exit');
        setTimeout(() => {
            step1.style.display = 'none';
            step2.classList.add('active');
        }, 400);
    }, 2500);

    /* Botón continuar */
    overlay.addEventListener('click', e => {
        if (e.target.id === 'reveal-continue' || e.target.closest('#reveal-continue')) {
            document.body.removeChild(overlay);
            document.body.style.overflow = '';
            if (onComplete) onComplete();
        }
    });
}


/* ================================================================
   05. RENDER DEL PERFIL EN perfil.html
================================================================ */

function renderPerfil() {
    const perfil = cargarPerfil();

    /* Si no hay perfil redirige al registro */
    if (!perfil) {
        window.location.href = 'registro.html';
        return;
    }

    const zenix = perfil.zenix_activo;

    /* Nombre de usuario */
    const elNombre = document.getElementById('perfil-nombre');
    if (elNombre) elNombre.textContent = perfil.nombre;

    /* Email */
    const elEmail = document.getElementById('perfil-email');
    if (elEmail) elEmail.textContent = perfil.email;

    /* Fecha de registro */
    const elFecha = document.getElementById('perfil-fecha');
    if (elFecha) {
        const fecha = new Date(perfil.fecha_registro);
        elFecha.textContent = fecha.toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    /* Imagen del Zenix */
    const elImg = document.getElementById('perfil-zenix-img');
    if (elImg) elImg.src = zenix.imagen;

    /* Nombre del Zenix */
    const elZenixNombre = document.getElementById('perfil-zenix-nombre');
    if (elZenixNombre) elZenixNombre.textContent = zenix.nombre;

    /* Rareza */
    const elRareza = document.getElementById('perfil-rareza');
    if (elRareza) {
        elRareza.textContent  = zenix.rareza_emoji + ' ' + zenix.rareza;
        elRareza.style.color  = zenix.rareza_color;
        elRareza.style.borderColor = zenix.rareza_color + '50';
        elRareza.style.background  = zenix.rareza_color + '15';
    }

    /* Personalidad */
    const elPersonalidad = document.getElementById('perfil-personalidad');
    if (elPersonalidad) elPersonalidad.textContent = zenix.personalidad;

    /* Habilidad */
    const elHabilidad = document.getElementById('perfil-habilidad');
    if (elHabilidad) elHabilidad.textContent = zenix.habilidad;

    /* Descripción */
    const elDesc = document.getElementById('perfil-desc');
    if (elDesc) elDesc.textContent = zenix.descripcion;

    /* Lore */
    const elLore = document.getElementById('perfil-lore');
    if (elLore) elLore.textContent = zenix.lore;

    /* Glow color según rareza */
    const elGlow = document.getElementById('perfil-zenix-glow');
    if (elGlow) elGlow.style.background =
        `radial-gradient(circle, ${zenix.rareza_color}30 0%, transparent 70%)`;

    /* XP y nivel */
    const elXP    = document.getElementById('perfil-xp');
    const elNivel = document.getElementById('perfil-nivel');
    if (elXP)    elXP.textContent    = perfil.xp + ' XP';
    if (elNivel) elNivel.textContent = 'Nivel ' + perfil.nivel;

    /* Colección — cuántos Zenix tiene */
    const elColeccion = document.getElementById('perfil-coleccion-count');
    if (elColeccion) elColeccion.textContent = perfil.coleccion.length;

    /* Render colección completa */
    const elColGrid = document.getElementById('perfil-coleccion-grid');
    if (elColGrid) {
        elColGrid.innerHTML = '';
        perfil.coleccion.forEach(z => {
            const item = document.createElement('div');
            item.className = 'col-item' + (z.id === zenix.id ? ' col-item-active' : '');
            item.style.setProperty('--rarity-color', z.rareza_color);
            item.innerHTML = `
                <img src="${z.imagen}" alt="${z.nombre}">
                <span class="col-item-name">${z.nombre}</span>
                <span class="col-item-rarity" style="color:${z.rareza_color}">${z.rareza_emoji} ${z.rareza}</span>
            `;
            elColGrid.appendChild(item);
        });
    }
}


/* ================================================================
   EXPORTAR funciones para uso en otros archivos
================================================================ */
window.ZenixSystem = {
    catalog:          ZENIX_CATALOG,
    asignar:          asignarZenix,
    crearPerfil:      crearPerfil,
    cargarPerfil:     cargarPerfil,
    guardarPerfil:    guardarPerfil,
    usuarioRegistrado:usuarioRegistrado,
    mostrarReveal:    mostrarRevealZenix,
    renderPerfil:     renderPerfil
};