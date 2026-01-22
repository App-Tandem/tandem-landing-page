// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// AJAX submit for Formspree (keeps user on the same page)
const form = document.getElementById("waitlist");
const statusEl = document.getElementById("status");

if (form && statusEl) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "Submitting…";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });

      if (res.ok) {
        form.reset();
        statusEl.textContent = "You’re on the waitlist 🎉";
      } else {
        statusEl.textContent = "Couldn’t submit — try again.";
      }
    } catch {
      statusEl.textContent = "Network error — please try again.";
    }
  });
}
