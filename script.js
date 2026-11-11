"use strict";

/* ============================================================
   DATOS DE LOS PROYECTOS
   Para agregar o editar un proyecto, tocá solo este arreglo.
   Campos opcionales: features, miParte, links.
   ============================================================ */
const PROYECTOS = [
  {
    id: 1,
    status: "Proyecto personal · En desarrollo",
    title: "Servidor casero y laboratorio Linux",
    description:
      "Servidor propio en Linux donde aprendo Docker y Kubernetes para alojar sitios web, practico con máquinas virtuales (sistemas operativos, ciberseguridad y hosting) y desarrollo un sistema casero de almacenamiento en la nube similar a Drive.",
    stack: ["Linux", "Docker", "Kubernetes", "Máquinas virtuales"],
  },
  {
    id: 2,
    status: "En desarrollo",
    title: "Aplicación web de noticias",
    description:
      "Aplicación web para consultar noticias, con interfaz en React y un backend propio en Node.js y Express. [Sumá acá qué funcionalidades tiene: búsqueda, categorías, login, etc.]",
    stack: ["React", "Vite", "Node.js", "Express"],
    links: [
      { texto: "Ver demo", url: "#" },
      { texto: "Repositorio", url: "#" },
    ],
  },
  {
    id: 3,
    status: "Proyecto académico en equipo · Desarrollo de software · UTN FRC",
    title: "Sistema de Control de Solicitudes de Equipamiento",
    description:
      "Aplicación web para gestionar el préstamo de notebooks, proyectores y cámaras. Los usuarios piden equipos por fechas y los encargados aprueban, rechazan o registran la devolución, con reglas que evitan reservas superpuestas.",
    features: [
      "API REST en Node.js y Express con autenticación JWT",
      "Control de disponibilidad: detecta fechas superpuestas y cambia el estado de los equipos.",
      "Historial de cambios, filtros, paginación y pruebas automatizadas con Jest.",
    ],
    miParte:
      "organización y verificación de tests y lógica del negocio, integrar la verificación JWT con roles",
    stack: ["React", "Vite", "Node.js", "Express", "JWT", "Jest"],
    links: [{ texto: "Repositorio", url: "#" }],
  },
];

/* ============================================================
   UTILIDADES
   ============================================================ */
const raiz = document.documentElement;

/** Crea un elemento. Usa textContent, así el texto nunca se interpreta como HTML. */
function el(tag, { clase, texto, attrs } = {}, hijos = []) {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto !== undefined) nodo.textContent = texto;
  if (attrs) {
    for (const [clave, valor] of Object.entries(attrs)) nodo.setAttribute(clave, valor);
  }
  nodo.append(...hijos);
  return nodo;
}

const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

/* ============================================================
   1) MODO CLARO / OSCURO
   - Claro  -> <html data-theme="light"> (usa las variables de :root)
   - Oscuro -> <html data-theme="dark">
   Si nunca se eligió, se sigue el tema del sistema. Al tocar el
   switch, la elección se guarda en localStorage.
   ============================================================ */
const CLAVE_TEMA = "tema";
const botonTema = document.getElementById("theme-toggle");
const sistemaOscuro = window.matchMedia("(prefers-color-scheme: dark)");

function leerTemaGuardado() {
  try {
    const tema = localStorage.getItem(CLAVE_TEMA);
    return tema === "light" || tema === "dark" ? tema : null;
  } catch {
    return null; // localStorage bloqueado (modo privado, etc.)
  }
}

function guardarTema(tema) {
  try {
    localStorage.setItem(CLAVE_TEMA, tema);
  } catch {
    /* sin almacenamiento: el cambio vale solo para esta visita */
  }
}

function aplicarTema(tema) {
  raiz.dataset.theme = tema;
  botonTema.setAttribute("aria-checked", String(tema === "dark"));
}

aplicarTema(leerTemaGuardado() ?? (sistemaOscuro.matches ? "dark" : "light"));

botonTema.addEventListener("click", () => {
  const nuevo = raiz.dataset.theme === "dark" ? "light" : "dark";
  aplicarTema(nuevo);
  guardarTema(nuevo);
});

// Si el usuario no eligió nada, acompaña los cambios del sistema.
sistemaOscuro.addEventListener("change", (e) => {
  if (!leerTemaGuardado()) aplicarTema(e.matches ? "dark" : "light");
});

/* ============================================================
   2) SWITCH PROYECTOS / CONOCIMIENTOS
   Se muestra una sola sección a la vez. Por defecto: Proyectos.
   ============================================================ */
const seccionTrabajo = document.getElementById("trabajo");
const switchEl = seccionTrabajo.querySelector(".switch");
const pestanas = [...switchEl.querySelectorAll('[role="tab"]')];
const paneles = new Map(pestanas.map((t) => [t.dataset.tab, document.getElementById(t.dataset.tab)]));

function activarPestana(nombre, { enfocar = false } = {}) {
  if (!paneles.has(nombre)) return;

  pestanas.forEach((pestana) => {
    const activa = pestana.dataset.tab === nombre;
    const panel = paneles.get(pestana.dataset.tab);

    pestana.setAttribute("aria-selected", String(activa));
    pestana.tabIndex = activa ? 0 : -1;

    if (activa) {
      if (panel.hidden) {
        panel.hidden = false;
        panel.classList.remove("entra");
        void panel.offsetWidth; // reinicia la animación de entrada
        panel.classList.add("entra");
      }
      if (enfocar) pestana.focus();
    } else {
      panel.hidden = true;
    }
  });

  switchEl.dataset.active = nombre; // el CSS desliza el selector según este valor
}

pestanas.forEach((pestana) => {
  pestana.addEventListener("click", () => activarPestana(pestana.dataset.tab));
});

// Teclado: flechas, Inicio y Fin
switchEl.addEventListener("keydown", (e) => {
  const actual = pestanas.findIndex((t) => t.dataset.tab === switchEl.dataset.active);
  const total = pestanas.length;
  let destino = null;

  if (e.key === "ArrowRight") destino = (actual + 1) % total;
  else if (e.key === "ArrowLeft") destino = (actual - 1 + total) % total;
  else if (e.key === "Home") destino = 0;
  else if (e.key === "End") destino = total - 1;

  if (destino !== null) {
    e.preventDefault();
    activarPestana(pestanas[destino].dataset.tab, { enfocar: true });
  }
});

// Los links del nav y del hero (#proyectos / #conocimientos) abren la pestaña y bajan hasta ella.
document.querySelectorAll('a[href="#proyectos"], a[href="#conocimientos"]').forEach((enlace) => {
  enlace.addEventListener("click", (e) => {
    e.preventDefault();
    const nombre = enlace.getAttribute("href").slice(1);
    activarPestana(nombre);
    seccionTrabajo.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${nombre}`);
  });
});

// Si entran directo con la URL terminada en #conocimientos
const hashInicial = location.hash.slice(1);
if (paneles.has(hashInicial)) {
  activarPestana(hashInicial);
  window.addEventListener("load", () => seccionTrabajo.scrollIntoView());
}

/* ============================================================
   3) PROYECTOS: tarjetas + vista en pantalla completa
   ============================================================ */
const ICONO_EXPANDIR =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';

function crearStack(stack) {
  return el("div", { clase: "stack" }, stack.map((tecnologia) => el("span", { texto: tecnologia })));
}

function crearLinks(links) {
  return el(
    "div",
    { clase: "links" },
    links.map(({ texto, url }) => {
      const attrs = { href: url };
      if (url !== "#") Object.assign(attrs, { target: "_blank", rel: "noopener" });
      return el("a", { texto, attrs });
    })
  );
}

function crearCard(proyecto) {
  const botonExpandir = el("button", {
    clase: "card-expandir",
    attrs: {
      type: "button",
      "aria-haspopup": "dialog",
      "aria-label": `Ver "${proyecto.title}" en pantalla completa`,
    },
  });
  botonExpandir.innerHTML = ICONO_EXPANDIR; // constante propia, no viene de los datos

  const card = el("article", { clase: "card" }, [
    botonExpandir,
    el("div", { clase: "status", texto: proyecto.status }),
    el("h3", { texto: proyecto.title }),
    el("p", { texto: proyecto.description }),
    crearStack(proyecto.stack),
  ]);
  if (proyecto.links?.length) card.append(crearLinks(proyecto.links));

  // Toda la tarjeta abre el proyecto, salvo sus links (que van a su destino).
  card.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    abrirProyecto(proyecto);
  });

  return card;
}

document.getElementById("lista-proyectos").append(...PROYECTOS.map(crearCard));

/* ----- Modal ----- */
const modal = document.getElementById("proyecto-modal");
const modalCuerpo = modal.querySelector(".modal-cuerpo");
const DURACION_MODAL = 250; // ms, igual que la transición del CSS
let cerrando = false;

function contenidoModal(proyecto) {
  const nodos = [
    el("div", { clase: "status", texto: proyecto.status }),
    el("h3", { texto: proyecto.title, attrs: { id: "modal-titulo" } }),
    el("p", { clase: "modal-desc", texto: proyecto.description }),
  ];

  if (proyecto.features?.length) {
    nodos.push(
      el("h4", { texto: "Características" }),
      el("ul", { clase: "modal-lista" }, proyecto.features.map((f) => el("li", { texto: f })))
    );
  }

  if (proyecto.miParte) {
    nodos.push(el("h4", { texto: "Mi parte" }), el("p", { clase: "modal-desc", texto: mayuscula(proyecto.miParte) }));
  }

  nodos.push(el("h4", { texto: "Tecnologías" }), crearStack(proyecto.stack));
  if (proyecto.links?.length) nodos.push(crearLinks(proyecto.links));

  return nodos;
}

function abrirProyecto(proyecto) {
  if (modal.open) return;
  modalCuerpo.replaceChildren(...contenidoModal(proyecto));
  modalCuerpo.scrollTop = 0;
  raiz.classList.add("sin-scroll");
  modal.showModal();
  // Dos frames para que el navegador registre el estado inicial y anime la entrada
  requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("abierto")));
}

function cerrarProyecto() {
  if (!modal.open || cerrando) return;
  cerrando = true;
  modal.classList.remove("abierto");
  setTimeout(() => {
    modal.close();
    cerrando = false;
  }, DURACION_MODAL);
}

modal.querySelector(".modal-cerrar").addEventListener("click", cerrarProyecto);

// Clic en el fondo oscuro (el contenido está dentro de .modal-cuerpo, así que no cuenta)
modal.addEventListener("click", (e) => {
  if (e.target === modal) cerrarProyecto();
});

// Tecla Esc: cierra con la misma animación
modal.addEventListener("cancel", (e) => {
  e.preventDefault();
  cerrarProyecto();
});

modal.addEventListener("close", () => raiz.classList.remove("sin-scroll"));
