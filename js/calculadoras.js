/* ================================================================
   CALCULADORAS.JS — Eprocash Academy v3.0
   Centro de Herramientas

   ARQUITECTURA MODULAR:
   1. CalculadorasCore  → funciones puras (input → output, sin DOM)
                          reutilizables en cualquier página futura.
   2. UI Controllers    → conectan el HTML (inputs/botones) con
                          CalculadorasCore. Un controller por calculadora.
   3. Tabs + Formula toggle → utilidades de interfaz compartidas.
================================================================ */

'use strict';

/* ================================================================
   1. CalculadorasCore — FUNCIONES PURAS
   Ninguna de estas funciones toca el DOM. Reciben números,
   devuelven números (o null si los datos son inválidos).
================================================================ */
const CalculadorasCore = (() => {

  /**
   * Riesgo de cuenta en dinero.
   * Fórmula: riesgo_USD = balance × (porcentaje / 100)
   */
  function riesgoCuenta(balance, porcentaje) {
    if (!isFinite(balance) || !isFinite(porcentaje)) return null;
    if (balance <= 0 || porcentaje <= 0) return null;
    return balance * (porcentaje / 100);
  }

  /**
   * Tamaño de lote para Forex.
   * Fórmula: lotaje = riesgo_USD / (stopLossPips × valorPipPorLote)
   * valorPipPorLote: valor en USD de 1 pip para 1 lote estándar
   * (ej. ~10 USD/pip para la mayoría de pares con USD como cotizada)
   */
  function lotajeForex(balance, porcentaje, stopLossPips, valorPipPorLote) {
    const riesgoUSD = riesgoCuenta(balance, porcentaje);
    if (riesgoUSD === null) return null;
    if (!isFinite(stopLossPips) || !isFinite(valorPipPorLote)) return null;
    if (stopLossPips <= 0 || valorPipPorLote <= 0) return null;

    const lotaje = riesgoUSD / (stopLossPips * valorPipPorLote);
    return { riesgoUSD, lotaje };
  }

  /**
   * Ratio Riesgo:Beneficio.
   * Fórmula: R:R = (takeProfit − entrada) / (entrada − stopLoss)   [posición larga]
   *          R:R = (entrada − takeProfit) / (stopLoss − entrada)   [posición corta]
   */
  function riesgoBeneficio(entrada, stopLoss, takeProfit, esLarga = true) {
    if (![entrada, stopLoss, takeProfit].every(isFinite)) return null;
    if (entrada <= 0 || stopLoss <= 0 || takeProfit <= 0) return null;

    let riesgo, beneficio;
    if (esLarga) {
      riesgo = entrada - stopLoss;
      beneficio = takeProfit - entrada;
    } else {
      riesgo = stopLoss - entrada;
      beneficio = entrada - takeProfit;
    }

    if (riesgo <= 0) return null; // stop mal ubicado respecto a la entrada
    const ratio = beneficio / riesgo;
    return { riesgo, beneficio, ratio };
  }

  /**
   * Tamaño de posición (cripto / acciones / CFDs).
   * Fórmula: tamaño_unidades = riesgo_USD / |entrada − stopLoss|
   * valorPosicion_USD = tamaño_unidades × entrada
   */
  function tamañoPosicion(balance, porcentaje, entrada, stopLoss) {
    const riesgoUSD = riesgoCuenta(balance, porcentaje);
    if (riesgoUSD === null) return null;
    if (!isFinite(entrada) || !isFinite(stopLoss)) return null;
    if (entrada <= 0 || stopLoss <= 0 || entrada === stopLoss) return null;

    const distancia = Math.abs(entrada - stopLoss);
    const unidades = riesgoUSD / distancia;
    const valorPosicionUSD = unidades * entrada;

    return { riesgoUSD, unidades, valorPosicionUSD, distancia };
  }

  return { riesgoCuenta, lotajeForex, riesgoBeneficio, tamañoPosicion };
})();

/* ================================================================
   2. UI CONTROLLERS — conectan formularios con CalculadorasCore
================================================================ */

function fmtUSD(n) {
  return '$' + n.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtNum(n, decimals = 2) {
  return n.toLocaleString('es', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/* ── Controller: Riesgo de cuenta ── */
function initCalcRiesgoCuenta() {
  const form = document.getElementById('form-riesgo-cuenta');
  if (!form) return;

  const balanceInput = document.getElementById('rc-balance');
  const pctInput = document.getElementById('rc-porcentaje');
  const resultEl = document.getElementById('rc-resultado');
  const emptyEl = document.getElementById('rc-vacio');

  function calcular() {
    const balance = parseFloat(balanceInput.value);
    const pct = parseFloat(pctInput.value);
    const resultado = CalculadorasCore.riesgoCuenta(balance, pct);

    if (resultado === null) {
      resultEl.style.display = 'none';
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';
    resultEl.style.display = 'flex';
    document.getElementById('rc-riesgo-usd').textContent = fmtUSD(resultado);
    document.getElementById('rc-balance-restante').textContent = fmtUSD(balance - resultado);
  }

  [balanceInput, pctInput].forEach(el => el.addEventListener('input', calcular));
  calcular();
}

/* ── Controller: Lotaje Forex ── */
function initCalcLotaje() {
  const form = document.getElementById('form-lotaje');
  if (!form) return;

  const balanceInput = document.getElementById('lt-balance');
  const pctInput = document.getElementById('lt-porcentaje');
  const slInput = document.getElementById('lt-sl-pips');
  const valorPipInput = document.getElementById('lt-valor-pip');
  const resultEl = document.getElementById('lt-resultado');
  const emptyEl = document.getElementById('lt-vacio');

  function calcular() {
    const balance = parseFloat(balanceInput.value);
    const pct = parseFloat(pctInput.value);
    const slPips = parseFloat(slInput.value);
    const valorPip = parseFloat(valorPipInput.value);

    const resultado = CalculadorasCore.lotajeForex(balance, pct, slPips, valorPip);

    if (resultado === null) {
      resultEl.style.display = 'none';
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';
    resultEl.style.display = 'flex';
    document.getElementById('lt-riesgo-usd').textContent = fmtUSD(resultado.riesgoUSD);
    document.getElementById('lt-lotaje').textContent = fmtNum(resultado.lotaje, 2) + ' lotes';
  }

  [balanceInput, pctInput, slInput, valorPipInput].forEach(el => el.addEventListener('input', calcular));
  calcular();
}

/* ── Controller: Riesgo-Beneficio ── */
function initCalcRiesgoBeneficio() {
  const form = document.getElementById('form-riesgo-beneficio');
  if (!form) return;

  const entradaInput = document.getElementById('rb-entrada');
  const slInput = document.getElementById('rb-stop-loss');
  const tpInput = document.getElementById('rb-take-profit');
  const direccionInputs = document.querySelectorAll('input[name="rb-direccion"]');
  const resultEl = document.getElementById('rb-resultado');
  const emptyEl = document.getElementById('rb-vacio');
  const warningEl = document.getElementById('rb-warning');

  function getDireccion() {
    const checked = document.querySelector('input[name="rb-direccion"]:checked');
    return checked ? checked.value === 'larga' : true;
  }

  function calcular() {
    const entrada = parseFloat(entradaInput.value);
    const sl = parseFloat(slInput.value);
    const tp = parseFloat(tpInput.value);
    const esLarga = getDireccion();

    const resultado = CalculadorasCore.riesgoBeneficio(entrada, sl, tp, esLarga);

    if (resultado === null) {
      resultEl.style.display = 'none';
      emptyEl.style.display = entrada || sl || tp ? 'none' : 'block';
      warningEl.style.display = (entrada || sl || tp) ? 'block' : 'none';
      return;
    }
    emptyEl.style.display = 'none';
    warningEl.style.display = 'none';
    resultEl.style.display = 'flex';
    document.getElementById('rb-ratio').textContent = '1 : ' + fmtNum(resultado.ratio, 2);
    document.getElementById('rb-riesgo-puntos').textContent = fmtNum(resultado.riesgo, 4);
    document.getElementById('rb-beneficio-puntos').textContent = fmtNum(resultado.beneficio, 4);

    const ratioEl = document.getElementById('rb-ratio');
    ratioEl.style.color = resultado.ratio >= 2 ? 'var(--herr-green)' : (resultado.ratio >= 1 ? 'var(--herr-cyan)' : 'var(--herr-red)');
  }

  [entradaInput, slInput, tpInput].forEach(el => el.addEventListener('input', calcular));
  direccionInputs.forEach(el => el.addEventListener('change', calcular));
  calcular();
}

/* ── Controller: Tamaño de posición ── */
function initCalcTamañoPosicion() {
  const form = document.getElementById('form-tamano-posicion');
  if (!form) return;

  const balanceInput = document.getElementById('tp-balance');
  const pctInput = document.getElementById('tp-porcentaje');
  const entradaInput = document.getElementById('tp-entrada');
  const slInput = document.getElementById('tp-stop-loss');
  const resultEl = document.getElementById('tp-resultado');
  const emptyEl = document.getElementById('tp-vacio');

  function calcular() {
    const balance = parseFloat(balanceInput.value);
    const pct = parseFloat(pctInput.value);
    const entrada = parseFloat(entradaInput.value);
    const sl = parseFloat(slInput.value);

    const resultado = CalculadorasCore.tamañoPosicion(balance, pct, entrada, sl);

    if (resultado === null) {
      resultEl.style.display = 'none';
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';
    resultEl.style.display = 'flex';
    document.getElementById('tp-riesgo-usd').textContent = fmtUSD(resultado.riesgoUSD);
    document.getElementById('tp-unidades').textContent = fmtNum(resultado.unidades, 6);
    document.getElementById('tp-valor-posicion').textContent = fmtUSD(resultado.valorPosicionUSD);
  }

  [balanceInput, pctInput, entradaInput, slInput].forEach(el => el.addEventListener('input', calcular));
  calcular();
}

/* ================================================================
   3. UTILIDADES DE INTERFAZ — Tabs + Formula toggle
================================================================ */
function initHerrTabs() {
  const tabs = document.querySelectorAll('.herr-tab');
  const panels = document.querySelectorAll('.herr-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-herr-tab');

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.querySelector(`[data-herr-panel="${target}"]`);
      if (panel) panel.classList.add('active');
    });
  });
}

function initFormulaToggles() {
  document.querySelectorAll('.herr-formula-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-formula-target');
      const content = document.getElementById(targetId);
      if (!content) return;
      const isOpen = content.classList.toggle('open');
      const icon = btn.querySelector('i');
      if (icon) icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  });
}

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initHerrTabs();
  initFormulaToggles();
  initCalcRiesgoCuenta();
  initCalcLotaje();
  initCalcRiesgoBeneficio();
  initCalcTamañoPosicion();
});