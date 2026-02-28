const API_BASE = "https://dhgmtools-api-production.up.railway.app";

const wizardState = {
  name: null,
  pronouns: null,
  level: 1,
  portrait: null,
  class_id: null,
  subclass_id: null,
  ancestry_id: null,
  community_id: null,
  traits: {
    agility: null,
    presence: null,
    knowledge: null,
    strength: null,
    finesse: null,
    instinct: null
  },
  armor_id: null,
  weapons: {
    primary: null,
    secondary: null
  },
  experiences: [],
  appearance: "",
  background: ""
};

/* ===============================
   Wizard Toggle Behavior
================================ */

document.querySelectorAll(".wizard-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const content = btn.nextElementSibling;
    content.classList.toggle("hidden");

    const step = btn.closest(".wizard-step");

    if (step.dataset.step === "2" && !content.dataset.loaded) {
      loadClasses();
      content.dataset.loaded = "true";
    }

    if (step.dataset.step === "3" && !content.dataset.loaded) {
      loadAncestries();
      loadCommunities();
      content.dataset.loaded = "true";
    }

    if (step.dataset.step === "4" && !content.dataset.loaded) {
        renderTraits();
        content.dataset.loaded = "true";
    }

    if (step.dataset.step === "5" && !content.dataset.loaded) {
        loadArmor();
        content.dataset.loaded = "true";
    }

    if (step.dataset.step === "6" && !content.dataset.loaded) {
        loadWeapons();
        content.dataset.loaded = "true";
    }
  });
});

/* ===============================
   STEP 1
================================ */

document.getElementById("step1-complete")
  ?.addEventListener("click", () => {

  const name = document.getElementById("char-name").value.trim();
  const pronouns = document.getElementById("char-pronouns").value.trim();
  const level = document.getElementById("char-level").value;
  const portrait = document.getElementById("char-portrait").files[0];

  if (!name) {
    alert("Character name is required.");
    return;
  }

  wizardState.name = name;
  wizardState.pronouns = pronouns;
  wizardState.level = parseInt(level);
  wizardState.portrait = portrait;

  completeStep(1);

  document.querySelector('[data-step="2"]').classList.remove("hidden");
});

/* ===============================
   STEP 2 – Classes
================================ */

async function loadClasses() {
  const token = (await window.supabase.auth.getSession()).data.session.access_token;

  const response = await fetch(`${API_BASE}/classes`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const classes = await response.json();
  renderClasses(classes);
}

function renderClasses(classes) {
  document.getElementById("class-loading").classList.add("hidden");
  const grid = document.getElementById("class-grid");
  grid.classList.remove("hidden");

  grid.innerHTML = classes.map(c => `
    <div class="border rounded p-4 space-y-3 bg-white dark:bg-zinc-800">
      <h3 class="font-semibold text-lg">${c.name}</h3>
      <p class="text-sm text-zinc-500">${c.class_description || ""}</p>

      ${c.subclasses?.map(s => `
        <button
          class="w-full border rounded py-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm"
          onclick="selectSubclass(${c.id}, ${s.id})">
          ${s.subclass_name}
        </button>
      `).join("") || ""}
    </div>
  `).join("");
}

function selectSubclass(classId, subclassId) {
  wizardState.class_id = classId;
  wizardState.subclass_id = subclassId;

  completeStep(2);

  document.querySelector('[data-step="3"]').classList.remove("hidden");
}

/* ===============================
   STEP 3 – Heritage
================================ */

async function loadAncestries() {
  const token = (await window.supabase.auth.getSession()).data.session.access_token;

  const response = await fetch(`${API_BASE}/ancestries`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const ancestries = await response.json();
  renderAncestries(ancestries);
}

function renderAncestries(data) {
  document.getElementById("ancestry-loading").classList.add("hidden");
  const grid = document.getElementById("ancestry-grid");
  grid.classList.remove("hidden");

  grid.innerHTML = data.map(a => `
    <button
      class="border rounded p-4 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700"
      onclick="selectAncestry(${a.id})">
      <h4 class="font-semibold">${a.name}</h4>
      <p class="text-sm text-zinc-500">${a.description}</p>
    </button>
  `).join("");
}

async function loadCommunities() {
  const token = (await window.supabase.auth.getSession()).data.session.access_token;

  const response = await fetch(`${API_BASE}/communities`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const communities = await response.json();
  renderCommunities(communities);
}

function renderCommunities(data) {
  const grid = document.getElementById("community-grid");
  grid.classList.remove("hidden");

  grid.innerHTML = data.map(c => `
    <button
      class="border rounded p-4 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700"
      onclick="selectCommunity(${c.id})">
      <h4 class="font-semibold">${c.name}</h4>
      <p class="text-sm text-zinc-500">${c.description}</p>
    </button>
  `).join("");
}

function selectAncestry(id) {
  wizardState.ancestry_id = id;

  const grid = document.getElementById("community-grid");
  grid.classList.remove("opacity-50", "pointer-events-none");
}

function selectCommunity(id) {
  wizardState.community_id = id;
  completeStep(3);
  document.querySelector('[data-step="4"]').classList.remove("hidden");
}

/* ===============================
   STEP 4 – Traits
================================ */

const TRAIT_VALUES = [-1, 0, 0, 1, 1, 2];
const TRAITS = [
  "agility",
  "presence",
  "knowledge",
  "strength",
  "finesse",
  "instinct"
];

function renderTraits() {
  const grid = document.getElementById("trait-grid");

  grid.innerHTML = TRAITS.map(trait => `
    <div class="border rounded p-3 bg-white dark:bg-zinc-800">
      <label class="block text-sm mb-1 capitalize">${trait}</label>
      <select
        class="w-full border p-1 rounded dark:bg-zinc-700"
        onchange="setTrait('${trait}', this.value)">
        <option value="">Select</option>
        ${TRAIT_VALUES.map(v =>
          `<option value="${v}">${v >= 0 ? "+" + v : v}</option>`
        ).join("")}
      </select>
    </div>
  `).join("");
}

function setTrait(trait, value) {
  wizardState.traits[trait] = value === "" ? null : parseInt(value);
}

function validateTraits() {
  const selected = Object.values(wizardState.traits);

  if (selected.includes(null)) return false;

  const sortedSelected = [...selected].sort((a,b)=>a-b);
  const sortedPool = [...TRAIT_VALUES].sort((a,b)=>a-b);

  return JSON.stringify(sortedSelected) === JSON.stringify(sortedPool);
}

document.getElementById("step4-complete")
  ?.addEventListener("click", () => {

  if (!validateTraits()) {
    document.getElementById("trait-error")
      .classList.remove("hidden");
    return;
  }

  document.getElementById("trait-error")
    .classList.add("hidden");

  completeStep(4);

  console.log("Final Trait State:", wizardState.traits);

  document.querySelector('[data-step="5"]').classList.remove("hidden");
});

/* ===============================
   STEP 5 – Armor
================================ */

async function loadArmor() {
  const token = (await window.supabase.auth.getSession()).data.session.access_token;

  const response = await fetch(`${API_BASE}/armor`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const armor = await response.json();
  renderArmor(armor);
}

function renderArmor(data) {
  document.getElementById("armor-loading").classList.add("hidden");
  const container = document.getElementById("armor-table");
  container.classList.remove("hidden");

  container.innerHTML = `
    <table class="w-full border text-sm">
      <thead>
        <tr class="bg-zinc-200 dark:bg-zinc-700">
          <th class="p-2">Name</th>
          <th class="p-2">Tier</th>
          <th class="p-2">Thresholds</th>
          <th class="p-2">Score</th>
          <th class="p-2"></th>
        </tr>
      </thead>
      <tbody>
        ${data.map(a => `
          <tr class="border-t">
            <td class="p-2">${a.name}</td>
            <td class="p-2">${a.tier}</td>
            <td class="p-2">${a.base_thresholds}</td>
            <td class="p-2">${a.base_score}</td>
            <td class="p-2">
              <button
                class="border px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                onclick="selectArmor(${a.id})">
                Equip
              </button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function selectArmor(id) {
  wizardState.armor_id = id;
}

document.getElementById("step5-complete")
  ?.addEventListener("click", () => {
    completeStep(5);
    document.querySelector('[data-step="6"]').classList.remove("hidden");
  });


/* ===============================
   STEP 6 – Weapons
================================ */

let cachedWeapons = [];

async function loadWeapons() {
  const token = (await window.supabase.auth.getSession()).data.session.access_token;

  const response = await fetch(`${API_BASE}/weapons`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  cachedWeapons = await response.json();

  renderWeaponTables();
}

function renderWeaponTables() {
  const primary = cachedWeapons.filter(w => w.weapon_type === "primary");
  const secondary = cachedWeapons.filter(w => w.weapon_type === "secondary");

  document.getElementById("primary-weapon-table").innerHTML =
    buildWeaponTable(primary, "primary");

  document.getElementById("secondary-weapon-table").innerHTML =
    buildWeaponTable(secondary, "secondary");
}

function buildWeaponTable(data, type) {
  return `
    <table class="w-full border text-sm">
      <tbody>
        ${data.map(w => `
          <tr class="border-t">
            <td class="p-2">${w.name}</td>
            <td class="p-2">${w.damage}</td>
            <td class="p-2">${w.burden}</td>
            <td class="p-2">
              <button
                class="border px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                onclick="selectWeapon(${w.id}, '${type}', '${w.burden}')">
                Select
              </button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function selectWeapon(id, type, burden) {
  wizardState.weapons[type] = { id, burden };
}

document.getElementById("step6-complete")
  ?.addEventListener("click", () => {

  const primary = wizardState.weapons.primary;
  const secondary = wizardState.weapons.secondary;

  if (!primary) {
    showWeaponError("Primary weapon required.");
    return;
  }

  if (primary.burden === "Two-handed" && secondary) {
    showWeaponError("Two-handed primary cannot equip secondary.");
    return;
  }

  hideWeaponError();
  completeStep(6);
  document.querySelector('[data-step="7"]').classList.remove("hidden");
});

function showWeaponError(msg) {
  const el = document.getElementById("weapon-error");
  el.textContent = msg;
  el.classList.remove("hidden");
}

function hideWeaponError() {
  document.getElementById("weapon-error")
    .classList.add("hidden");
}

/* ===============================
   STEP 7 – Experiences
================================ */

document.getElementById("step7-complete")
  ?.addEventListener("click", () => {

  const exp1 = document.getElementById("exp-1").value.trim();
  const exp2 = document.getElementById("exp-2").value.trim();

  if (!exp1 || !exp2) {
    document.getElementById("exp-error")
      .classList.remove("hidden");
    return;
  }

  document.getElementById("exp-error")
    .classList.add("hidden");

  wizardState.experiences = [exp1, exp2];

  completeStep(7);

  document.querySelector('[data-step="8"]').classList.remove("hidden");
});

/* ===============================
   STEP 8 – Appearance & Background
================================ */

document.getElementById("step8-complete")
  ?.addEventListener("click", () => {

  wizardState.appearance =
    document.getElementById("char-appearance").value.trim();

  wizardState.background =
    document.getElementById("char-background").value.trim();

  completeStep(8);
  document.querySelector('[data-step="9"]').classList.remove("hidden");
  renderReview();

  console.log("FINAL WIZARD STATE:");
  console.log(wizardState);
});

function renderReview() {
  const container = document.getElementById("review-container");

  container.innerHTML = `
    <div>
      <strong>Name:</strong> ${wizardState.name}
    </div>

    <div>
      <strong>Pronouns:</strong> ${wizardState.pronouns || "-"}
    </div>

    <div>
      <strong>Level:</strong> ${wizardState.level}
    </div>

    <div>
      <strong>Traits:</strong>
      <ul class="ml-4 list-disc">
        ${Object.entries(wizardState.traits)
          .map(([k,v]) => `<li>${k}: ${v >= 0 ? "+"+v : v}</li>`)
          .join("")}
      </ul>
    </div>

    <div>
      <strong>Experiences:</strong>
      <ul class="ml-4 list-disc">
        ${wizardState.experiences.map(e => `<li>${e}</li>`).join("")}
      </ul>
    </div>

    <div>
      <strong>Appearance:</strong> ${wizardState.appearance || "-"}
    </div>

    <div>
      <strong>Background:</strong> ${wizardState.background || "-"}
    </div>
  `;
}

/* ===============================
   Utility
================================ */

function completeStep(stepNumber) {
  const step = document.querySelector(`[data-step="${stepNumber}"]`);
  const content = step.querySelector(".wizard-content");
  const status = step.querySelector(".wizard-status");

  content.classList.add("hidden");
  status.textContent = "Complete";
  status.classList.remove("text-zinc-500");
  status.classList.add("text-green-600");

  console.log("Wizard State:", wizardState);
}

//Post to railway
document.getElementById("confirm-character")
  ?.addEventListener("click", async () => {

  try {
    const { data } = await window.supabase.auth.getSession();
    const token = data.session.access_token;

    const response = await fetch(`${API_BASE}/characters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(wizardState)
    });

    if (!response.ok) {
      throw new Error("Failed to create character");
    }

    const result = await response.json();

    window.location.href = "/characters";

  } catch (err) {
    document.getElementById("confirm-error")
      .classList.remove("hidden");
    document.getElementById("confirm-error")
      .textContent = "Character creation failed.";
  }
});