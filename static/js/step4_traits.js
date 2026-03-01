/* =========================================
   STEP 4 – Traits
========================================= */

const TRAITS = [
  "agility",
  "presence",
  "knowledge",
  "strength",
  "finesse",
  "instinct"
];

const TRAIT_VALUES = [-1, 0, 0, 1, 1, 2];

/* ---------- Render ---------- */

function renderTraits() {

  const container =
    document.getElementById("trait-grid");

  if (!container) return;

  const spellcast =
    wizardState.spellcast_trait;

  const className =
    getSelectedClassName?.() || "";

  const spellcastInfo =
    spellcast
      ? `
        <div class="mb-6 p-4 border rounded bg-zinc-100 dark:bg-zinc-800 text-sm">
          <strong>${className} Spellcast Trait:</strong>
          <span class="capitalize font-semibold">
            ${spellcast}
          </span>
        </div>
      `
      : "";

  container.innerHTML = `
    ${spellcastInfo}

    <div class="grid sm:grid-cols-2 gap-4">
      ${TRAITS.map(trait => `
        <div class="border rounded p-4 ${
          trait === spellcast
            ? "ring-2 ring-blue-500"
            : ""
        } bg-white dark:bg-zinc-800">
          <label class="block text-sm mb-2 capitalize font-medium">
            ${trait}
          </label>
          <select
            class="w-full border p-2 rounded dark:bg-zinc-700"
            data-trait="${trait}">
          </select>
        </div>
      `).join("")}
    </div>
  `;

  populateTraitDropdowns();
}

/* ---------- Populate Dropdowns ---------- */

function populateTraitDropdowns() {

  document.querySelectorAll(
    "#trait-grid select"
  ).forEach(select => {

    const trait =
      select.dataset.trait;

    select.innerHTML = `
      <option value="">Select</option>
      ${TRAIT_VALUES.map(v => `
        <option value="${v}">
          ${v >= 0 ? "+" + v : v}
        </option>
      `).join("")}
    `;

    select.addEventListener("change", () => {
      updateTrait(trait, select.value);
      enforceTraitLimits();
    });
  });
}

/* ---------- Update State ---------- */

function updateTrait(trait, value) {

  wizardState.traits[trait] =
    value === ""
      ? null
      : parseInt(value);
}

/* ---------- Enforce Distribution ---------- */

function enforceTraitLimits() {

  const selectedValues =
    Object.values(wizardState.traits)
      .filter(v => v !== null);

  const remaining =
    [...TRAIT_VALUES];

  selectedValues.forEach(val => {
    const index =
      remaining.indexOf(val);

    if (index !== -1) {
      remaining.splice(index, 1);
    }
  });

  document.querySelectorAll(
    "#trait-grid select"
  ).forEach(select => {

    const currentValue =
      select.value === ""
        ? null
        : parseInt(select.value);

    select.querySelectorAll("option")
      .forEach(option => {

        if (option.value === "") return;

        const val =
          parseInt(option.value);

        if (
          remaining.includes(val) ||
          val === currentValue
        ) {
          option.disabled = false;
        } else {
          option.disabled = true;
        }
      });
  });
}

/* ---------- Continue Logic ---------- */

document.addEventListener("DOMContentLoaded", () => {

  const btn =
    document.getElementById("step4-complete");

  if (!btn) return;

  btn.addEventListener("click", () => {

    const values =
      Object.values(wizardState.traits);

    if (values.includes(null)) {
      alert("All traits must be assigned.");
      return;
    }

    completeStep(4);
    openStep(5);
  });

});