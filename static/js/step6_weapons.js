/* =========================================
   STEP 6 – Weapons (Button Select Version)
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
}

/* ---------- Render Tables ---------- */

function renderPrimaryTable() {

  const tbody =
    document.getElementById("primary-weapon-table");

  if (!tbody) return;

  tbody.innerHTML =
    cachedPrimaryWeapons.map(w => `
      <tr
        class="border-t transition-colors"
        data-id="${w.id}">

        <td class="p-2 font-medium">${w.name}</td>
        <td class="p-2 capitalize">${w.trait}</td>
        <td class="p-2">${w.reach}</td>
        <td class="p-2">${w.damage}</td>
        <td class="p-2">${w.burden}</td>
        <td class="p-2">${w.feature ?? ""}</td>

        <td class="p-2 text-right">
          <button
            type="button"
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
      <tr
        class="border-t transition-colors"
        data-id="${w.id}">

        <td class="p-2 font-medium">${w.name}</td>
        <td class="p-2 capitalize">${w.trait}</td>
        <td class="p-2">${w.reach}</td>
        <td class="p-2">${w.damage}</td>
        <td class="p-2">${w.burden}</td>
        <td class="p-2">${w.feature ?? ""}</td>

        <td class="p-2 text-right">
          <button
            type="button"
            class="secondary-select-btn px-3 py-1 rounded-md border border-indigo-600 text-indigo-600 transition-colors">
            Select
          </button>
        </td>
      </tr>
    `).join("");
}

/* ---------- Selection UI Helpers ---------- */

function updatePrimarySelectionUI(selectedId) {

  document
    .querySelectorAll("#primary-weapon-table tr")
    .forEach(row => {

      const btn =
        row.querySelector(".primary-select-btn");

      if (!btn) return;

      const rowId = Number(row.dataset.id);

      if (rowId === Number(selectedId)) {

        row.classList.add(
          "bg-indigo-50",
          "dark:bg-indigo-900/40"
        );

        btn.classList.remove(
          "border-indigo-600",
          "text-indigo-600"
        );

        btn.classList.add(
          "bg-indigo-600",
          "text-white"
        );

        btn.textContent = "Selected";

      } else {

        row.classList.remove(
          "bg-indigo-50",
          "dark:bg-indigo-900/40"
        );

        btn.classList.add(
          "border-indigo-600",
          "text-indigo-600"
        );

        btn.classList.remove(
          "bg-indigo-600",
          "text-white"
        );

        btn.textContent = "Select";
      }

    });
}

function updateSecondarySelectionUI(selectedId) {

  document
    .querySelectorAll("#secondary-weapon-table tr")
    .forEach(row => {

      const btn =
        row.querySelector(".secondary-select-btn");

      if (!btn) return;

      const rowId = Number(row.dataset.id);

      if (rowId === Number(selectedId)) {

        row.classList.add(
          "bg-indigo-50",
          "dark:bg-indigo-900/40"
        );

        btn.classList.remove(
          "border-indigo-600",
          "text-indigo-600"
        );

        btn.classList.add(
          "bg-indigo-600",
          "text-white"
        );

        btn.textContent = "Selected";

      } else {

        row.classList.remove(
          "bg-indigo-50",
          "dark:bg-indigo-900/40"
        );

        btn.classList.add(
          "border-indigo-600",
          "text-indigo-600"
        );

        btn.classList.remove(
          "bg-indigo-600",
          "text-white"
        );

        btn.textContent = "Select";
      }

    });
}

/* ---------- Selection Logic (Delegated) ---------- */

document.addEventListener("click", (e) => {

  const primaryBtn =
    e.target.closest(".primary-select-btn");

  const secondaryBtn =
    e.target.closest(".secondary-select-btn");

  if (primaryBtn) {

    const row =
      primaryBtn.closest("tr");

    const id =
      Number(row.dataset.id);

    const selected =
      cachedPrimaryWeapons.find(
        w => Number(w.id) === id
      );

    if (!selected) return;

    wizardState.weapons.primary_id = id;
    wizardState.weapons.secondary_id = null;

    updatePrimarySelectionUI(id);
    updateSecondarySelectionUI(null);

    updateSecondaryEligibility(selected);

    hideWeaponError();
  }

  if (secondaryBtn) {

    const row =
      secondaryBtn.closest("tr");

    const id =
      Number(row.dataset.id);

    const primaryId =
      wizardState.weapons.primary_id;

    const primary =
      cachedPrimaryWeapons.find(
        w => Number(w.id) === Number(primaryId)
      );

    if (!primary || primary.burden === "Two-handed")
      return;

    wizardState.weapons.secondary_id = id;

    updateSecondarySelectionUI(id);

    hideWeaponError();
  }

});

/* ---------- Eligibility ---------- */

function updateSecondaryEligibility(primaryWeapon) {

  const section =
    document.getElementById("secondary-section");

  const info =
    document.getElementById("weapon-tier-info");

  if (!section) return;

  if (!primaryWeapon ||
      primaryWeapon.burden === "Two-handed") {

    section.classList.add(
      "opacity-50",
      "pointer-events-none"
    );

    if (primaryWeapon?.burden === "Two-handed" && info) {
      info.textContent +=
        " Two-handed weapons prevent secondary selection.";
    }

  } else {

    section.classList.remove(
      "opacity-50",
      "pointer-events-none"
    );
  }
}

/* ---------- Reset ---------- */

function resetWeaponState() {

  wizardState.weapons.primary_id = null;
  wizardState.weapons.secondary_id = null;

  updatePrimarySelectionUI(null);
  updateSecondarySelectionUI(null);

  updateSecondaryEligibility(null);
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

    if (
      primary?.burden === "One-handed" &&
      !secondaryId
    ) {
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