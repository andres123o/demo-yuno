// Prototipo de preventa. Solo front-end: respuestas y prospectos simulados,
// pero cada fuente enlaza a una página real de la documentación pública de Yuno.

const D = "https://docs.y.uno/docs/";
const TRUST = { label: "y.uno/trust-and-security", url: "https://www.y.uno/trust-and-security" };
const doc = path => ({ label: "docs.y.uno/" + path.split("/").pop(), url: D + path });
const $ = id => document.getElementById(id);
const wait = ms => new Promise(r => setTimeout(r, ms));

const QUESTIONS = [
  { sec: "Seguridad", q: "¿Yuno cumple PCI DSS? ¿En qué nivel?", c: "high",
    a: "Sí. Yuno es proveedor <b>PCI DSS Nivel 1</b> (v4.0). El certificado de cumplimiento se comparte desde el Trust Center.",
    s: [doc("security-and-compliance/pci-compliance"), TRUST] },
  { sec: "Seguridad", q: "¿Tienen SOC 2 Tipo II e ISO 27001?", c: "high",
    a: "Sí: <b>SOC 2 Tipo 2, ISO 27001 e ISO 27701</b>, con reportes disponibles a solicitud.",
    s: [TRUST] },
  { sec: "Seguridad", q: "¿Nuestros servidores tocarán datos de tarjeta?", c: "high",
    a: "No, con los SDK de Yuno: los datos van directo a Yuno y ustedes solo reciben tokens. La mayoría califica para <b>SAQ A (22 preguntas) en vez de SAQ D (329)</b>.",
    s: [doc("security-and-compliance/pci-compliance"), doc("basic-concepts/tokens")] },
  { sec: "Seguridad", q: "¿Soportan 3D Secure 2? ¿Con qué redes?", c: "high",
    a: "Sí, <b>3DS2</b> con Visa, Mastercard, Amex, JCB, Diners, UnionPay y Cartes Bancaires. Hay SDK nativos de 3DS para iOS y Android.",
    s: [doc("security-and-compliance/3d-secure"), doc("payment-features/3ds-standalone")] },
  { sec: "Seguridad", q: "¿Cada cuánto hacen pruebas de penetración?", c: "review",
    a: "Sin fuente pública. Estos reportes suelen compartirse bajo NDA.", owner: "Pasa al equipo de Security Compliance",
    s: [TRUST] },
  { sec: "Datos y tokens", q: "¿Qué tokens emiten? ¿Sirven con cualquier procesador?", c: "high",
    a: "Tres tipos: <b>de un solo uso, de bóveda y de red</b>. Un mismo token de bóveda funciona con todos los procesadores conectados.",
    s: [doc("basic-concepts/tokens"), doc("security-and-compliance/network-tokens")] },
  { sec: "Datos y tokens", q: "¿Podemos migrar las tarjetas guardadas sin pedírselas al cliente?", c: "high",
    a: "Sí. Yuno importa las tarjetas desde el proveedor actual y las mapea a sus tokens por API. Los archivos viajan <b>cifrados con PGP por SFTP</b>.",
    s: [doc("security-and-compliance/data-migration-processes/token-migration-process")] },
  { sec: "Datos y tokens", q: "Si nos vamos, ¿podemos exportar los tokens?", c: "high",
    a: "Sí. Yuno documenta la exportación de tokens: <b>no hay amarre a su bóveda</b>.",
    s: [doc("security-and-compliance/data-migration-processes/exporting-tokens-from-yuno")] },
  { sec: "Datos y tokens", q: "¿Dónde se guardan los datos? ¿Pueden quedarse en Europa?", c: "high",
    a: "Yuno opera <b>dos regiones separadas, EE. UU. y EMEA</b>. Los datos no se comparten entre ellas.",
    s: [doc("using-yuno/environments")] },
  { sec: "Datos y tokens", q: "Envíen su DPA de GDPR y la lista de subprocesadores.", c: "medium",
    a: "Parcial: tienen <b>ISO 27701</b> y residencia de datos en EMEA. El DPA y los subprocesadores no están en la documentación pública.", owner: "Confirmar con Legal antes de enviar",
    s: [TRUST, doc("using-yuno/environments")] },
  { sec: "Integración", q: "¿Cómo se autentican las llamadas a la API?", c: "high",
    a: "Llaves por cuenta y ambiente, llaves de organización y <b>llaves personalizadas</b> por producto. Además, <b>lista de IP permitidas</b>.",
    s: [doc("using-yuno/settings/developers-credentials")] },
  { sec: "Integración", q: "¿Cómo verificamos que un webhook viene de Yuno?", c: "high",
    a: "Con firma <b>HMAC SHA-256</b> en el encabezado <code>x-hmac-signature</code>.",
    s: [doc("webhooks/verify-webhook-signatures-hmac")] },
  { sec: "Integración", q: "¿El dashboard soporta SSO y SCIM?", c: "high",
    a: "SSO sí, con <b>SAML 2.0</b> (Okta y Entra ID). OIDC y SCIM <b>no están soportados</b> hoy.",
    s: [doc("using-yuno/organization/security")] },
  { sec: "Integración", q: "¿Hay sandbox para la prueba de concepto?", c: "high",
    a: "Sí, <b>Test Mode</b> desde el primer día. El paso a producción suele verificarse <b>en pocas horas</b>.",
    s: [doc("using-yuno/environments")] },
  { sec: "Pagos y ruteo", q: "¿Qué pasa si se cae un procesador?", c: "high",
    a: "<b>Monitors</b> detecta la caída de aprobación, alerta por correo u Opsgenie y <b>redirige el tráfico al proveedor de respaldo</b>.",
    s: [doc("using-yuno/dashboard-overview/monitors")] },
  { sec: "Pagos y ruteo", q: "¿El ruteo optimiza aprobación y costo a la vez?", c: "high",
    a: "Sí. Las reglas de <b>Smart Routing</b> envían cada pago al mejor proveedor por costo, riesgo o capacidad.",
    s: [doc("using-yuno/dashboard-overview/routing")] },
  { sec: "Pagos y ruteo", q: "¿Cómo recuperan pagos recurrentes rechazados?", c: "high",
    a: "<b>Smart Retries</b> reintenta a las 5, 12, 24 y 36 horas o con ML. <b>NOVA</b> contacta al cliente por WhatsApp o voz.",
    s: [doc("payment-features/subscriptions/retries"), doc("ai-capabilities/nova")] },
  { sec: "Pagos y ruteo", q: "¿Soportan Pix Automático en Brasil?", c: "high",
    a: "Sí, dentro de las suscripciones de Yuno.",
    s: [doc("payment-features/subscriptions/pix-automatico")] },
  { sec: "Legal", q: "¿Qué SLA de disponibilidad firman y con qué créditos?", c: "review",
    a: "Sin fuente pública. Se define en el contrato.", owner: "Pasa a Legal y Deal desk", s: [] },
  { sec: "Legal", q: "¿Cuál es su cobertura de seguro cibernético?", c: "review",
    a: "Sin fuente pública.", owner: "Pasa a Finanzas y Legal", s: [] },
];
const LABEL = { high: "Con fuente", medium: "Revisar", review: "A un ingeniero" };
const ICON = { high: "✓", medium: "!", review: "→" };
const SHORT = {
  0: "PCI DSS Nivel 1, v4.0", 1: "SOC 2 Tipo 2 e ISO 27001", 2: "No: solo reciben tokens (SAQ A)", 3: "3DS2 con 7 redes",
  4: "Sin fuente pública", 5: "Un solo uso, bóveda y red", 6: "Sí, cifrado PGP por SFTP", 8: "Regiones EE. UU. y EMEA",
  11: "Firma HMAC SHA-256", 12: "SAML 2.0; SCIM no", 13: "Sí, Test Mode", 14: "Monitors y respaldo automático",
  16: "Smart Retries y NOVA", 18: "Sin fuente pública",
};

// ---------- Base ----------
const nav = $("nav");
function toast(msg) {
  const el = $("toast");
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2200);
}
function countTo(el, to, { dur = 900, fmt = v => Math.round(v).toLocaleString("es-CO") } = {}) {
  clearTimeout(el._t);
  const from = parseFloat(el.dataset.v || 0);
  const steps = Math.max(1, Math.round(dur / 16));
  let i = 0;
  const step = () => {
    i++;
    const p = i / steps;
    el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (i < steps) el._t = setTimeout(step, 16); else el.dataset.v = to;
  };
  step();
}
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  e.target.dispatchEvent(new Event("shown"));
  io.unobserve(e.target);
}), { threshold: 0.18 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// ---------- Hero: el panel crece con el scroll y se queda fijo ----------
const stage = $("stage"), stageWrap = $("stageWrap");
function onScroll() {
  nav.classList.toggle("solid", scrollY > 8);
  const top = stageWrap.offsetTop;
  const p = Math.min(1, Math.max(0, scrollY / Math.max(1, top)));
  // crece a lo ancho y a lo alto hasta ocupar toda la pantalla
  stage.style.setProperty("--ix", `${innerWidth * 0.06 * (1 - p)}px`);
  stage.style.setProperty("--iy", `${innerHeight * 0.08 * (1 - p)}px`);
  stage.style.setProperty("--r", `${24 * (1 - p)}px`);
  // mientras el panel está fijo a pantalla completa, el header se esconde
  const pinned = scrollY >= top - 2 && scrollY < top + stageWrap.offsetHeight - innerHeight;
  nav.classList.toggle("hide", pinned);
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
onScroll();

// ---------- Hero: una pregunta a la vez entra al motor y sale resuelta ----------
const scene = $("scene"), engine = $("engine"), slotQ = $("slotQ"), answersEl = $("answers"), ticker = $("ticker");
const HERO = Object.keys(SHORT).map(Number);
const DOCS = ["tokens", "routing", "3d-secure", "monitors", "pci-compliance", "webhooks", "environments", "network-tokens", "payouts", "nova"];
let hi = 0, solved = 0;
const rel = el => { const r = el.getBoundingClientRect(), s = scene.getBoundingClientRect(); return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height }; };
const anim = (el, kf, opt) => Promise.race([el.animate(kf, { fill: "forwards", ...opt }).finished, wait(opt.duration + 80)]);
const EASE_OUT = "cubic-bezier(.22,1,.36,1)", EASE_IN = "cubic-bezier(.55,0,.75,.2)";

async function heroStep() {
  const i = HERO[hi++ % HERO.length], x = QUESTIONS[i];
  const orb = rel(engine.querySelector(".orb-in"));
  const cx = orb.x + orb.w / 2, cy = orb.y + orb.h / 2;

  // 1. La pregunta llega desde la izquierda, perdida y borrosa
  const sq = rel(slotQ);
  const q = document.createElement("div");
  q.className = "tq";
  q.innerHTML = `<span class="tq-n">Pregunta ${String(solved + 1).padStart(3, "0")}</span>${x.q}`;
  Object.assign(q.style, { left: sq.x + "px", top: sq.y + "px", width: sq.w + "px" });
  scene.appendChild(q);
  ticker.textContent = "esperando pregunta";
  await anim(q, [
    { transform: "translateX(-60vw) rotate(-8deg) scale(.8)", opacity: 0, filter: "blur(12px)" },
    { transform: "none", opacity: 1, filter: "blur(0px)" },
  ], { duration: 1100, easing: EASE_OUT });
  await wait(1000);

  // 2. Entra al motor
  const qr = rel(q);
  ticker.textContent = "recibiendo pregunta";
  await anim(q, [
    { transform: "none", opacity: 1 },
    { transform: `translate(${cx - (qr.x + qr.w / 2)}px, ${cy - (qr.y + qr.h / 2)}px) scale(.1)`, opacity: 0 },
  ], { duration: 700, easing: EASE_IN });
  q.remove();
  engine.classList.add("gulp"); await wait(200); engine.classList.remove("gulp");

  // 3. Busca en la documentación
  engine.classList.add("busy");
  for (let k = 0; k < 6; k++) {
    ticker.textContent = "buscando en docs.y.uno/" + DOCS[(hi * 3 + k) % DOCS.length];
    await wait(160);
  }
  const src = x.s[0] && x.s[0].url.startsWith(D) ? x.s[0].label.replace("docs.y.uno/", "") : null;
  ticker.textContent = src ? "encontrada en " + src : "sin fuente pública";
  engine.classList.remove("busy");
  await wait(250);

  // 4. Sale resuelta y crece hacia la derecha
  const ok = x.c !== "review";
  const card = document.createElement("div");
  card.className = "ta";
  card.innerHTML = `<p class="ta-top ${ok ? "ok" : "rev"}"><span class="chk">${ok ? "✓" : "→"}</span>${ok ? "Respondida con fuente" : "Pasa a un ingeniero"}</p>${SHORT[i]}${ok && x.s[0] ? `<br><span class="src">${x.s[0].label}</span>` : ""}`;
  const olds = [...answersEl.children];
  const before = olds.map(c => c.getBoundingClientRect().top);
  card.style.opacity = "0";
  answersEl.prepend(card);
  olds.forEach((c, j) => {
    const d = before[j] - c.getBoundingClientRect().top;
    c.animate([{ transform: `translateY(${d}px)` }, { transform: "none" }], { duration: 600, easing: EASE_OUT });
    c.classList.add("old");
  });
  while (answersEl.children.length > 4) answersEl.lastElementChild.remove();

  const cr = rel(card);
  const fly = card.cloneNode(true);
  fly.classList.add("fly"); fly.style.opacity = "1";
  Object.assign(fly.style, { left: cr.x + "px", top: cr.y + "px", width: cr.w + "px" });
  scene.appendChild(fly);
  engine.classList.add("out");
  await anim(fly, [
    { transform: `translate(${cx - (cr.x + cr.w / 2)}px, ${cy - (cr.y + cr.h / 2)}px) scale(.12)`, opacity: 0 },
    { transform: "translate(0, 0) scale(1.06)", opacity: 1, offset: .75 },
    { transform: "none", opacity: 1 },
  ], { duration: 950, easing: EASE_OUT });
  engine.classList.remove("out");
  card.style.opacity = "1"; fly.remove();
  solved++;
  $("heroCount").textContent = solved;
}
(async function heroLoop() {
  await wait(1200);
  while (true) { await heroStep(); await wait(600); }
})();

// ---------- Copiloto ----------
const st = { done: 0, running: false, sel: null };
const qlist = $("qlist"), side = $("side");
const btnRun = $("btnRun"), btnExport = $("btnExport"), btnReset = $("btnReset");

function renderList() {
  qlist.innerHTML = QUESTIONS.map((x, i) => {
    const s = i < st.done ? x.c : (st.running && i === st.done ? "run" : "");
    return `<div class="q${st.sel === i ? " sel" : ""}" data-i="${i}">
      <span class="q-n">${String(i + 1).padStart(2, "0")}</span>
      <span><span class="q-t">${x.q}</span><span class="q-s">${x.sec}</span></span>
      <span class="st ${s}">${i < st.done ? ICON[x.c] : ""}</span></div>`;
  }).join("");
}
function showAnswer(i) {
  const x = QUESTIONS[i];
  st.sel = i;
  $("sideIdle").hidden = true;
  const box = $("sideAns");
  box.hidden = false;
  box.style.animation = "none"; void box.offsetWidth; box.style.animation = "";
  box.innerHTML = `
    <span class="badge ${x.c}">${ICON[x.c]} ${LABEL[x.c]}</span>
    <p class="ans-q">${x.q}</p>
    <p class="ans-a">${x.a}</p>
    ${x.owner ? `<p class="ans-owner">→ ${x.owner}</p>` : ""}
    ${x.s.length ? `<div class="srcs">${x.s.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join("")}</div>` : ""}`;
  renderList();
}
qlist.addEventListener("click", e => {
  const r = e.target.closest(".q"); if (!r) return;
  if (+r.dataset.i < st.done) showAnswer(+r.dataset.i);
});
function updateCounters(dur = 300) {
  const done = QUESTIONS.slice(0, st.done);
  const ans = done.filter(x => x.c !== "review").length;
  const rev = done.filter(x => x.c !== "high").length;
  const docs = new Set(done.flatMap(x => x.s.map(s => s.url)).filter(u => u.startsWith(D))).size;
  const c = k => document.querySelector(`[data-k="${k}"]`);
  countTo(c("ans"), ans, { dur });
  countTo(c("rev"), rev, { dur });
  countTo(c("hrs"), ans * 8 / 60, { dur, fmt: v => v.toFixed(1).replace(".", ",") });
  countTo(c("docs"), docs, { dur });
}

async function start() {
  if (st.running) return;
  st.running = true;
  btnRun.disabled = true;
  for (let p = 0; p <= 100; p += 4) {
    $("upBar").style.width = p + "%";
    $("upL").textContent = `Subiendo archivo… ${p} %`;
    await wait(28);
  }
  $("upL").textContent = "Leyendo 20 preguntas en 5 secciones…";
  await wait(700);
  $("drop").hidden = true; $("winBody").hidden = false;
  Object.assign(st, { done: 0, sel: null });
  $("sideAns").hidden = true; $("sideIdle").hidden = false;
  side.classList.add("reading");
  renderList();
  for (const x of QUESTIONS) {
    $("sideDoc").textContent = x.s[0] ? x.s[0].label : "sin fuente pública";
    await wait(280);
    st.done++;
    updateCounters(); renderList();
  }
  st.running = false;
  side.classList.remove("reading");
  btnExport.disabled = false; btnReset.hidden = false;
  toast("17 respuestas con fuente · 3 pasan a un ingeniero");
  showAnswer(2);
}
btnRun.addEventListener("click", start);
btnReset.addEventListener("click", () => {
  Object.assign(st, { done: 0, sel: null });
  updateCounters(200);
  $("winBody").hidden = true; $("drop").hidden = false;
  $("upBar").style.width = "0"; $("upL").textContent = "Archivo listo para analizar";
  btnRun.disabled = false; btnExport.disabled = true; btnReset.hidden = true;
  const fc = $("fileCard"); fc.style.animation = "none"; void fc.offsetWidth; fc.style.animation = "";
});
btnExport.addEventListener("click", () => {
  const strip = h => h.replace(/<[^>]+>/g, "");
  const esc = v => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [["#", "Sección", "Pregunta", "Respuesta", "Estado", "Responsable", "Fuentes"].map(esc).join(",")];
  QUESTIONS.forEach((x, i) => rows.push([i + 1, x.sec, x.q, strip(x.a), LABEL[x.c], x.owner || "", x.s.map(s => s.url).join(" ")].map(esc).join(",")));
  const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "AndesAir_respuestas.csv" });
  a.click(); URL.revokeObjectURL(a.href);
  toast("CSV exportado");
});

// ---------- Ficha de descubrimiento ----------
const PROSPECTS = {
  "andesair.demo": {
    name: "Andes Air", meta: "Aerolínea con sede en Bogotá · vende tiquetes en su web y su app", gmv: 420, approval: 84,
    gaps: [["Colombia", "Tarjetas", "PSE y Nequi"], ["México", "Tarjetas", "OXXO y SPEI"], ["Brasil", "Tarjetas", "Pix y pago en cuotas"], ["Perú", "Tarjetas", "Yape y PagoEfectivo"], ["EE. UU.", "Tarjetas y PayPal", "Apple Pay y Google Pay"]],
    offers: [
      ["Cobra todo con un solo procesador", "Smart Routing", "Envía cada pago al procesador que más aprueba en ese país.", "using-yuno/dashboard-overview/routing"],
      ["Si su procesador se cae, deja de vender", "Monitors", "Detecta la caída y pasa los pagos a un respaldo, solo.", "using-yuno/dashboard-overview/monitors"],
      ["Tiquetes caros, más fraude", "3D Secure 2", "Autentica al comprador sin frenar la compra.", "security-and-compliance/3d-secure"],
      ["Miedo a perder las tarjetas guardadas", "Migración de tokens", "Pasa sus tarjetas a Yuno sin pedírselas al cliente.", "security-and-compliance/data-migration-processes/token-migration-process"],
    ],
    questions: ["¿Cuántos pagos les rechazan en cada país?", "¿Usan uno o varios procesadores? ¿Quién decide a cuál va cada pago?", "¿Qué pasó la última vez que se les cayó el procesador en temporada alta?", "¿Con qué quieren pagar sus clientes en México y Brasil?", "¿Dónde tienen guardadas hoy las tarjetas de sus clientes?"],
    demo: ["<b>Checkout</b> con PSE, Pix y OXXO en una sola integración", "<b>Una regla de ruteo</b> por país, creada en vivo", "<b>Un procesador que se cae</b> y el respaldo automático", "<b>Tablero de aprobación</b> por procesador"],
  },
  "pulsofit.demo": {
    name: "Pulso Fit", meta: "App de entrenamiento en Ciudad de México · cobra una suscripción mensual", gmv: 38, approval: 78,
    gaps: [["México", "Tarjetas", "OXXO y SPEI"], ["Brasil", "Tarjetas", "Pix Automático"], ["Colombia", "Tarjetas", "PSE y Nequi"], ["Argentina", "Tarjetas", "Mercado Pago"]],
    offers: [
      ["Pierde suscriptores cuando la tarjeta falla", "Smart Retries", "Reintenta el cobro en el mejor momento.", "payment-features/subscriptions/retries"],
      ["Nadie avisa al cliente del pago fallido", "NOVA", "Un agente de IA lo contacta por WhatsApp con el enlace de pago.", "ai-capabilities/nova"],
      ["Tarjetas vencidas cancelan planes", "Tokens de red", "Las tarjetas se actualizan solas cuando el banco las renueva.", "security-and-compliance/network-tokens"],
      ["Depende de Stripe para todo", "Stripe Billing con Yuno", "Conserva Stripe y suma procesadores locales.", "payment-features/subscriptions/stripe-billing"],
    ],
    questions: ["¿Cuántos suscriptores pierden por pagos fallidos y no porque cancelan?", "¿Cuándo y cómo reintentan hoy un cobro rechazado?", "¿Van a cobrar con Pix Automático cuando lleguen a Brasil?", "¿Quieren seguir usando Stripe Billing?", "¿Por qué canal les responden más los clientes?"],
    demo: ["<b>Una renovación fallida</b> recuperada con Smart Retries", "<b>NOVA</b> recuperando al cliente por WhatsApp", "<b>Pix Automático</b> desde la misma API", "<b>Stripe Billing</b> con procesadores locales"],
  },
  "rutago.demo": {
    name: "RutaGo", meta: "App de transporte en Lima · cobra a pasajeros y les paga a conductores", gmv: 160, approval: 81,
    gaps: [["Perú", "Tarjetas y efectivo", "Yape y Plin"], ["México", "Tarjetas y efectivo", "OXXO y SPEI"], ["Colombia", "Tarjetas y efectivo", "Nequi y PSE"], ["Chile", "Tarjetas", "Webpay y Khipu"]],
    offers: [
      ["Paga a conductores con archivos manuales", "Payouts", "Les paga desde la misma plataforma de cobro.", "payouts-and-disputes/payouts"],
      ["Cambiar de procesador exige programar", "Ruteo dinámico", "Reglas que el equipo edita sin tocar código.", "using-yuno/dashboard-overview/routing"],
      ["Sufrió ataques de prueba de tarjetas", "Verificación de tarjeta", "Detecta tarjetas repetidas antes de cobrar.", "security-and-compliance/card-verification"],
      ["Disputas en cuatro países", "Contracargos", "Todas las disputas en un solo lugar.", "payouts-and-disputes/chargeback-management"],
    ],
    questions: ["¿Cómo les pagan hoy a los conductores y cuánto tarda?", "¿Quién cambia a qué procesador va cada pago?", "¿Cuánto les costó el último ataque con tarjetas robadas?", "¿Qué billeteras están reemplazando el efectivo?", "¿Cuántos contracargos tienen por país?"],
    demo: ["<b>El ruteo</b> sacado del código al tablero", "<b>Un pago a un conductor</b> desde la API", "<b>Una tarjeta repetida</b> detectada antes del cobro", "<b>Yape y OXXO</b> en el checkout del pasajero"],
  },
};

$("chips").innerHTML = `<span class="chips-l">Ejemplos:</span>` + Object.entries(PROSPECTS).map(([d, p]) => `<button class="chip" data-d="${d}">${p.name} · ${d}</button>`).join("");
const input = $("typed");
let typing = null;
function typeDomain(domain) {
  clearInterval(typing);
  document.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c.dataset.d === domain));
  input.value = "";
  let i = 0;
  return new Promise(res => {
    typing = setInterval(() => {
      input.value = domain.slice(0, ++i);
      if (i >= domain.length) { clearInterval(typing); res(); }
    }, 55);
  });
}
$("chips").addEventListener("click", e => { const c = e.target.closest("[data-d]"); if (c) typeDomain(c.dataset.d).then(() => input.focus()); });
async function createBrief() {
  let d = input.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  if (!d) { d = "andesair.demo"; await typeDomain(d); }
  const box = $("brief");
  box.innerHTML = `<div class="dk loading"><span class="spin"></span>Buscando ${d} · checkout · países · noticias…</div>`;
  await wait(900);
  buildBrief(d);
}
$("btnBrief").addEventListener("click", createBrief);
input.addEventListener("keydown", e => { if (e.key === "Enter") createBrief(); });

function emptyBrief() {
  const bar = w => `<span class="sk" style="width:${w}"></span>`;
  $("brief").innerHTML = `
    <div class="dk who empty"><div><p class="who-name">Prospecto</p><p class="who-meta">${bar("260px")}</p></div>
      <div class="who-facts">${["vende al año en línea", "de sus pagos se aprueban", "países donde vende"].map(l => `<div class="fact"><p>—</p><p>${l}</p></div>`).join("")}</div></div>
    <div class="dk empty"><p class="bk-t">Dónde pierde ventas</p><p class="bk-s">Los métodos de pago que sus clientes usan y que aún no acepta.</p>${bar("100%")}${bar("100%")}${bar("70%")}</div>
    <div class="dk empty"><p class="bk-t">Qué ofrecerle</p><p class="bk-s">Cada problema de hoy, con el producto de Yuno que lo resuelve.</p>${bar("100%")}${bar("80%")}</div>
    <div class="dk money empty"><div><p class="bk-t">Cuánto dinero está en juego</p><p class="money-v">US$ —</p></div><div></div></div>
    <div class="grid2"><div class="dk empty"><p class="bk-t">Qué preguntar en la reunión</p>${bar("90%")}${bar("70%")}</div><div class="dk empty"><p class="bk-t">Qué mostrar en la demo</p>${bar("90%")}${bar("60%")}</div></div>`;
}
emptyBrief();

const money = n => `US$${n.toFixed(1).replace(".", ",")} M`;

function buildBrief(domain) {
  const p = PROSPECTS[domain];
  const box = $("brief");
  if (!p) { box.innerHTML = `<div class="dk"><p class="bk-s" style="margin:0">Modo demo: elige uno de los tres prospectos ficticios.</p></div>`; return; }
  const attempted = p.gmv / (p.approval / 100);
  box.innerHTML = `
    <div class="dk who">
      <div><p class="who-name">${p.name}</p><p class="who-meta">${p.meta}</p></div>
      <div class="who-facts">
        <div class="fact"><p>US$${p.gmv} M</p><p>vende al año en línea</p></div>
        <div class="fact"><p>${p.approval} %</p><p>de sus pagos se aprueban</p></div>
        <div class="fact"><p>${p.gaps.length}</p><p>países donde vende</p></div>
      </div>
    </div>

    <div class="dk" style="animation-delay:.1s">
      <p class="bk-t">Dónde pierde ventas</p>
      <p class="bk-s">En cada país, sus clientes quieren pagar con métodos que ${p.name} todavía no acepta.</p>
      <div class="gap-row head"><span>País</span><span>Acepta hoy</span><span>Le falta aceptar</span><span>Con Yuno</span></div>
      ${p.gaps.map(([c, now, miss]) => `<div class="gap-row"><span class="c">${c}</span><span class="now">${now}</span><span class="miss">${miss}</span><span class="fix">✓ Una sola integración</span></div>`).join("")}
    </div>

    <div class="dk" style="animation-delay:.2s">
      <p class="bk-t">Qué ofrecerle</p>
      <p class="bk-s">Cada problema que tiene hoy, con el producto de Yuno que lo resuelve.</p>
      <div class="offers">${p.offers.map(([pain, prod, what, path]) => `<div class="offer"><div class="of-l"><span class="of-tag">Hoy</span><p>${pain}</p></div><span class="of-arrow">→</span><div class="of-r"><p class="of-prod">${prod}</p><p class="of-what">${what}</p><a href="${D + path}" target="_blank" rel="noopener">Ver en docs.y.uno ↗</a></div></div>`).join("")}</div>
    </div>

    <div class="dk money" style="animation-delay:.3s">
      <div>
        <p class="bk-t">Cuánto dinero está en juego</p>
        <p class="money-v" id="moneyV">US$0</p>
        <p class="money-sent" id="moneySent"></p>
      </div>
      <div>
        <div class="range-row"><span>Mejora en pagos aprobados</span><b id="upL">3 puntos</b></div>
        <input type="range" id="up" min="1" max="6" step="0.5" value="3">
        <small>Yuno reporta cerca de 5 puntos de mejora promedio (Serie B, agosto de 2026). Las cifras del prospecto son simuladas.</small>
      </div>
    </div>

    <div class="grid2" style="animation-delay:.4s">
      <div class="dk"><p class="bk-t">Qué preguntar en la reunión</p><p class="bk-s">Para confirmar el problema antes de mostrar nada.</p><div class="bubbles">${p.questions.map((q, i) => `<p class="bubble" style="animation-delay:${.8 + i * .3}s">${q}</p>`).join("")}</div></div>
      <div class="dk"><p class="bk-t">Qué mostrar en la demo</p><p class="bk-s">Cuatro pasos, en este orden.</p><div class="steps">${p.demo.map(d => `<p class="stp"><span>${d}</span></p>`).join("")}</div></div>
    </div>

    <div class="b-actions" style="animation-delay:.5s">
      <button class="btn glass sm" id="copy">Copiar ficha</button>
      <button class="btn blue sm" id="crm">Guardar en el CRM</button>
    </div>`;

  const up = $("up");
  const upd = first => {
    const u = parseFloat(up.value);
    const label = `${String(u).replace(".", ",")} puntos`;
    $("upL").textContent = label;
    $("moneySent").textContent = `en ventas extra al año si aprueba ${label} más de los pagos que ya recibe.`;
    countTo($("moneyV"), attempted * u / 100, { dur: first ? 1200 : 250, fmt: money });
  };
  up.addEventListener("input", () => upd(false)); setTimeout(() => upd(true), 400);

  $("copy").addEventListener("click", () => {
    const txt = `${p.name} (${domain})\n${p.meta}\n\nQué preguntar:\n${p.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nQué mostrar:\n${p.demo.map((d, i) => `${i + 1}. ${d.replace(/<[^>]+>/g, "")}`).join("\n")}`;
    navigator.clipboard?.writeText(txt).then(() => toast("Ficha copiada"), () => toast("No se pudo copiar"));
  });
  $("crm").addEventListener("click", () => toast(`Guardada en el negocio de ${p.name} (simulado)`));
}

// ---------- Parámetros de vista ----------
const params = new URLSearchParams(location.search);
const go = params.get("go");
if (go && $(go)) {
  document.documentElement.style.scrollBehavior = "auto";
  addEventListener("load", () => $(go).scrollIntoView());
}
// ?shot: modo de captura (dispara todo de una vez)
if (params.has("shot")) {
  document.body.classList.add("shot");
  document.querySelectorAll(".reveal").forEach(el => { el.classList.add("in"); el.dispatchEvent(new Event("shown")); });
  start();
  createBrief();
}
