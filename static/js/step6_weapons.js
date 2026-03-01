/* ===============================
   STEP 6 – Weapons (Clean Version)
================================ */

let cachedPrimaryWeapons = [];
let cachedSecondaryWeapons = [];

/* ---------- Load Weapons ---------- */

async function loadWeapons() {

  const allWeapons = await apiFetch("/weapons");
  const tier = getTierFromLevel(wizardState.level);

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
    `Showing Tier ${tier} weapons based on Level ${wizardState.level}.`;

  renderPrimaryTable();
  renderSecondaryTable();

  // Reset UI
  document.getElementById("secondary-section")
    .classList.add("hidden");

  document.getElementById("two-handed-message")
    .classList.add("hidden");
}

/* ---------- Render Tables ---------- */

function renderPrimaryTable() {

  const tbody =
    document.getElementById("primary-weapon-table");

  tbody.innerHTML = cachedPrimaryWeapons.map(w => `
    <tr class="cursor-pointer border-t hover:bg-zinc-100 dark:hover:bg-zinc-800"
        data-id="${w.id}">
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

  tbody.innerHTML = cachedSecondaryWeapons.map(w => `
    <tr class="cursor-pointer border-t hover:bg-zinc-100 dark:hover:bg-zinc-800"
        data-id="${w.id}">
      <td class="p-2">${w.name}</td>
      <td class="p-2 capitalize">${w.trait}</td>
      <td class="p-2">${w.reach}</td>
      <td class="p-2">${w.damage}</td>
      <td class="p-2">${w.burden}</td>
      <td class="p-2">${w.feature}</td>
    </tr>
  `).join("");
}

/* ---------- Event Delegation ---------- */

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("primary-weapon-table")
    .addEventListener("click", (e) => {

      const row = e.target.closest("tr");
      if (!row) return;

      selectPrimaryWeapon(row.dataset.id);
    });

  document.getElementById("secondary-weapon-table")
    .addEventListener("click", (e) => {

      const row = e.target.closest("tr");
      if (!row) return;

      selectSecondaryWeapon(row.dataset.id);
    });
});

/* ---------- Selection Logic ---------- */

function selectPrimaryWeapon(id) {

  const selected =
    cachedPrimaryWeapons.find(w => Number(w.id) === Number(id));

  wizardState.weapons.primary = selected;
  wizardState.weapons.secondary = null;

  highlightRow("primary-weapon-table", id);
  clearSecondaryHighlight();

  const secondarySection =
    document.getElementById("secondary-section");

  const message =
    document.getElementById("two-handed-message");

  if (selected.burden === "One-handed") {

    secondarySection.classList.remove("hidden");
    message.classList.add("hidden");

  } else {

    secondarySection.classList.add("hidden");
    message.classList.remove("hidden");
  }
}

function selectSecondaryWeapon(id) {

  const primary =
    wizardState.weapons.primary;

  if (!primary || primary.burden === "Two-handed")
    return;

  const selected =
    cachedSecondaryWeapons.find(w => Number(w.id) === Number(id));

  wizardState.weapons.secondary = selected;

  highlightRow("secondary-weapon-table", id);
}

/* ---------- Highlight Helpers ---------- */

function highlightRow(tableId, id) {

  document.querySelectorAll(`#${tableId} tr`)
    .forEach(row => {
      row.classList.remove("bg-zinc-200","dark:bg-zinc-700");

      if (Number(row.dataset.id) === Number(id)) {
        row.classList.add("bg-zinc-200","dark:bg-zinc-700");
      }
    });
}

function clearSecondaryHighlight() {

  document.querySelectorAll("#secondary-weapon-table tr")
    .forEach(row => {
      row.classList.remove("bg-zinc-200","dark:bg-zinc-700");
    });
}

/* ---------- Continue Validation ---------- */

document.getElementById("step6-complete")
?.addEventListener("click", () => {

  const primary =
    wizardState.weapons.primary;

  const secondary =
    wizardState.weapons.secondary;

  if (!primary) {
    showWeaponError("You must select a primary weapon.");
    return;
  }

  if (primary.burden === "One-handed" && !secondary) {
    showWeaponError("Please select a secondary weapon.");
    return;
  }

  hideWeaponError();
  completeStep(6);
  openStep(7);
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