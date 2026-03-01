/* =========================================
   STEP 6 – Weapons (Accordion + Smart Logic)
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

  if (tierInfo) {
    tierInfo.classList.remove("hidden");
    tierInfo.textContent =
      `Showing Tier ${tier} weapons based on Level ${level}.`;
  }

  renderPrimaryTable();
  renderSecondaryTable();

  resetWeaponState();

  expandPrimary(); // default state
}

/* ---------- Accordion ---------- */

function expandPrimary() {
  document.getElementById("primary-content")
    .classList.remove("hidden");

  document.getElementById("secondary-content")
    .classList.add("hidden");
}

function expandSecondary() {
  document.getElementById("secondary-content")
    .classList.remove("hidden");

  document.getElementById("primary-content")
    .classList.add("hidden");
}

/* ---------- Render ---------- */

function renderPrimaryTable() {

  const tbody =
    document.getElementById("primary-weapon-table");

  if (!tbody) return;

  tbody.innerHTML =
    cachedPrimaryWeapons.map(w => `
      <tr class="border-t transition-colors"
          data-id="${w.id}">
        <td class="p-2 font-medium">${w.name}</td>
        <td class="p-2 capitalize">${w.trait}</td>
        <td class="p-2">${w.reach}</td>
        <td class="p-2">${w.damage}</td>
        <td class="p-2">${w.burden}</td>
        <td class="p-2">${w.feature ?? ""}</td>
        <td class="p-2 text-right">
          <button type="button"
            class="primary-select-btn px-3 py-1 rounded-md border border-indigo-600 text-indigo-600 transition-colors">
            Select
          </button>
        </td>
      </tr>
    `).join("");
}

function renderSecondaryTable() {

  const tbody =
    document.getElementById("secondary-weapon-table");

  if (!tbody) return;

  tbody.innerHTML =
    cachedSecondaryWeapons.map(w => `
      <tr class="border-t transition-colors"
          data-id="${w.id}">
        <td class="p-2 font-medium">${w.name}</td>
        <td class="p-2 capitalize">${w.trait}</td>
        <td class="p-2">${w.reach}</td>
        <td class="p-2">${w.damage}</td>
        <td class="p-2">${w.burden}</td>
        <td class="p-2">${w.feature ?? ""}</td>
        <td class="p-2 text-right">
          <button type="button"
            class="secondary-select-btn px-3 py-1 rounded-md border border-indigo-600 text-indigo-600 transition-colors">
            Select
          </button>
        </td>
      </tr>
    `).join("");
}

/* ---------- Selection UI ---------- */

function updatePrimarySelectionUI(id) {
  document.querySelectorAll("#primary-weapon-table tr")
    .forEach(row => {
      const btn = row.querySelector(".primary-select-btn");
      const rowId = Number(row.dataset.id);

      const selected = rowId === Number(id);

      row.classList.toggle(
        "bg-indigo-50", selected
      );
      row.classList.toggle(
        "dark:bg-indigo-900/40", selected
      );

      btn.classList.toggle(
        "bg-indigo-600", selected
      );
      btn.classList.toggle(
        "text-white", selected
      );

      btn.classList.toggle(
        "border-indigo-600", !selected
      );
      btn.classList.toggle(
        "text-indigo-600", !selected
      );

      btn.textContent =
        selected ? "Selected" : "Select";
    });
}

function updateSecondarySelectionUI(id) {
  document.querySelectorAll("#secondary-weapon-table tr")
    .forEach(row => {
      const btn = row.querySelector(".secondary-select-btn");
      const rowId = Number(row.dataset.id);

      const selected = rowId === Number(id);

      row.classList.toggle(
        "bg-indigo-50", selected
      );
      row.classList.toggle(
        "dark:bg-indigo-900/40", selected
      );

      btn.classList.toggle(
        "bg-indigo-600", selected
      );
      btn.classList.toggle(
        "text-white", selected
      );

      btn.classList.toggle(
        "border-indigo-600", !selected
      );
      btn.classList.toggle(
        "text-indigo-600", !selected
      );

      btn.textContent =
        selected ? "Selected" : "Select";
    });
}

/* ---------- Eligibility ---------- */

function applyBurdenRules(primaryWeapon) {

  const notice =
    document.getElementById("secondary-notice");

  const buttons =
    document.querySelectorAll(".secondary-select-btn");

  if (!primaryWeapon) {
    buttons.forEach(btn => btn.disabled = true);
    return;
  }

  if (primaryWeapon.burden === "2H") {

    wizardState.weapons.secondary_id = null;
    updateSecondarySelectionUI(null);

    buttons.forEach(btn => btn.disabled = true);

    notice.textContent =
      "Secondary weapons cannot be equipped with a two-handed weapon.";
    notice.classList.remove("hidden");

    expandPrimary();

  } else {

    buttons.forEach(btn => btn.disabled = false);

    notice.classList.add("hidden");

    expandSecondary();
  }
}

/* ---------- Click Handling ---------- */

document.addEventListener("click", (e) => {

  if (e.target.id === "primary-toggle")
    expandPrimary();

  if (e.target.id === "secondary-toggle")
    expandSecondary();

  const primaryBtn =
    e.target.closest(".primary-select-btn");

  const secondaryBtn =
    e.target.closest(".secondary-select-btn");

  if (primaryBtn) {

    const id =
      Number(primaryBtn.closest("tr").dataset.id);

    const selected =
      cachedPrimaryWeapons.find(w =>
        Number(w.id) === id
      );

    wizardState.weapons.primary_id = id;
    wizardState.weapons.secondary_id = null;

    updatePrimarySelectionUI(id);
    updateSecondarySelectionUI(null);

    applyBurdenRules(selected);
  }

  if (secondaryBtn && !secondaryBtn.disabled) {

    const id =
      Number(secondaryBtn.closest("tr").dataset.id);

    wizardState.weapons.secondary_id = id;

    updateSecondarySelectionUI(id);
  }

});

/* ---------- Reset ---------- */

function resetWeaponState() {
  wizardState.weapons.primary_id = null;
  wizardState.weapons.secondary_id = null;
  updatePrimarySelectionUI(null);
  updateSecondarySelectionUI(null);
}

/* ---------- Validation ---------- */

document.addEventListener("DOMContentLoaded", () => {

  const btn =
    document.getElementById("step6-complete");

  if (!btn) return;

  btn.addEventListener("click", () => {

    const primaryId =
      wizardState.weapons.primary_id;

    const secondaryId =
      wizardState.weapons.secondary_id;

    if (!primaryId) {
      showWeaponError(
        "You must select a primary weapon."
      );
      return;
    }

    const primary =
      cachedPrimaryWeapons.find(
        w => Number(w.id) === Number(primaryId)
      );

    if (primary?.burden === "1H" && !secondaryId) {
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