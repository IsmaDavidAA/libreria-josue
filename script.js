const TZ = "America/La_Paz";

const schedule = {
  0: { start: 15 * 60, end: 20 * 60 },
  1: { start: 8 * 60 + 30, end: 21 * 60 },
  2: { start: 8 * 60 + 30, end: 21 * 60 },
  3: { start: 8 * 60 + 30, end: 21 * 60 },
  4: { start: 8 * 60 + 30, end: 21 * 60 },
  5: { start: 8 * 60 + 30, end: 21 * 60 },
  6: { start: 8 * 60 + 30, end: 20 * 60 },
};

const dayNames = [
  "el domingo",
  "el lunes",
  "el martes",
  "el miércoles",
  "el jueves",
  "el viernes",
  "el sábado",
];

const clock = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const nowInLaPaz = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    day: days[value.weekday],
    minutes: Number(value.hour) * 60 + Number(value.minute),
  };
};

const statusFor = ({ day, minutes }) => {
  const today = schedule[day];
  if (minutes >= today.start && minutes < today.end) {
    return {
      open: true,
      text: `Abierto ahora · hasta las ${clock(today.end)}`,
    };
  }
  if (minutes < today.start) {
    return {
      open: false,
      text: `Cerrado · abre hoy a las ${clock(today.start)}`,
    };
  }
  const next = (day + 1) % 7;
  return {
    open: false,
    text: `Cerrado · abre ${dayNames[next]} a las ${clock(schedule[next].start)}`,
  };
};

const renderStatus = () => {
  const current = nowInLaPaz();
  if (current.day === undefined || Number.isNaN(current.minutes)) return;
  const status = statusFor(current);
  document.querySelectorAll("[data-status]").forEach((node) => {
    node.textContent = status.text;
    node.dataset.open = status.open ? "true" : "false";
  });
  document.querySelectorAll("[data-day], [data-days]").forEach((row) => {
    const days = (row.dataset.days || row.dataset.day).split(",").map(Number);
    row.classList.toggle("is-today", days.includes(current.day));
  });
};

const setupMenu = () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#menu");
  if (!toggle || !menu) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
    menu.classList.toggle("is-open", !open);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", close);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) close();
  });
};

const setupOrder = () => {
  const form = document.querySelector("#pedido");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const clean = (key) => String(data.get(key) || "").trim().replace(/\s+/g, " ");
    const message = [
      "Hola, Librería Josué 1:9.",
      `Soy ${clean("nombre")}.`,
      `Consulta: ${clean("tipo")}.`,
      clean("detalle"),
    ].join(" ");
    const url = `https://wa.me/59172755306?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
  });
};

const setupHeader = () => {
  const top = document.querySelector(".top");
  const toggle = document.querySelector(".nav-toggle");
  const float = document.querySelector(".wa-float");
  const hero = document.querySelector(".hero");
  if (!top) return;
  const sync = () => {
    const menuOpen = toggle?.getAttribute("aria-expanded") === "true";
    top.classList.toggle("is-solid", menuOpen || window.scrollY > 20);
    if (float && hero) {
      float.classList.toggle("is-visible", hero.getBoundingClientRect().bottom < 72);
    }
  };
  sync();
  window.addEventListener("scroll", sync, { passive: true });
  toggle?.addEventListener("click", () => requestAnimationFrame(sync));
};

renderStatus();
setupMenu();
setupOrder();
setupHeader();
document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});
