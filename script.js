document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-links");
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const anchorLinks = [...document.querySelectorAll('a[href^="#"]:not(.skip-link)')];
const sections = [...document.querySelectorAll("main section[id]")];
const backToTop = document.querySelector(".back-to-top");
const footer = document.querySelector(".site-footer");
const hero = document.querySelector("[data-parallax-root]");
const timeline = document.querySelector("[data-timeline]");
const year = document.querySelector("#current-year");
const accordionButtons = document.querySelectorAll(".project-details-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (min-width: 900px)",
);

const gsapApi = window.gsap;
const scrollTriggerApi = window.ScrollTrigger;
const LenisApi = window.Lenis;
const motionLibrariesReady = Boolean(gsapApi && scrollTriggerApi);
const pointerSetters = new WeakMap();

let lenis;
let lenisTicker;
let scrollFrame;

if (year) year.textContent = new Date().getFullYear();

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

  if (isOpen && moveFocus) navMenu.querySelector("a")?.focus();
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
    duration: 0.68,
    easing: (value) => 1 - (1 - value) ** 4,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1,
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
      duration: immediate ? 0 : 0.68,
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
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
  });
});

window.addEventListener("popstate", () => {
  if (!window.location.hash) {
    if (lenis && !reducedMotion.matches) lenis.scrollTo(0, { duration: 0.62 });
    else {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion.matches ? "auto" : "smooth",
      });
    }
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
  backToTop?.classList.toggle("is-visible", window.scrollY > 500);
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
  if (lenis && !reducedMotion.matches) lenis.scrollTo(0, { duration: 0.66 });
  else {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
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
    gsapApi?.killTweensOf(item);
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
        duration: 0.38,
        ease: "power3.out",
      }),
      y: gsapApi.quickTo(item, "--pointer-y", {
        duration: 0.38,
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

    hero.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      const rect = hero.getBoundingClientRect();
      const x = (clamp((event.clientX - rect.left) / rect.width) - 0.5) * 2;
      const y = (clamp((event.clientY - rect.top) / rect.height) - 0.5) * 2;

      hero.querySelectorAll("[data-pointer-depth]").forEach((item) => {
        const depth = Number(item.dataset.pointerDepth) || 6;
        const setters = getPointerSetters(item);
        const pointerX = `${(x * depth).toFixed(2)}px`;
        const pointerY = `${(y * depth * 0.55).toFixed(2)}px`;
        if (setters) {
          setters.x(pointerX);
          setters.y(pointerY);
        }
      });
    });

    hero.addEventListener("pointerleave", () => {
      hero.querySelectorAll("[data-pointer-depth]").forEach((item) => {
        const setters = getPointerSetters(item);
        setters?.x("0px");
        setters?.y("0px");
      });
    });
  }

  document.querySelectorAll("[data-tilt]").forEach((item) => {
    if (item.dataset.tiltReady) return;
    item.dataset.tiltReady = "true";
    let rect;

    item.addEventListener("pointerenter", () => {
      rect = item.getBoundingClientRect();
    });

    item.addEventListener("pointermove", (event) => {
      if (!rect || !finePointer.matches || reducedMotion.matches) return;
      const x = clamp((event.clientX - rect.left) / rect.width);
      const y = clamp((event.clientY - rect.top) / rect.height);
      item.style.setProperty("--tilt-x", `${((0.5 - y) * 5).toFixed(2)}deg`);
      item.style.setProperty("--tilt-y", `${((x - 0.5) * 5).toFixed(2)}deg`);
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

const addOnceTrigger = (timelineInstance, trigger, start = "top 84%") => {
  scrollTriggerApi.create({
    animation: timelineInstance,
    trigger,
    start,
    once: true,
  });
  return timelineInstance;
};

const animateHeading = (timelineInstance, heading, position = 0, distance = 28) => {
  if (!heading) return;
  const label = heading.querySelector(".eyebrow");
  const title = heading.querySelector("h2");
  const support = [...heading.children].find(
    (item) => item.matches("p") && !item.matches(".eyebrow"),
  );

  if (label) {
    timelineInstance.from(label, {
      autoAlpha: 0,
      y: distance,
      duration: 0.65,
    }, position);
  }
  if (title) {
    timelineInstance.fromTo(
      title,
      {
        autoAlpha: 0,
        y: distance + 6,
        clipPath: "inset(0 0 100% 0)",
      },
      {
        autoAlpha: 1,
        y: 0,
        clipPath: "inset(0 0 0% 0)",
        duration: 0.78,
      },
      position + 0.1,
    );
  }
  if (support) {
    timelineInstance.from(support, {
      autoAlpha: 0,
      y: distance,
      duration: 0.7,
    }, position + 0.22);
  }
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
      reduceMotion: "(prefers-reduced-motion: reduce)",
      desktop: "(min-width: 821px)",
    },
    (context) => {
      if (context.conditions.reduceMotion) {
        gsapApi.set("[data-reveal], [data-scroll-depth]", {
          clearProps: "all",
        });
        timeline?.style.setProperty("--timeline-progress", "1");
        document.querySelector(".direction")?.style.setProperty(
          "--direction-progress",
          "1",
        );
        return undefined;
      }

      if (!context.conditions.allowMotion) return undefined;

      const desktop = context.conditions.desktop;
      const distance = desktop ? 30 : 20;
      const heroCopy = document.querySelector(".hero-copy");
      const heroPortrait = document.querySelector(".hero-portrait");
      const portraitFrame = heroPortrait?.querySelector(".portrait-frame");
      const portraitImage = portraitFrame?.querySelector("img");
      const availability = heroPortrait?.querySelector(".portrait-availability");
      const portraitCaption = heroPortrait?.querySelector("figcaption");

      if (heroCopy) {
        const kicker = heroCopy.querySelector(".section-kicker");
        const intro = heroCopy.querySelector(".hero-intro");
        const name = heroCopy.querySelector("h1");
        const role = heroCopy.querySelector(".hero-role");
        const summary = heroCopy.querySelector(".hero-summary");
        const actions = heroCopy.querySelector(".hero-actions");
        const meta = heroCopy.querySelector(".hero-meta");
        const socials = heroCopy.querySelector(".hero-socials");
        const heroEntrance = gsapApi.timeline({
          defaults: { ease: "power3.out" },
        });

        heroEntrance
          .from(kicker, {
            autoAlpha: 0,
            y: desktop ? 30 : 20,
            duration: 0.68,
          })
          .from(intro, {
            autoAlpha: 0,
            y: desktop ? 28 : 18,
            duration: 0.66,
          }, 0.14)
          .fromTo(
            name,
            {
              autoAlpha: 0,
              y: desktop ? 42 : 28,
              clipPath: "inset(0 0 100% 0)",
            },
            {
              autoAlpha: 1,
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: 0.86,
            },
            0.26,
          )
          .from([role, summary], {
            autoAlpha: 0,
            y: desktop ? 32 : 22,
            duration: 0.72,
            stagger: 0.1,
          }, 0.48)
          .from(actions, {
            autoAlpha: 0,
            y: desktop ? 30 : 20,
            duration: 0.7,
          }, 0.72)
          .fromTo(
            portraitFrame,
            {
              autoAlpha: 0,
              clipPath: "inset(0 100% 0 0)",
            },
            {
              autoAlpha: 1,
              clipPath: "inset(0 0% 0 0)",
              duration: 0.9,
            },
            0.6,
          )
          .fromTo(
            portraitImage,
            { "--image-scale": 1.09 },
            { "--image-scale": 1.04, duration: 0.92 },
            0.6,
          )
          .from(availability, {
            autoAlpha: 0,
            x: desktop ? 38 : 24,
            duration: 0.7,
          }, 0.96)
          .from([meta, portraitCaption], {
            autoAlpha: 0,
            y: desktop ? 24 : 16,
            duration: 0.64,
            stagger: 0.08,
          }, 1.02)
          .from(socials, {
            autoAlpha: 0,
            y: desktop ? 18 : 12,
            duration: 0.58,
          }, 1.1);
      }

      const aboutSection = document.querySelector("#about");
      if (aboutSection) {
        const aboutMotion = gsapApi.timeline({ defaults: { ease: "power3.out" } });
        animateHeading(aboutMotion, aboutSection.querySelector(".editorial-heading"), 0, distance);
        aboutMotion
          .from(aboutSection.querySelectorAll(".prose p"), {
            autoAlpha: 0,
            y: distance,
            duration: 0.72,
            stagger: 0.08,
          }, 0.3)
          .from(aboutSection.querySelector(".focus-note"), {
            autoAlpha: 0,
            x: desktop ? 30 : 20,
            duration: 0.76,
          }, 0.44);
        addOnceTrigger(aboutMotion, aboutSection, "top 80%");
      }

      const skillsSection = document.querySelector("#skills");
      if (skillsSection) {
        const skillsMotion = gsapApi.timeline({ defaults: { ease: "power3.out" } });
        animateHeading(skillsMotion, skillsSection.querySelector(".split-heading"), 0, distance);
        skillsMotion.from(skillsSection.querySelectorAll(".skill-group"), {
          autoAlpha: 0,
          y: desktop ? 32 : 24,
          duration: 0.72,
          stagger: 0.1,
        }, 0.34);
        addOnceTrigger(skillsMotion, skillsSection, "top 80%");
      }

      const projectsSection = document.querySelector("#projects");
      const projectHeading = projectsSection?.querySelector(":scope > .split-heading");
      if (projectHeading) {
        const projectsHeadingMotion = gsapApi.timeline({
          defaults: { ease: "power3.out" },
        });
        animateHeading(projectsHeadingMotion, projectHeading, 0, distance);
        addOnceTrigger(projectsHeadingMotion, projectHeading, "top 82%");
      }

      const featuredProject = document.querySelector(".featured-project");
      if (featuredProject) {
        const featuredMedia = featuredProject.querySelector(".featured-media");
        const featuredImage = featuredMedia?.querySelector("img");
        const featuredItems = featuredProject.querySelectorAll(
          ".featured-copy > *:not(.project-label)",
        );
        const featuredMotion = gsapApi.timeline({
          defaults: { ease: "power3.out" },
        });
        featuredMotion
          .from(featuredProject.querySelector(".project-label"), {
            autoAlpha: 0,
            y: distance,
            duration: 0.64,
          })
          .fromTo(
            featuredMedia,
            {
              autoAlpha: 0,
              clipPath: "inset(0 100% 0 0)",
            },
            {
              autoAlpha: 1,
              clipPath: "inset(0 0% 0 0)",
              duration: 0.9,
            },
            0.1,
          )
          .fromTo(
            featuredImage,
            { "--project-image-scale": 1.08 },
            { "--project-image-scale": 1.05, duration: 0.95 },
            0.1,
          )
          .from(featuredItems, {
            autoAlpha: 0,
            x: desktop ? 34 : 22,
            duration: 0.72,
            stagger: 0.07,
          }, 0.24);
        addOnceTrigger(featuredMotion, featuredProject, "top 82%");
      }

      const projectGrid = document.querySelector(".project-grid");
      if (projectGrid) {
        const cards = projectGrid.querySelectorAll(".project-card");
        const cardMedia = projectGrid.querySelectorAll(".project-card-media");
        const cardImages = projectGrid.querySelectorAll(".project-card-media img");
        const cardsMotion = gsapApi.timeline({ defaults: { ease: "power3.out" } });
        cardsMotion
          .from(cards, {
            autoAlpha: 0,
            y: desktop ? 36 : 26,
            duration: 0.72,
            stagger: 0.1,
          })
          .fromTo(
            cardMedia,
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 0.76,
              stagger: 0.1,
            },
            0.08,
          )
          .fromTo(
            cardImages,
            { "--card-image-scale": 1.08 },
            {
              "--card-image-scale": 1.04,
              duration: 0.82,
              stagger: 0.1,
            },
            0.08,
          );
        addOnceTrigger(cardsMotion, projectGrid, "top 84%");
      }

      const projectArchive = document.querySelector(".project-archive");
      if (projectArchive) {
        const archiveMotion = gsapApi.from(projectArchive, {
          autoAlpha: 0,
          y: distance,
          duration: 0.72,
          ease: "power3.out",
          paused: true,
        });
        addOnceTrigger(archiveMotion, projectArchive, "top 86%");
      }

      const journeySection = document.querySelector("#journey");
      if (journeySection) {
        const journeyMotion = gsapApi.timeline({ defaults: { ease: "power3.out" } });
        animateHeading(journeyMotion, journeySection.querySelector(".split-heading"), 0, distance);
        journeyMotion
          .from(journeySection.querySelector(".education-block"), {
            autoAlpha: 0,
            y: desktop ? 34 : 24,
            duration: 0.74,
          }, 0.3)
          .from(journeySection.querySelector(".learning-block"), {
            autoAlpha: 0,
            y: desktop ? 30 : 22,
            duration: 0.74,
          }, 0.42);
        addOnceTrigger(journeyMotion, journeySection, "top 80%");
      }

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
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      const direction = document.querySelector(".direction");
      if (direction) {
        const directionMotion = gsapApi.timeline({ defaults: { ease: "power3.out" } });
        directionMotion
          .from(direction.querySelector(".direction-heading"), {
            autoAlpha: 0,
            y: distance,
            duration: 0.7,
          })
          .fromTo(
            direction,
            { "--direction-progress": 0 },
            { "--direction-progress": 1, duration: 0.72 },
            0.12,
          )
          .from(direction.querySelectorAll("li"), {
            autoAlpha: 0,
            y: desktop ? 28 : 20,
            duration: 0.68,
            stagger: 0.12,
          }, 0.18);
        addOnceTrigger(directionMotion, direction, "top 84%");
      }

      const resumeBand = document.querySelector(".resume-band .section-shell");
      if (resumeBand) {
        const resumeMotion = gsapApi.from(resumeBand.children, {
          autoAlpha: 0,
          y: distance,
          duration: 0.72,
          stagger: 0.1,
          ease: "power3.out",
          paused: true,
        });
        addOnceTrigger(resumeMotion, resumeBand, "top 86%");
      }

      const contactSection = document.querySelector("#contact");
      if (contactSection) {
        const contactHeading = contactSection.querySelector(".contact-heading");
        const contactRows = contactSection.querySelectorAll(".contact-list > *");
        const contactMotion = gsapApi.timeline({ defaults: { ease: "power3.out" } });
        contactMotion
          .from(contactHeading.querySelector(".eyebrow"), {
            autoAlpha: 0,
            y: distance,
            duration: 0.62,
          })
          .fromTo(
            contactHeading.querySelector("h2"),
            {
              autoAlpha: 0,
              y: distance + 6,
              clipPath: "inset(0 0 100% 0)",
            },
            {
              autoAlpha: 1,
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: 0.78,
            },
            0.1,
          )
          .from(contactHeading.querySelector(":scope > p:not(.eyebrow)"), {
            autoAlpha: 0,
            y: distance,
            duration: 0.68,
          }, 0.22)
          .from(contactRows, {
            autoAlpha: 0,
            y: desktop ? 22 : 16,
            duration: 0.6,
            stagger: 0.08,
          }, 0.3)
          .from(contactHeading.querySelector(".button"), {
            autoAlpha: 0,
            y: desktop ? 24 : 16,
            duration: 0.66,
          }, 0.64);
        addOnceTrigger(contactMotion, contactSection, "top 82%");
      }

      const atmosphere = hero?.querySelector('[data-scroll-depth="atmosphere"]');
      const heroFrame = hero?.querySelector('[data-scroll-depth="portrait-frame"]');
      const heroImage = hero?.querySelector('[data-scroll-depth="portrait-image"]');
      const availabilityCard = hero?.querySelector('[data-scroll-depth="availability"]');

      if (hero && atmosphere && heroFrame && heroImage && availabilityCard) {
        const heroDepth = gsapApi.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        });
        const heroDepthScale = desktop ? 1 : 0.5;
        heroDepth
          .fromTo(
            atmosphere,
            { "--atmosphere-depth": `${-16 * heroDepthScale}px` },
            {
              "--atmosphere-depth": `${24 * heroDepthScale}px`,
              ease: "none",
            },
            0,
          )
          .fromTo(
            heroFrame,
            { "--scroll-depth": `${9 * heroDepthScale}px` },
            {
              "--scroll-depth": `${-9 * heroDepthScale}px`,
              ease: "none",
            },
            0,
          )
          .fromTo(
            heroImage,
            { "--image-depth": `${-6 * heroDepthScale}px` },
            {
              "--image-depth": `${8 * heroDepthScale}px`,
              ease: "none",
            },
            0,
          )
          .fromTo(
            availabilityCard,
            { "--availability-depth": `${5 * heroDepthScale}px` },
            {
              "--availability-depth": `${-7 * heroDepthScale}px`,
              ease: "none",
            },
            0,
          );
      }

      const aboutAccent = document.querySelector("#about");
      if (aboutAccent) {
        gsapApi.fromTo(
          aboutAccent,
          { "--about-accent-y": desktop ? "-16px" : "-8px" },
          {
            "--about-accent-y": desktop ? "18px" : "9px",
            ease: "none",
            scrollTrigger: {
              trigger: aboutAccent,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      const featuredImage = document.querySelector('[data-scroll-depth="project-image"]');
      if (featuredImage) {
        const projectDepth = desktop ? 12 : 6;
        gsapApi.fromTo(
          featuredImage,
          { "--project-image-depth": `${-projectDepth}px` },
          {
            "--project-image-depth": `${projectDepth}px`,
            ease: "none",
            scrollTrigger: {
              trigger: featuredImage.closest(".featured-media"),
              start: "top bottom",
              end: "bottom top",
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      document
        .querySelectorAll('[data-scroll-depth="supporting-project-image"]')
        .forEach((image) => {
          const projectDepth = desktop ? 6 : 3;
          gsapApi.fromTo(
            image,
            { "--supporting-image-depth": `${-projectDepth}px` },
            {
              "--supporting-image-depth": `${projectDepth}px`,
              ease: "none",
              scrollTrigger: {
                trigger: image.closest(".project-card-media"),
                start: "top bottom",
                end: "bottom top",
                scrub: 0.4,
                invalidateOnRefresh: true,
              },
            },
          );
        });

      return () => resetPointerEffects();
    },
  );

  const updateTriggerCount = () => {
    document.documentElement.dataset.scrollTriggerCount = String(
      scrollTriggerApi.getAll().length,
    );
  };
  scrollTriggerApi.addEventListener("refresh", updateTriggerCount);
  document.fonts?.ready.then(() => {
    scrollTriggerApi.refresh();
    updateTriggerCount();
  });
  window.addEventListener(
    "load",
    () => {
      scrollTriggerApi.refresh();
      updateTriggerCount();
    },
    { once: true },
  );
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
        if (entry.isIntersecting) updateActiveNavigation(`#${entry.target.id}`);
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
