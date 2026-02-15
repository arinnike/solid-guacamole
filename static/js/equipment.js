let currentType = "primary";
let search = "";

async function loadWeapons() {
  const res = await fetch(`/api/${currentType}_weapons?q=${encodeURIComponent(search)}`);
  const data = await res.json();

  const grid = document.getElementById("equipment-grid");
  grid.innerHTML = "";

  data.forEach(w => {
    const card = document.createElement("div");
    card.className = "p-4 rounded-xl bg-white dark:bg-zinc-800 shadow";

    card.innerHTML = `
      <h3 class="text-lg font-bold mb-1">${w.name}</h3>
      <p class="text-sm opacity-70 mb-2">Tier: ${w.tier || "-"}</p>
      <p class="text-sm">${w.description || ""}</p>
    `;

    grid.appendChild(card);
  });
}

/* Weapon tabs */

document.querySelectorAll(".weapon-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".weapon-tab").forEach(b => b.classList.add("opacity-60"));
    btn.classList.remove("opacity-60");

    currentType = btn.dataset.type;
    loadWeapons();
  });
});

/* Search */

document.getElementById("equipment-search").addEventListener("input", e => {
  search = e.target.value;
  loadWeapons();
});

/* Initial load */

loadWeapons();