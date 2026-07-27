const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-links");
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = [...document.querySelectorAll("main section[id]")];
const backToTop = document.querySelector(".back-to-top");
const footer = document.querySelector(".site-footer");
const year = document.querySelector("#current-year");
const revealItems = document.querySelectorAll("[data-reveal]");
const accordionButtons = document.querySelectorAll(".project-details-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (year) {
  year.textContent = new Date().getFullYear();
}

const setMenuState = (isOpen) => {
  if (!navToggle || !navMenu) return;

  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
  navToggle.classList.toggle("is-open", isOpen);
  navMenu.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
};

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") !== "true";
  setMenuState(isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navToggle?.getAttribute("aria-expanded") === "true") {
    setMenuState(false);
    navToggle.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) setMenuState(false);
});

let scrollFrame;

const updateScrollUI = () => {
  const hasScrolled = window.scrollY > 24;
  header?.classList.toggle("is-scrolled", hasScrolled);
  backToTop?.classList.toggle("is-visible", window.scrollY > 600);
  scrollFrame = undefined;
};

window.addEventListener(
  "scroll",
  () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateScrollUI);
  },
  { passive: true },
);
updateScrollUI();

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
});

accordionButtons.forEach((button) => {
  const panelId = button.getAttribute("aria-controls");
  const panel = panelId ? document.getElementById(panelId) : null;
  if (!panel) return;

  panel.setAttribute("aria-hidden", "true");
  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    panel.setAttribute("aria-hidden", String(isOpen));
    panel.classList.toggle("is-open", !isOpen);
  });
});

document.documentElement.classList.add("js");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", isCurrent);
          if (isCurrent) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-28% 0px -62% 0px", threshold: 0 },
  );

  sections.forEach((section) => sectionObserver.observe(section));

  if (footer && backToTop) {
    const footerObserver = new IntersectionObserver(
      ([entry]) => backToTop.classList.toggle("is-near-footer", entry.isIntersecting),
      { rootMargin: "0px 0px 24px 0px", threshold: 0.05 },
    );
    footerObserver.observe(footer);
  }

  if (reducedMotion.matches) {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }
} else {
  revealItems.forEach((item) => item.classList.add("is-revealed"));
}
