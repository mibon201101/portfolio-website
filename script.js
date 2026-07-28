document.documentElement.classList.add("js");

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
const timeline = document.querySelector("[data-timeline]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (min-width: 900px)",
);

if (year) {
  year.textContent = new Date().getFullYear();
}

const setMenuState = (isOpen, moveFocus = false) => {
  if (!navToggle || !navMenu) return;

  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
  navToggle.classList.toggle("is-open", isOpen);
  navMenu.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);

  if (isOpen && moveFocus) {
    navMenu.querySelector("a")?.focus();
  }
};

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") !== "true";
  setMenuState(isOpen, isOpen);
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

document.addEventListener("pointerdown", (event) => {
  if (
    navToggle?.getAttribute("aria-expanded") === "true" &&
    !event.target.closest(".site-nav")
  ) {
    setMenuState(false);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 820) setMenuState(false);
});

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
let scrollFrame;

const updateTimeline = () => {
  if (!timeline) return;

  const rect = timeline.getBoundingClientRect();
  const start = window.innerHeight * 0.84;
  const end = window.innerHeight * 0.24;
  const progress = clamp((start - rect.top) / (rect.height + start - end));
  timeline.style.setProperty("--timeline-progress", progress.toFixed(3));
};

const updateScrollUI = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
  backToTop?.classList.toggle("is-visible", window.scrollY > 600);
  updateTimeline();
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

const resetPointerEffects = () => {
  document.querySelectorAll("[data-tilt]").forEach((item) => {
    item.style.setProperty("--tilt-x", "0deg");
    item.style.setProperty("--tilt-y", "0deg");
  });

  document.querySelectorAll(".magnetic-action").forEach((item) => {
    item.style.setProperty("--magnetic-x", "0px");
    item.style.setProperty("--magnetic-y", "0px");
  });
};

const enablePointerEffects = () => {
  if (!finePointer.matches || reducedMotion.matches) {
    resetPointerEffects();
    return;
  }

  document.querySelectorAll("[data-tilt]").forEach((item) => {
    if (item.dataset.tiltReady) return;
    item.dataset.tiltReady = "true";
    let rect;
    let tiltFrame;

    item.addEventListener("pointerenter", () => {
      rect = item.getBoundingClientRect();
    });

    item.addEventListener("pointermove", (event) => {
      if (!rect || tiltFrame) return;

      tiltFrame = window.requestAnimationFrame(() => {
        const x = clamp((event.clientX - rect.left) / rect.width);
        const y = clamp((event.clientY - rect.top) / rect.height);
        item.style.setProperty("--tilt-x", `${((0.5 - y) * 5.5).toFixed(2)}deg`);
        item.style.setProperty("--tilt-y", `${((x - 0.5) * 5.5).toFixed(2)}deg`);
        tiltFrame = undefined;
      });
    });

    item.addEventListener("pointerleave", () => {
      rect = undefined;
      item.style.setProperty("--tilt-x", "0deg");
      item.style.setProperty("--tilt-y", "0deg");
    });
  });

  document.querySelectorAll(".magnetic-action").forEach((item) => {
    if (item.dataset.magneticReady) return;
    item.dataset.magneticReady = "true";
    let rect;

    item.addEventListener("pointerenter", () => {
      rect = item.getBoundingClientRect();
    });

    item.addEventListener("pointermove", (event) => {
      if (!rect) return;
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 4;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 3;
      item.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
      item.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
    });

    item.addEventListener("pointerleave", () => {
      rect = undefined;
      item.style.setProperty("--magnetic-x", "0px");
      item.style.setProperty("--magnetic-y", "0px");
    });
  });
};

enablePointerEffects();
finePointer.addEventListener?.("change", enablePointerEffects);
reducedMotion.addEventListener?.("change", () => {
  if (reducedMotion.matches) {
    revealItems.forEach((item) => item.classList.add("is-revealed"));
  }
  enablePointerEffects();
});

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
