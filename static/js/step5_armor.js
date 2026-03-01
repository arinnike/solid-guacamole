/* =========================================
   STEP 5 – Armor (Table Version)
========================================= */

let cachedArmor = [];
let filteredArmor = [];

/* ---------- Load + Tier Filter ---------- */

async function loadArmor() {

  const allArmor = await apiFetch("/armor");

  const tier = getTierFromLevel(wizardState.level);

  cachedArmor =
    allArmor.filter(a => Number(a.tier) === tier);

  filteredArmor = [...cachedArmor];

  const tierInfo =
    document.getElementById("armor-tier-info");

  tierInfo.classList.remove("hidden");
  tierInfo.textContent =
    `Showing Tier ${tier} armor based on Level ${wizardState.level}.`;

  wireArmorFilters();
  renderArmorTable();
  console.log("Armor loaded:", cachedArmor);
}

/* ---------- Filters ---------- */

function wireArmorFilters() {

  const nameInput =
    document.getElementById("armor-filter-name");

  if (!nameInput) return;

  nameInput.addEventListener("input", () => {
    applyArmorFilters();
  });
}

function applyArmorFilters() {

  const nameValue =
    document.getElementById("armor-filter-name")
      .value
      .toLowerCase();

  filteredArmor = cachedArmor.filter(a =>
    a.name.toLowerCase().includes(nameValue)
  );

  renderArmorTable();
}

/* ---------- Render ---------- */

function renderArmorTable() {

  const tbody =
    document.getElementById("armor-table-body");

  if (!tbody) return;

  if (filteredArmor.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5"
          class="p-4 text-center text-zinc-500">
          No armor matches filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredArmor.map(a => `
    <tr
      class="cursor-pointer border-t hover:bg-zinc-100 dark:hover:bg-zinc-800"
      data-id="${a.id}"
      onclick="selectArmor(${a.id})">

      <td class="p-2">${a.name}</td>
      <td class="p-2">${a.tier}</td>
      <td class="p-2">${a.base_thresholds}</td>
      <td class="p-2">${a.base_score}</td>
      <td class="p-2">${a.feature}</td>

    </tr>
  `).join("");
}

/* ---------- Selection ---------- */

function selectArmor(id) {

  wizardState.armor_id = id;

  document.querySelectorAll("#armor-table-body tr")
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

/* ---------- Continue ---------- */

document.addEventListener("DOMContentLoaded", () => {

  const btn =
    document.getElementById("step5-complete");

  if (!btn) return;

  btn.addEventListener("click", () => {

    // Optional step — no validation required

    completeStep(5);
    openStep(6, loadWeapons);

  });

});