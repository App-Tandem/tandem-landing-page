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
    }
  });
});

// App/Play store popover
const storePopover = document.createElement("div");
storePopover.className = "storePopover";
storePopover.setAttribute("role", "status");
storePopover.setAttribute("aria-live", "polite");
storePopover.textContent = "Comming soon.";
document.body.appendChild(storePopover);

let storePopoverTimeout;
document.querySelectorAll(".storeButton").forEach(button => {
  button.addEventListener("click", () => {
    const rect = button.getBoundingClientRect();
    storePopover.style.left = `${rect.left + rect.width / 2}px`;
    storePopover.style.top = `${rect.top - 8}px`;
    storePopover.classList.add("isVisible");

    clearTimeout(storePopoverTimeout);
    storePopoverTimeout = setTimeout(() => {
      storePopover.classList.remove("isVisible");
    }, 1800);
  });
});

window.addEventListener("resize", () => {
  storePopover.classList.remove("isVisible");
});

// Simple scroll fade-in animations for sections
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Apply animations to sections
[".features", ".howItWorks", ".appPreview", ".testimonials", ".downloadCta"].forEach(selector => {
  const el = document.querySelector(selector);
  if (el) {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  }
});
