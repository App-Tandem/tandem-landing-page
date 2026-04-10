// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      // Close mobile menu if open
      const nav = document.getElementById("headerNav");
      const btn = document.getElementById("hamburger");
      if (nav && nav.classList.contains("open")) {
        nav.classList.remove("open");
        btn.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    }
  });
});

// Hamburger menu toggle
const hamburger = document.getElementById("hamburger");
const headerNav = document.getElementById("headerNav");

if (hamburger && headerNav) {
  hamburger.addEventListener("click", () => {
    const isOpen = headerNav.classList.toggle("open");
    hamburger.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

// Sticky download bar — show when hero leaves viewport
const hero = document.getElementById("hero");
const stickyBar = document.getElementById("stickyBar");

if (hero && stickyBar) {
  const stickyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        stickyBar.classList.toggle("visible", !entry.isIntersecting);
      });
    },
    { threshold: 0, rootMargin: "-60px 0px 0px 0px" }
  );
  stickyObserver.observe(hero);
}

// Scroll fade-in animations — staggered per section
const observerOptions = {
  threshold: 0.08,
  rootMargin: "0px 0px -50px 0px"
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fadeInVisible");

      // Stagger child cards if present
      const cards = entry.target.querySelectorAll(
        ".featureCard, .benefitItem, .testimonialCard, .previewPhone, .compRow:not(.compHeader), .faqItem"
      );
      cards.forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.08}s`;
        card.classList.add("fadeInVisible");
      });
    }
  });
}, observerOptions);

const animatedSections = [
  ".features", ".comparison", ".howItWorks", ".appPreview",
  ".testimonials", ".guidesTeaser", ".faq", ".downloadCta"
];

animatedSections.forEach(selector => {
  const el = document.querySelector(selector);
  if (el) {
    el.classList.add("fadeInReady");

    // Prepare child cards for staggered animation
    const cards = el.querySelectorAll(
      ".featureCard, .benefitItem, .testimonialCard, .previewPhone, .compRow:not(.compHeader), .faqItem"
    );
    cards.forEach(card => card.classList.add("fadeInReady"));

    sectionObserver.observe(el);
  }
});

// Inject animation styles
const style = document.createElement("style");
style.textContent = `
  .fadeInReady {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .fadeInVisible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);
