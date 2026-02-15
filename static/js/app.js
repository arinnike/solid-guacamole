console.log("APP.JS LOADED");

// ============================
// RULES DATA (unchanged)
// ============================
const rules = [
  // KEEP YOUR FULL RULES ARRAY EXACTLY AS IS
];

// ============================
// Globals
// ============================
const container = document.getElementById("cards");
const search = document.getElementById("search");

// ============================
// Sidebar active link (SAFE)
// ============================
document.addEventListener("DOMContentLoaded", () => {
  try {
    const currentPath = window.location.pathname;

    document.querySelectorAll(".nav-link").forEach(link => {
      const href = link.getAttribute("href");
      if (href && href === currentPath) {
        link.classList.add("font-bold");
      }
    });
  } catch (err) {
    console.warn("Sidebar highlight skipped:", err);
  }
});

// ============================
// Dark mode
// ============================
if (localStorage.theme === "dark") {
  document.documentElement.classList.add("dark");
}

function toggleDark() {
  document.documentElement.classList.toggle("dark");
  localStorage.theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

// ============================
// Cheat Sheet Functions (GLOBAL)
// ============================
function toggle(i) {
  document.getElementById("body" + i)?.classList.toggle("hidden");
}

function expandAll() {
  rules.forEach((_, i) =>
    document.getElementById("body" + i)?.classList.remove("hidden")
  );
}

function collapseAll() {
  rules.forEach((_, i) =>
    document.getElementById("body" + i)?.classList.add("hidden")
  );
}

function filterCards() {
  if (!search) return;

  const q = search.value.toLowerCase();
  document.querySelectorAll(".card").forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(q)
      ? "block"
      : "none";
  });
}

// ============================
// Render Cards (isolated)
// ============================
function renderCards() {
  if (!container) return;

  container.innerHTML = "";

  rules.forEach((r, i) => {
    container.innerHTML += `
      <div class="card bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-4">
        <div class="cursor-pointer font-semibold" onclick="toggle(${i})">
          ${r.title}
          <p class="text-sm text-zinc-400">${r.summary}</p>
        </div>
        <div id="body${i}" class="hidden mt-3 whitespace-pre-line text-sm">${r.body}</div>
      </div>
    `;
  });
}

// ============================
// Init Cheat Sheet (guaranteed)
// ============================
if (container) {
  search?.addEventListener("input", filterCards);
  renderCards();
}