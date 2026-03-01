/* =========================================
   STEP 5 – Armor (Simple Table Version)
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
        <td colspan="5"
          class="p-4 text-center text-zinc-500">
          No armor available for this tier.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = cachedArmor.map(a => `
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

    completeStep(5);
    openStep(6, loadWeapons);

  });

});