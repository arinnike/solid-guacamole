(() => {

let currentMain = "weapons";
let currentType = "primary";

let allWeapons = [];
let allArmor = [];
let allItems = [];

const body = document.getElementById("equipment-body");
const tierFilter = document.getElementById("tier-filter");
const traitFilter = document.getElementById("trait-filter");
const reachFilter = document.getElementById("reach-filter");
const burdenFilter = document.getElementById("burden-filter");
const rarityFilter = document.getElementById("rarity-filter");
const searchInput = document.getElementById("search-input");

const weaponTabs = document.getElementById("weapon-tabs");
const itemTabs = document.getElementById("item-tabs");
const tableHead = document.querySelector("thead tr");

/* ---------------- Loaders ---------------- */

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

async function loadItems() {
  const res = await fetch(`/api/${currentType}`);
  allItems = await res.json();
  populateItemFilters();
  renderItems();
}

/* ---------------- Filter Population ---------------- */

function populateWeaponFilters() {
  fillSelect(tierFilter, unique("tier", allWeapons));
  fillSelect(traitFilter, unique("trait", allWeapons));
  fillSelect(reachFilter, unique("reach", allWeapons));
  fillSelect(burdenFilter, unique("burden", allWeapons));
}

function populateArmorFilters() {
  fillSelect(tierFilter, unique("tier", allArmor));
}

function populateItemFilters() {

  const rarityOrder = ["Common", "Uncommon", "Rare", "Legendary"];

  const raritiesInData = unique("rarity", allItems);

  const sortedRarities = rarityOrder.filter(r =>
    raritiesInData.includes(r)
  );

  fillSelect(rarityFilter, sortedRarities);
}

function unique(key, arr) {
  return [...new Set(arr.map(o => o[key]).filter(Boolean))];
}

function fillSelect(select, values) {
  select.innerHTML = `<option value="">All</option>`;
  values.sort().forEach(v => select.innerHTML += `<option>${v}</option>`);
}

/* ---------------- Rendering ---------------- */

function renderWeapons() {
  setWeaponHeaders();

  filter(allWeapons).forEach((w,i) => body.innerHTML += weaponRow(w,i));
}

function renderArmor() {
  setArmorHeaders();

  filter(allArmor).forEach((a,i) => body.innerHTML += armorRow(a,i));
}

function renderItems() {
  setItemHeaders();

  filter(allItems).forEach((i2,i) => body.innerHTML += itemRow(i2,i));
}

/* ---------------- Filtering ---------------- */

function filter(data) {
  body.innerHTML = "";

  const s = searchInput.value.toLowerCase();

  return data.filter(o =>
    (!tierFilter.value || o.tier == tierFilter.value) &&
    (!traitFilter.value || o.trait == traitFilter.value) &&
    (!reachFilter.value || o.reach == reachFilter.value) &&
    (!burdenFilter.value || o.burden == burdenFilter.value) &&
    (!rarityFilter.value || o.rarity == rarityFilter.value) &&
    JSON.stringify(o).toLowerCase().includes(s)
  );
}

/* ---------------- Rows ---------------- */

function rowBase(i) {
  return i%2===0 ? "bg-zinc-50 dark:bg-zinc-900" : "bg-zinc-100 dark:bg-zinc-800";
}

function weaponRow(w,i){
return `<tr class="${rowBase(i)} hover:bg-zinc-200 dark:hover:bg-zinc-700 transition border-t dark:border-zinc-700">
<td class="p-2 font-semibold">${w.name}</td>
<td class="p-2 text-center">${w.tier||""}</td>
<td class="p-2 text-center">${w.trait||""}</td>
<td class="p-2 text-center">${w.reach||""}</td>
<td class="p-2 text-center">${w.damage||""}</td>
<td class="p-2 text-center">${w.burden||""}</td>
<td class="p-2">${w.feature||""}</td></tr>`;
}

function armorRow(a,i){
return `<tr class="${rowBase(i)} hover:bg-zinc-200 dark:hover:bg-zinc-700 transition border-t dark:border-zinc-700">
<td class="p-2 font-semibold">${a.name}</td>
<td class="p-2 text-center">${a.tier||""}</td>
<td class="p-2 text-center">${a.base_thresholds||""}</td>
<td class="p-2 text-center">${a.base_score||""}</td>
<td class="p-2">${a.feature||""}</td></tr>`;
}

function itemRow(i2,i){
return `<tr class="${rowBase(i)} hover:bg-zinc-200 dark:hover:bg-zinc-700 transition border-t dark:border-zinc-700">
<td class="p-2 font-semibold">${i2.name}</td>
<td class="p-2 text-center">${i2.rarity||""}</td>
<td class="p-2">${i2.description||""}</td></tr>`;
}

/* ---------------- Headers ---------------- */

function setWeaponHeaders(){
tableHead.innerHTML=`<th>Name</th><th>Tier</th><th>Trait</th><th>Reach</th><th>Damage</th><th>Burden</th><th>Feature</th>`;
}

function setArmorHeaders(){
tableHead.innerHTML=`<th>Name</th><th>Tier</th><th>Base Thresholds</th><th>Base Score</th><th>Feature</th>`;
}

function setItemHeaders(){
tableHead.innerHTML=`<th>Name</th><th>Rarity</th><th>Description</th>`;
}

/* ---------------- Events ---------------- */

[tierFilter,traitFilter,reachFilter,burdenFilter,rarityFilter,searchInput]
.forEach(el=>el?.addEventListener("input",()=>{
currentMain==="weapons"?renderWeapons():currentMain==="armor"?renderArmor():renderItems();
}));

document.querySelectorAll(".weapon-tab")
  .forEach(b => b.onclick = () => {

    // Reset all weapon tabs
    document.querySelectorAll(".weapon-tab").forEach(t => {
      t.classList.remove("font-semibold");
      t.classList.add("opacity-60");
    });

    // Activate clicked tab
    b.classList.add("font-semibold");
    b.classList.remove("opacity-60");

    currentType = b.dataset.type;
    loadWeapons();
  });

document.querySelectorAll(".item-tab")
  .forEach(b => b.onclick = () => {

    // Reset all item tabs
    document.querySelectorAll(".item-tab").forEach(t => {
      t.classList.remove("font-semibold");
      t.classList.add("opacity-60");
    });

    // Activate clicked tab
    b.classList.add("font-semibold");
    b.classList.remove("opacity-60");

    currentType = b.dataset.type;
    loadItems();
  });

document.querySelectorAll(".main-tab").forEach(b => b.onclick = () => {
  // Reset ALL main tabs
  document.querySelectorAll(".main-tab").forEach(t => {
    t.classList.remove("font-semibold", "border-b-2", "border-zinc-900", "dark:border-zinc-200");
    t.classList.add("opacity-60");
  });

  // Activate clicked tab
  b.classList.add("font-semibold", "border-b-2", "border-zinc-900", "dark:border-zinc-200");
  b.classList.remove("opacity-60");

  currentMain = b.dataset.main;

  weaponTabs.style.display = currentMain === "weapons" ? "flex" : "none";
  itemTabs.style.display = currentMain === "items" ? "flex" : "none";

  // Reset all filter visibility
  tierFilter.parentElement.style.display = "none";
  traitFilter.parentElement.style.display = "none";
  reachFilter.parentElement.style.display = "none";
  burdenFilter.parentElement.style.display = "none";
  rarityFilter.parentElement.style.display = "none";

  // Clear filter values
  tierFilter.value = "";
  traitFilter.value = "";
  reachFilter.value = "";
  burdenFilter.value = "";
  rarityFilter.value = "";
  searchInput.value = "";

  // Reset sub-tabs
  document.querySelectorAll(".weapon-tab").forEach(t => t.classList.add("opacity-60"));
  document.querySelectorAll(".item-tab").forEach(t => t.classList.add("opacity-60"));

  if (currentMain === "weapons") {
    currentType = "primary";
    document.querySelector(".weapon-tab[data-type='primary']").classList.remove("opacity-60");

    tierFilter.parentElement.style.display = "flex";
    traitFilter.parentElement.style.display = "flex";
    reachFilter.parentElement.style.display = "flex";
    burdenFilter.parentElement.style.display = "flex";

    loadWeapons();
  }

  if (currentMain === "armor") {
    tierFilter.parentElement.style.display = "flex";
    loadArmor();
  }

  if (currentMain === "items") {
    currentType = "consumables";
    document.querySelector(".item-tab[data-type='consumables']").classList.remove("opacity-60");

    rarityFilter.parentElement.style.display = "flex";

    loadItems();
  }

});

/* ---------------- Init ---------------- */

loadWeapons();

})();