const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = document.querySelectorAll("main section[id]");
const backToTop = document.querySelector(".back-to-top");
const year = document.querySelector("#year");
const projectImages = document.querySelectorAll(".project-media img");

year.textContent = new Date().getFullYear();

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

sectionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

projectImages.forEach((image) => {
  if (image.complete && image.naturalWidth === 0) {
    image.classList.add("missing");
    image.setAttribute("aria-hidden", "true");
  }

  image.addEventListener("error", () => {
    image.classList.add("missing");
    image.setAttribute("aria-hidden", "true");
  });
});

const updateActiveLink = () => {
  let currentSection = "home";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 130;
    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute("id");
    }
  });

  sectionLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentSection}`);
  });
};

const updateBackToTop = () => {
  backToTop.classList.toggle("show", window.scrollY > 500);
};

window.addEventListener("scroll", () => {
  updateActiveLink();
  updateBackToTop();
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

updateActiveLink();
updateBackToTop();
