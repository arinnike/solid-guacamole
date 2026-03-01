/* =========================================
   STEP 6 – Weapons (Performance Clean Build)
========================================= */

let cachedPrimaryWeapons = [];
let cachedSecondaryWeapons = [];

let selectedPrimaryRow = null;
let selectedSecondaryRow = null;

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

  if (tierInfo) {
    tierInfo.classList.remove("hidden");
    tierInfo.textContent =
      `Showing Tier ${tier} weapons based on Level ${level}.`;
  }

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

  if (!selected) return;

  wizardState.weapons.primary = selected;
  wizardState.weapons.secondary = null;

  const row =
    document.querySelector(
      `#primary-weapon-table tr[data-id="${id}"]`
    );

  if (selectedPrimaryRow) {
    selectedPrimaryRow.classList.remove(
      "bg-zinc-200",
      "dark:bg-zinc-700"
    );
  }

  if (row) {
    row.classList.add(
      "bg-zinc-200",
      "dark:bg-zinc-700"
    );
  }

  selectedPrimaryRow = row;

  clearSecondarySelection();
  updateSecondaryEligibility();
}

function selectSecondaryWeapon(id) {

  const primary = wizardState.weapons.primary;

  if (!primary || primary.burden === "Two-handed")
    return;

  const selected =
    cachedSecondaryWeapons.find(w => Number(w.id) === Number(id));

  if (!selected) return;

  wizardState.weapons.secondary = selected;

  const row =
    document.querySelector(
      `#secondary-weapon-table tr[data-id="${id}"]`
    );

  if (selectedSecondaryRow) {
    selectedSecondaryRow.classList.remove(
      "bg-zinc-200",
      "dark:bg-zinc-700"
    );
  }

  if (row) {
    row.classList.add(
      "bg-zinc-200",
      "dark:bg-zinc-700"
    );
  }

  selectedSecondaryRow = row;
}

/* ---------- Eligibility ---------- */

function updateSecondaryEligibility() {

  const section =
    document.getElementById("secondary-section");

  const primary =
    wizardState.weapons.primary;

  if (!section) return;

  if (!primary || primary.burden === "Two-handed") {

    section.classList.add(
      "opacity-50",
      "pointer-events-none"
    );

  } else {

    section.classList.remove(
      "opacity-50",
      "pointer-events-none"
    );
  }
}

/* ---------- Reset ---------- */

function resetWeaponState() {

  wizardState.weapons.primary = null;
  wizardState.weapons.secondary = null;

  if (selectedPrimaryRow) {
    selectedPrimaryRow.classList.remove(
      "bg-zinc-200",
      "dark:bg-zinc-700"
    );
  }

  if (selectedSecondaryRow) {
    selectedSecondaryRow.classList.remove(
      "bg-zinc-200",
      "dark:bg-zinc-700"
    );
  }

  selectedPrimaryRow = null;
  selectedSecondaryRow = null;

  updateSecondaryEligibility();
}

function clearSecondarySelection() {

  if (selectedSecondaryRow) {
    selectedSecondaryRow.classList.remove(
      "bg-zinc-200",
      "dark:bg-zinc-700"
    );
  }

  selectedSecondaryRow = null;
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

  const el =
    document.getElementById("weapon-error");

  if (!el) return;

  el.textContent = msg;
  el.classList.remove("hidden");
}

function hideWeaponError() {

  const el =
    document.getElementById("weapon-error");

  if (!el) return;

  el.classList.add("hidden");
}