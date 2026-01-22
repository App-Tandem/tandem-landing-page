// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/**
 * Google Sheets collector via Google Apps Script Web App.
 * Paste your deployed Web App URL below.
 */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyKg0QohFyO0_Zusa3py0A5GczQ6NW7lWsSf2evIXhU8FfUfACWXBmkqyqdFDad9ub1/exec";

const form = document.getElementById("waitlist");
const statusEl = document.getElementById("status");
const emailEl = document.getElementById("email");
const hpEl = document.getElementById("website");

if (form && statusEl && emailEl) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "Submitting…";

    const email = (emailEl.value || "").trim();
    const honeypot = hpEl ? (hpEl.value || "").trim() : "";

    // If bot filled honeypot, pretend success
    if (honeypot) {
      form.reset();
      statusEl.textContent = "You’re on the waitlist 🎉";
      return;
    }

    try {
      // no-cors prevents CORS issues with Apps Script
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams({ email, website: honeypot }).toString(),
      });

      form.reset();
      statusEl.textContent = "You’re on the waitlist 🎉";
    } catch {
      statusEl.textContent = "Network error — please try again.";
    }
  });
}
