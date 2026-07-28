document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-links");
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const anchorLinks = [
  ...document.querySelectorAll('a[href^="#"]:not(.skip-link)'),
];
const sections = [...document.querySelectorAll("main section[id]")];
const backToTop = document.querySelector(".back-to-top");
const footer = document.querySelector(".site-footer");
const hero = document.querySelector("[data-parallax-root]");
const year = document.querySelector("#current-year");
const accordionButtons = document.querySelectorAll(".project-details-toggle");
const timeline = document.querySelector("[data-timeline]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (min-width: 900px)",
);

const gsapApi = window.gsap;
const scrollTriggerApi = window.ScrollTrigger;
const LenisApi = window.Lenis;
const motionLibrariesReady = Boolean(gsapApi && scrollTriggerApi);

let lenis;
let lenisTicker;
let scrollFrame;
const pointerSetters = new WeakMap();

if (year) {
  year.textContent = new Date().getFullYear();
}

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

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

const updateActiveNavigation = (hash) => {
  navLinks.forEach((link) => {
    const isCurrent = link.getAttribute("href") === hash;
    link.classList.toggle("is-active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
};

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") !== "true";
  setMenuState(isOpen, isOpen);
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

const startLenis = () => {
  if (
    lenis ||
    !LenisApi ||
    !motionLibrariesReady ||
    reducedMotion.matches ||
    !finePointer.matches
  ) {
    return;
  }

  lenis = new LenisApi({
    autoRaf: false,
    duration: 0.92,
    easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)),
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.96,
    touchMultiplier: 1,
    overscroll: true,
  });

  lenis.on("scroll", scrollTriggerApi.update);
  lenisTicker = (time) => lenis?.raf(time * 1000);
  gsapApi.ticker.add(lenisTicker);
  document.documentElement.classList.add("smooth-scroll-active");
};

const stopLenis = () => {
  if (!lenis) return;

  if (lenisTicker) gsapApi?.ticker.remove(lenisTicker);
  lenis.destroy();
  lenis = undefined;
  lenisTicker = undefined;
  document.documentElement.classList.remove("smooth-scroll-active");
};

const syncLenis = () => {
  if (finePointer.matches && !reducedMotion.matches) startLenis();
  else stopLenis();
};

const getHeaderOffset = () => (header?.offsetHeight || 0) + 18;

const scrollToElement = (target, { immediate = false } = {}) => {
  const offset = getHeaderOffset();

  if (lenis && !reducedMotion.matches) {
    lenis.scrollTo(target, {
      offset,
      duration: immediate ? 0 : 0.86,
      immediate,
    });
    return;
  }

  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: immediate || reducedMotion.matches ? "auto" : "smooth",
  });
};

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    const target = document.getElementById(hash.slice(1));
    if (!target) return;

    event.preventDefault();
    setMenuState(false);
    updateActiveNavigation(hash);
    scrollToElement(target);

    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }
  });
});

window.addEventListener("popstate", () => {
  if (!window.location.hash) {
    if (lenis && !reducedMotion.matches) lenis.scrollTo(0, { duration: 0.72 });
    else window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    return;
  }

  const target = document.getElementById(window.location.hash.slice(1));
  if (target) scrollToElement(target);
});

const updateFallbackTimeline = () => {
  if (!timeline || motionLibrariesReady) return;

  const rect = timeline.getBoundingClientRect();
  const start = window.innerHeight * 0.84;
  const end = window.innerHeight * 0.24;
  const progress = clamp((start - rect.top) / (rect.height + start - end));
  timeline.style.setProperty("--timeline-progress", progress.toFixed(3));
};

const updateScrollUI = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
  backToTop?.classList.toggle("is-visible", window.scrollY > 600);
  updateFallbackTimeline();
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
  if (lenis && !reducedMotion.matches) {
    lenis.scrollTo(0, { duration: 0.82 });
  } else {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  }
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

    window.requestAnimationFrame(() => scrollTriggerApi?.refresh());
  });
});

const resetPointerEffects = () => {
  hero?.querySelectorAll("[data-pointer-depth]").forEach((item) => {
    gsapApi?.killTweensOf(item, "--pointer-x,--pointer-y");
    item.style.setProperty("--pointer-x", "0px");
    item.style.setProperty("--pointer-y", "0px");
  });

  document.querySelectorAll("[data-tilt]").forEach((item) => {
    item.style.setProperty("--tilt-x", "0deg");
    item.style.setProperty("--tilt-y", "0deg");
  });

  document.querySelectorAll(".magnetic-action").forEach((item) => {
    item.style.setProperty("--magnetic-x", "0px");
    item.style.setProperty("--magnetic-y", "0px");
  });
};

const getPointerSetters = (item) => {
  if (!gsapApi) return null;
  if (!pointerSetters.has(item)) {
    pointerSetters.set(item, {
      x: gsapApi.quickTo(item, "--pointer-x", {
        duration: 0.32,
        ease: "power3.out",
      }),
      y: gsapApi.quickTo(item, "--pointer-y", {
        duration: 0.32,
        ease: "power3.out",
      }),
    });
  }
  return pointerSetters.get(item);
};

const enablePointerEffects = () => {
  if (!finePointer.matches || reducedMotion.matches) {
    resetPointerEffects();
    return;
  }

  if (hero && !hero.dataset.parallaxReady) {
    hero.dataset.parallaxReady = "true";
    let parallaxFrame;

    hero.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || reducedMotion.matches || parallaxFrame) return;

      parallaxFrame = window.requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width) - 0.5;
        const y = clamp((event.clientY - rect.top) / rect.height) - 0.5;

        hero.querySelectorAll("[data-pointer-depth]").forEach((item) => {
          const depth = Number(item.dataset.pointerDepth) || 6;
          const pointerX = `${(x * depth).toFixed(2)}px`;
          const pointerY = `${(y * depth * 0.55).toFixed(2)}px`;
          const setters = getPointerSetters(item);

          if (setters) {
            setters.x(pointerX);
            setters.y(pointerY);
          } else {
            item.style.setProperty("--pointer-x", pointerX);
            item.style.setProperty("--pointer-y", pointerY);
          }
        });
        parallaxFrame = undefined;
      });
    });

    hero.addEventListener("pointerleave", () => {
      hero.querySelectorAll("[data-pointer-depth]").forEach((item) => {
        const setters = getPointerSetters(item);
        if (setters) {
          setters.x("0px");
          setters.y("0px");
        } else {
          item.style.setProperty("--pointer-x", "0px");
          item.style.setProperty("--pointer-y", "0px");
        }
      });
    });
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
      if (
        !rect ||
        tiltFrame ||
        !finePointer.matches ||
        reducedMotion.matches
      ) {
        return;
      }

      tiltFrame = window.requestAnimationFrame(() => {
        const x = clamp((event.clientX - rect.left) / rect.width);
        const y = clamp((event.clientY - rect.top) / rect.height);
        item.style.setProperty("--tilt-x", `${((0.5 - y) * 5).toFixed(2)}deg`);
        item.style.setProperty("--tilt-y", `${((x - 0.5) * 5).toFixed(2)}deg`);
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
      if (!rect || !finePointer.matches || reducedMotion.matches) return;
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

const initializeGsapMotion = () => {
  if (!motionLibrariesReady) {
    document.documentElement.classList.add("motion-fallback");
    return;
  }

  gsapApi.registerPlugin(scrollTriggerApi);
  document.documentElement.classList.add("motion-enhanced");

  const motionMedia = gsapApi.matchMedia();

  motionMedia.add(
    {
      allowMotion: "(prefers-reduced-motion: no-preference)",
      desktop: "(min-width: 821px)",
    },
    (context) => {
      if (!context.conditions.allowMotion) return undefined;

      const revealDistance = context.conditions.desktop ? 24 : 16;
      const heroCopy = document.querySelector('.hero-copy[data-reveal="hero"]');
      const heroPortrait = document.querySelector('.hero-portrait[data-reveal="media"]');
      const availability = heroPortrait?.querySelector(".portrait-availability");

      if (heroCopy) {
        const heroItems = [...heroCopy.children];
        const heroTimeline = gsapApi.timeline({
          defaults: { ease: "power3.out" },
        });

        gsapApi.set(heroItems, { autoAlpha: 0, y: 14 });
        if (heroPortrait) {
          gsapApi.set(heroPortrait, {
            autoAlpha: 0,
            clipPath: "inset(0 0 0 10%)",
          });
        }
        if (availability) gsapApi.set(availability, { autoAlpha: 0 });

        heroTimeline
          .to(heroItems, {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.06,
          })
          .to(
            heroPortrait,
            {
              autoAlpha: 1,
              clipPath: "inset(0 0 0 0%)",
              duration: 0.88,
            },
            0.12,
          )
          .to(
            availability,
            {
              autoAlpha: 1,
              duration: 0.46,
            },
            0.48,
          );
      }

      const contentReveals = gsapApi.utils
        .toArray("[data-reveal]")
        .filter(
          (item) =>
            item.dataset.reveal !== "hero" &&
            item.dataset.reveal !== "media",
        );
      const mediaReveals = gsapApi.utils
        .toArray('[data-reveal="media"]')
        .filter((item) => item !== heroPortrait);

      gsapApi.set(contentReveals, { autoAlpha: 0, y: revealDistance });
      scrollTriggerApi.batch(contentReveals, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsapApi.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.78,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true,
          }),
      });

      gsapApi.set(mediaReveals, {
        autoAlpha: 0,
        clipPath: "inset(0 0 0 9%)",
      });
      scrollTriggerApi.batch(mediaReveals, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsapApi.to(batch, {
            autoAlpha: 1,
            clipPath: "inset(0 0 0 0%)",
            duration: 0.86,
            ease: "power3.out",
            stagger: 0.06,
            overwrite: true,
          }),
      });

      if (timeline) {
        gsapApi.fromTo(
          timeline,
          { "--timeline-progress": 0 },
          {
            "--timeline-progress": 1,
            ease: "none",
            scrollTrigger: {
              trigger: timeline,
              start: "top 84%",
              end: "bottom 28%",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      if (context.conditions.desktop && hero) {
        const atmosphere = hero.querySelector('[data-scroll-depth="atmosphere"]');
        const portraitFrame = hero.querySelector(
          '[data-scroll-depth="portrait-frame"]',
        );
        const portraitImage = hero.querySelector(
          '[data-scroll-depth="portrait-image"]',
        );
        const availabilityCard = hero.querySelector(
          '[data-scroll-depth="availability"]',
        );
        const heroScrollTrigger = {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
          invalidateOnRefresh: true,
        };

        gsapApi.fromTo(
          atmosphere,
          { "--atmosphere-depth": "-10px" },
          {
            "--atmosphere-depth": "24px",
            ease: "none",
            scrollTrigger: heroScrollTrigger,
          },
        );
        gsapApi.fromTo(
          portraitFrame,
          { "--scroll-depth": "3px" },
          {
            "--scroll-depth": "-10px",
            ease: "none",
            scrollTrigger: heroScrollTrigger,
          },
        );
        gsapApi.fromTo(
          portraitImage,
          { "--image-depth": "-6px" },
          {
            "--image-depth": "7px",
            ease: "none",
            scrollTrigger: heroScrollTrigger,
          },
        );
        gsapApi.fromTo(
          availabilityCard,
          { "--availability-depth": "2px" },
          {
            "--availability-depth": "-5px",
            ease: "none",
            scrollTrigger: heroScrollTrigger,
          },
        );

        const featuredImage = document.querySelector(
          '[data-scroll-depth="project-image"]',
        );
        if (featuredImage) {
          gsapApi.fromTo(
            featuredImage,
            { "--project-image-depth": "-4px" },
            {
              "--project-image-depth": "4px",
              ease: "none",
              scrollTrigger: {
                trigger: featuredImage.closest(".featured-media"),
                start: "top bottom",
                end: "bottom top",
                scrub: 0.7,
                invalidateOnRefresh: true,
              },
            },
          );
        }

        document.querySelectorAll(".skills, .journey").forEach((section) => {
          gsapApi.fromTo(
            section,
            { "--section-wash-y": "-18px" },
            {
              "--section-wash-y": "22px",
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      }

      return () => {
        document
          .querySelectorAll("[data-reveal]")
          .forEach((item) => item.removeAttribute("style"));
      };
    },
  );

  const refreshMotion = () => scrollTriggerApi.refresh();
  document.fonts?.ready.then(refreshMotion);
  window.addEventListener("load", refreshMotion, { once: true });
};

enablePointerEffects();
initializeGsapMotion();
syncLenis();

finePointer.addEventListener?.("change", () => {
  enablePointerEffects();
  syncLenis();
});

reducedMotion.addEventListener?.("change", () => {
  enablePointerEffects();
  syncLenis();
});

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        updateActiveNavigation(`#${entry.target.id}`);
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
}
