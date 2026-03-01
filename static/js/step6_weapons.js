/* =========================================
   STEP 6 – Weapons (Clean Version)
========================================= */

let cachedPrimaryWeapons = [];
let cachedSecondaryWeapons = [];

/* ---------- Load + Tier Filter ---------- */

async function loadWeapons() {

  const allWeapons = await apiFetch("/weapons");

  const level = Number(wizardState.level) || 1;
  const tier = getTierFromLevel(level);

  const filtered =
    allWeapons.filter(w => Number(w.tier) === tier);

  cachedPrimaryWeapons =
    filtered.filter(w => w.weapon_type === "primary");

  cachedSecondaryWeapons =
    filtered.filter(w => w.weapon_type === "secondary");

  const tierInfo =
    document.getElementById("weapon-tier-info");

  tierInfo.classList.remove("hidden");
  tierInfo.textContent =
    `Showing Tier ${tier} weapons based on Level ${level}.`;

  renderPrimaryTable();
  renderSecondaryTable();

  resetWeaponState();
}

/* ---------- Render Tables ---------- */

function renderPrimaryTable() {

  const tbody =
    document.getElementById("primary-weapon-table");

  if (!tbody) return;

  tbody.innerHTML =
    cachedPrimaryWeapons.map(w => `
      <tr
        class="cursor-pointer border-t hover:bg-zinc-100 dark:hover:bg-zinc-800"
        data-id="${w.id}"
        onclick="selectPrimaryWeapon(${w.id})">

        <td class="p-2">${w.name}</td>
        <td class="p-2 capitalize">${w.trait}</td>
        <td class="p-2">${w.reach}</td>
        <td class="p-2">${w.damage}</td>
        <td class="p-2">${w.burden}</td>
        <td class="p-2">${w.feature}</td>
      </tr>
    `).join("");
}

function renderSecondaryTable() {

  const tbody =
    document.getElementById("secondary-weapon-table");

  if (!tbody) return;

  tbody.innerHTML =
    cachedSecondaryWeapons.map(w => `
      <tr
        class="cursor-pointer border-t hover:bg-zinc-100 dark:hover:bg-zinc-800"
        data-id="${w.id}"
        onclick="selectSecondaryWeapon(${w.id})">

        <td class="p-2">${w.name}</td>
        <td class="p-2 capitalize">${w.trait}</td>
        <td class="p-2">${w.reach}</td>
        <td class="p-2">${w.damage}</td>
        <td class="p-2">${w.burden}</td>
        <td class="p-2">${w.feature}</td>
      </tr>
    `).join("");
}

/* ---------- Selection Logic ---------- */

function selectPrimaryWeapon(id) {

  const selected =
    cachedPrimaryWeapons.find(w => Number(w.id) === Number(id));

  wizardState.weapons.primary = selected;
  wizardState.weapons.secondary = null;

  highlightRow("primary-weapon-table", id);
  clearSecondaryHighlight();

  updateSecondaryEligibility();
}

function selectSecondaryWeapon(id) {

  const primary = wizardState.weapons.primary;

  if (!primary || primary.burden === "Two-handed")
    return;

  const selected =
    cachedSecondaryWeapons.find(w => Number(w.id) === Number(id));

  wizardState.weapons.secondary = selected;

  highlightRow("secondary-weapon-table", id);
}

/* ---------- Eligibility ---------- */

function updateSecondaryEligibility() {

  const section =
    document.getElementById("secondary-section");

  const primary =
    wizardState.weapons.primary;

  if (!primary) {
    section.classList.add("opacity-50","pointer-events-none");
    return;
  }

  if (primary.burden === "Two-handed") {
    section.classList.add("opacity-50","pointer-events-none");
    return;
  }

  section.classList.remove("opacity-50","pointer-events-none");
}

function resetWeaponState() {

  wizardState.weapons.primary = null;
  wizardState.weapons.secondary = null;

  clearSecondaryHighlight();
  updateSecondaryEligibility();
}

/* ---------- Highlight Helpers ---------- */

function highlightRow(tableId, id) {

  document.querySelectorAll(`#${tableId} tr`)
    .forEach(row => {

      row.classList.remove(
        "bg-zinc-200",
        "dark:bg-zinc-700"
      );

      if (Number(row.dataset.id) === Number(id)) {
        row.classList.add(
          "bg-zinc-200",
          "dark:bg-zinc-700"
        );
      }
    });
}

function clearSecondaryHighlight() {

  document.querySelectorAll("#secondary-weapon-table tr")
    .forEach(row => {
      row.classList.remove(
        "bg-zinc-200",
        "dark:bg-zinc-700"
      );
    });
}

/* ---------- Validation ---------- */

document.addEventListener("DOMContentLoaded", () => {

  const btn =
    document.getElementById("step6-complete");

  if (!btn) return;

  btn.addEventListener("click", () => {

    const primary =
      wizardState.weapons.primary;

    const secondary =
      wizardState.weapons.secondary;

    if (!primary) {
      showWeaponError("You must select a primary weapon.");
      return;
    }

    if (primary.burden === "One-handed" && !secondary) {
      showWeaponError(
        "This weapon is one-handed. Please select a secondary weapon."
      );
      return;
    }

    hideWeaponError();

    completeStep(6);
    openStep(7);
  });

});

/* ---------- Error Helpers ---------- */

function showWeaponError(msg) {
  const el = document.getElementById("weapon-error");
  el.textContent = msg;
  el.classList.remove("hidden");
}

function hideWeaponError() {
  document.getElementById("weapon-error")
    .classList.add("hidden");
}