/* =========================================
   STEP 5 – Armor (Button Select Version)
========================================= */

let cachedArmor = [];

/* ---------- Load + Tier Filter ---------- */

async function loadArmor() {

  const allArmor = await apiFetch("/armor");

  const level = Number(wizardState.level) || 1;
  const tier = getTierFromLevel(level);

  cachedArmor =
    allArmor.filter(a => Number(a.tier) === tier);

  const tierInfo =
    document.getElementById("armor-tier-info");

  if (tierInfo) {
    tierInfo.classList.remove("hidden");
    tierInfo.textContent =
      `Showing Tier ${tier} armor based on Level ${level}.`;
  }

  // If previously selected armor is no longer valid, clear it
  if (
    wizardState.armor_id &&
    !cachedArmor.some(a => Number(a.id) === Number(wizardState.armor_id))
  ) {
    wizardState.armor_id = null;
  }

  renderArmorTable();
}

/* ---------- Render ---------- */

function renderArmorTable() {

  const tbody =
    document.getElementById("armor-table-body");

  if (!tbody) return;

  if (cachedArmor.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6"
          class="p-4 text-center text-zinc-500">
          No armor available for this tier.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = cachedArmor.map(a => `
    <tr
      class="border-t transition-colors"
      data-id="${a.id}">

      <td class="p-2 font-medium">${a.name}</td>
      <td class="p-2">${a.tier}</td>
      <td class="p-2">${a.base_thresholds}</td>
      <td class="p-2">${a.base_score}</td>
      <td class="p-2">${a.feature ?? ""}</td>

      <td class="p-2 text-right">
        <button
          type="button"
          class="armor-select-btn px-3 py-1 rounded-md border border-indigo-600 text-indigo-600 transition-colors">
          Select
        </button>
      </td>

    </tr>
  `).join("");

  // Restore selected state if one exists
  if (wizardState.armor_id) {
    updateArmorSelectionUI(wizardState.armor_id);
  }
}

/* ---------- Selection UI ---------- */

function updateArmorSelectionUI(selectedId) {

  document
    .querySelectorAll("#armor-table-body tr")
    .forEach(row => {

      const btn =
        row.querySelector(".armor-select-btn");

      if (!btn) return;

      const rowId =
        Number(row.dataset.id);

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

/* ---------- Click Delegation ---------- */

document.addEventListener("click", (e) => {

  const btn = e.target.closest(".armor-select-btn");
  if (!btn) return;

  const row = btn.closest("tr");
  if (!row) return;

  const id = Number(row.dataset.id);

  wizardState.armor_id = id;

  updateArmorSelectionUI(id);

});

/* ---------- Continue ---------- */

document.addEventListener("DOMContentLoaded", () => {

  const btn =
    document.getElementById("step5-complete");

  if (!btn) return;

  btn.addEventListener("click", () => {

    completeStep(5);
    openStep(6, loadWeapons);

  });

});