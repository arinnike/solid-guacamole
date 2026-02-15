(() => {

let currentMain = "weapons";
let currentType = "primary";
let allWeapons = [];
let allArmor = [];

const body = document.getElementById("equipment-body");
const tierFilter = document.getElementById("tier-filter");
const traitFilter = document.getElementById("trait-filter");
const burdenFilter = document.getElementById("burden-filter");
const reachFilter = document.getElementById("reach-filter");
const searchInput = document.getElementById("search-input");
const weaponTabs = document.getElementById("weapon-tabs");
const tableHead = document.querySelector("thead tr");

/* -----------------------------
   Loaders
----------------------------- */

async function loadWeapons() {
  const res = await fetch(`/api/${currentType}_weapons`);
  allWeapons = await res.json();

  populateWeaponFilters();
  renderWeapons();
}

async function loadArmor() {
  const res = await fetch(`/api/armor`);
  allArmor = await res.json();

  populateArmorFilters();
  renderArmor();
}

/* -----------------------------
   Filter Population
----------------------------- */

function populateWeaponFilters() {
  const tiers = new Set();
  const traits = new Set();
  const reaches = new Set();
  const burdens = new Set();

  allWeapons.forEach(w => {
    if (w.tier) tiers.add(w.tier);
    if (w.trait) traits.add(w.trait);
    if (w.reach) reaches.add(w.reach);
    if (w.burden) burdens.add(w.burden);
  });

  fillSelect(tierFilter, tiers);
  fillSelect(traitFilter, traits);
  fillSelect(reachFilter, reaches);
  fillSelect(burdenFilter, burdens);
}

function populateArmorFilters() {
  const tiers = new Set();

  allArmor.forEach(a => {
    if (a.tier) tiers.add(a.tier);
  });

  fillSelect(tierFilter, tiers);
}

function fillSelect(select, values) {
  select.innerHTML = `<option value="">All</option>`;
  [...values].sort().forEach(v => {
    select.innerHTML += `<option value="${v}">${v}</option>`;
  });
}

/* -----------------------------
   Rendering
----------------------------- */

function renderWeapons() {
  setWeaponHeaders();

  const tier = tierFilter.value;
  const trait = traitFilter.value;
  const reach = reachFilter.value;
  const burden = burdenFilter.value;
  const search = searchInput.value.toLowerCase();

  body.innerHTML = "";

  allWeapons
    .filter(w =>
      (!tier || w.tier == tier) &&
      (!trait || w.trait == trait) &&
      (!reach || w.reach == reach) &&
      (!burden || w.burden == burden) &&
      JSON.stringify(w).toLowerCase().includes(search)
    )
    .forEach((w, i) => {
      body.innerHTML += weaponRow(w, i);
    });
}

function renderArmor() {
  setArmorHeaders();

  const tier = tierFilter.value;
  const search = searchInput.value.toLowerCase();

  body.innerHTML = "";

  allArmor
    .filter(a =>
      (!tier || a.tier == tier) &&
      JSON.stringify(a).toLowerCase().includes(search)
    )
    .forEach((a, i) => {
      body.innerHTML += armorRow(a, i);
    });
}

/* -----------------------------
   Rows
----------------------------- */

function weaponRow(w, i) {
  const stripe = i % 2 === 0 ? "bg-zinc-50 dark:bg-zinc-900" : "bg-zinc-100 dark:bg-zinc-800";

  return `
  <tr class="${stripe} hover:bg-zinc-200 dark:hover:bg-zinc-700 transition border-t dark:border-zinc-700">
    <td class="p-2 font-semibold">${w.name}</td>
    <td class="p-2 text-center">${w.tier || ""}</td>
    <td class="p-2 text-center">${w.trait || ""}</td>
    <td class="p-2 text-center">${w.reach || ""}</td>
    <td class="p-2 text-center">${w.damage || ""}</td>
    <td class="p-2 text-center">${w.burden || ""}</td>
    <td class="p-2">${w.feature || ""}</td>
  </tr>`;
}

function armorRow(a, i) {
  const stripe = i % 2 === 0 ? "bg-zinc-50 dark:bg-zinc-900" : "bg-zinc-100 dark:bg-zinc-800";

  return `
  <tr class="${stripe} hover:bg-zinc-200 dark:hover:bg-zinc-700 transition border-t dark:border-zinc-700">
    <td class="p-2 font-semibold">${a.name}</td>
    <td class="p-2 text-center">${a.tier || ""}</td>
    <td class="p-2 text-center">${a.base_thresholds || ""}</td>
    <td class="p-2 text-center">${a.base_score || ""}</td>
    <td class="p-2">${a.feature || ""}</td>
  </tr>`;
}

/* -----------------------------
   Headers
----------------------------- */

function setWeaponHeaders() {
  tableHead.innerHTML = `
    <th class="p-2 text-left">Name</th>
    <th class="p-2">Tier</th>
    <th class="p-2">Trait</th>
    <th class="p-2">Reach</th>
    <th class="p-2">Damage</th>
    <th class="p-2">Burden</th>
    <th class="p-2 text-left">Feature</th>`;
}

function setArmorHeaders() {
  tableHead.innerHTML = `
    <th class="p-2 text-left">Name</th>
    <th class="p-2">Tier</th>
    <th class="p-2">Base Thresholds</th>
    <th class="p-2">Base Score</th>
    <th class="p-2 text-left">Feature</th>`;
}

/* -----------------------------
   Filters
----------------------------- */

[tierFilter, traitFilter, reachFilter, burdenFilter, searchInput]
  .forEach(el => el.addEventListener("input", () => {
    currentMain === "weapons" ? renderWeapons() : renderArmor();
  }));

/* -----------------------------
   Weapon Sub Tabs
----------------------------- */

document.querySelectorAll(".weapon-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".weapon-tab").forEach(b => b.classList.add("opacity-60"));
    btn.classList.remove("opacity-60");

    currentType = btn.dataset.type;
    loadWeapons();
  });
});

/* -----------------------------
   Main Tabs
----------------------------- */

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
    traitFilter.parentElement.style.display = currentMain === "weapons" ? "flex" : "none";
    reachFilter.parentElement.style.display = currentMain === "weapons" ? "flex" : "none";
    burdenFilter.parentElement.style.display = currentMain === "weapons" ? "flex" : "none";

    tierFilter.value = "";
    searchInput.value = "";

    currentMain === "weapons" ? loadWeapons() : loadArmor();
  });
});

/* -----------------------------
   Initial
----------------------------- */

loadWeapons();

})();