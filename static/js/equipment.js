let currentMain = "weapons";
let currentType = "primary";
let allWeapons = [];

const body = document.getElementById("equipment-body");
const tierFilter = document.getElementById("tier-filter");
const traitFilter = document.getElementById("trait-filter");
const burdenFilter = document.getElementById("burden-filter");
const searchInput = document.getElementById("search-input");
const weaponTabs = document.getElementById("weapon-tabs");

/* Load weapons */

async function loadWeapons() {
  const res = await fetch(`/api/${currentType}_weapons`);
  allWeapons = await res.json();

  populateFilters();
  renderTable();
}

/* Populate dropdowns */

function populateFilters() {
  const tiers = new Set();
  const traits = new Set();
  const burdens = new Set();

  allWeapons.forEach(w => {
    if (w.tier) tiers.add(w.tier);
    if (w.trait) traits.add(w.trait);
    if (w.burden) burdens.add(w.burden);
  });

  fillSelect(tierFilter, tiers, "Tier");
  fillSelect(traitFilter, traits, "Trait");
  fillSelect(burdenFilter, burdens, "Burden");
}

function fillSelect(select, values, label) {
  select.innerHTML = `<option value="">${label}</option>`;
  [...values].sort().forEach(v => {
    select.innerHTML += `<option value="${v}">${v}</option>`;
  });
}

/* Rendering */

function renderTable() {
  const tier = tierFilter.value;
  const trait = traitFilter.value;
  const burden = burdenFilter.value;
  const search = searchInput.value.toLowerCase();

  body.innerHTML = "";

  allWeapons
    .filter(w =>
      (!tier || w.tier == tier) &&
      (!trait || w.trait == trait) &&
      (!burden || w.burden == burden) &&
      JSON.stringify(w).toLowerCase().includes(search)
    )
    .forEach((w, i) => {

      const stripe = i % 2 === 0 ? "bg-zinc-50 dark:bg-zinc-900" : "bg-zinc-100 dark:bg-zinc-800";

      body.innerHTML += `
        <tr class="${stripe} hover:bg-zinc-200 dark:hover:bg-zinc-700 transition border-t dark:border-zinc-700">
          <td class="p-2 font-semibold">${w.name}</td>
          <td class="p-2 text-center">${w.tier || ""}</td>
          <td class="p-2 text-center">${w.trait || ""}</td>
          <td class="p-2 text-center">${w.reach || ""}</td>
          <td class="p-2 text-center">${w.damage || ""}</td>
          <td class="p-2 text-center">${w.burden || ""}</td>
          <td class="p-2">${w.feature || ""}</td>
        </tr>
      `;
    });
}

/* Filters */

[tierFilter, traitFilter, burdenFilter, searchInput]
  .forEach(el => el.addEventListener("input", renderTable));

/* Weapon tabs */

document.querySelectorAll(".weapon-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".weapon-tab").forEach(b => b.classList.add("opacity-60"));
    btn.classList.remove("opacity-60");

    currentType = btn.dataset.type;
    loadWeapons();
  });
});

/* Main tabs */

document.querySelectorAll(".main-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".main-tab").forEach(b => {
      b.classList.remove("border-b-2", "border-zinc-900", "dark:border-zinc-200");
      b.classList.add("opacity-60");
    });

    btn.classList.remove("opacity-60");
    btn.classList.add("border-b-2", "border-zinc-900", "dark:border-zinc-200");

    currentMain = btn.dataset.main;

    weaponTabs.style.display = currentMain === "weapons" ? "flex" : "none";
  });
});

/* Initial */

loadWeapons();