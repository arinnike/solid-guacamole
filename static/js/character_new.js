const API_BASE = window.API_BASE || "https://dhgmtools-api-production.up.railway.app";

let cachedSession = null;
let isSubmitting = false;

let portraitFile = null;
let uploadedPortraitPath = null;
let cachedWeapons = [];

let cachedClasses = [];
let selectedClassId = null;

let cachedAncestries = [];
let cachedCommunities = [];
let selectedAncestryId = null;
let selectedCommunityId = null;

/* ===============================
   Wizard State
================================ */

const wizardState = {
  name: null,
  pronouns: null,
  level: 1,
  portrait_url: null,
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
  weapons: { primary: null, secondary: null },
  experiences: [],
  appearance: "",
  background: ""
};


/* ===============================
   Init Session
================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await window.supabase.auth.getSession();

  if (!data?.session) {
    window.location.href = "/unauthorized";
    return;
  }

  cachedSession = data.session;
});

/* ===============================
   Helpers
================================ */

function getAccessToken() {
  return cachedSession?.access_token || null;
}

async function apiFetch(endpoint) {
  const token = getAccessToken();
  if (!token) return null;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("API error:", text);
    throw new Error(`API failed: ${endpoint}`);
  }

  return await response.json();
}

function openStep(stepNumber, loaderFn) {
  const allSteps = document.querySelectorAll("[data-step]");

  allSteps.forEach(step => {
    const currentStepNumber = Number(step.dataset.step);
    const content = step.querySelector(".wizard-content");

    if (currentStepNumber > stepNumber) {
      // Hide future steps completely
      step.classList.add("hidden");
    } else {
      // Show this step container
      step.classList.remove("hidden");

      // Collapse content by default
      content.classList.add("hidden");
    }
  });

  const currentStep =
    document.querySelector(`[data-step="${stepNumber}"]`);
  const currentContent =
    currentStep.querySelector(".wizard-content");

  // Expand current step
  currentContent.classList.remove("hidden");

  if (loaderFn && !currentContent.dataset.loaded) {
    loaderFn();
    currentContent.dataset.loaded = "true";
  }
}

function completeStep(stepNumber) {
  const step = document.querySelector(`[data-step="${stepNumber}"]`);
  const content = step.querySelector(".wizard-content");
  const status = step.querySelector(".wizard-status");

  content.classList.add("hidden");

  status.innerHTML = `
    <span class="text-green-600 font-medium">Complete</span>
    <button
      class="ml-3 text-sm text-blue-500 hover:underline"
      onclick="editStep(${stepNumber})">
      Edit
    </button>
  `;
}

function getTierFromLevel(level) {
  if (level === 1) return 1;
  if (level >= 2 && level <= 4) return 2;
  if (level >= 5 && level <= 7) return 3;
  if (level >= 8 && level <= 10) return 4;
  return 1; // fallback safety
}

/* ===============================
   Portrait Validation
================================ */

document.getElementById("char-portrait")
?.addEventListener("change", (e) => {

  const file = e.target.files[0];
  const errorEl = document.getElementById("portrait-error");
  const preview = document.getElementById("portrait-preview");

  portraitFile = null;
  errorEl.classList.add("hidden");
  preview.classList.add("hidden");

  if (!file) return;

  const allowed = ["image/jpeg","image/png","image/webp"];
  const maxSize = 2 * 1024 * 1024;

  if (!allowed.includes(file.type)) {
    errorEl.textContent = "Portrait must be PNG, JPG, or WebP.";
    errorEl.classList.remove("hidden");
    e.target.value = "";
    return;
  }

  if (file.size > maxSize) {
    errorEl.textContent = "Portrait must be under 2MB.";
    errorEl.classList.remove("hidden");
    e.target.value = "";
    return;
  }

  portraitFile = file;

  const img = preview.querySelector("img");
  const url = URL.createObjectURL(file);
  img.src = url;
  img.onload = () => URL.revokeObjectURL(url);

  preview.classList.remove("hidden");
});

/* ===============================
   STEP 1
================================ */

document.getElementById("step1-complete")
?.addEventListener("click", () => {

  const name = document.getElementById("char-name").value.trim();
  if (!name) return alert("Character name required.");

  wizardState.name = name;
  wizardState.pronouns =
    document.getElementById("char-pronouns").value.trim() || null;

  wizardState.level =
    parseInt(document.getElementById("char-level").value);

  completeStep(1);
  openStep(2, loadClasses);
});

/* ===============================
   STEP 2 – Classes
================================ */

async function loadClasses() {
  const classes = await apiFetch("/classes");
  renderClasses(classes);
}

function renderClasses(classes) {
  cachedClasses = classes;

  document.getElementById("class-loading").classList.add("hidden");

  const list = document.getElementById("class-list");
  const detailPanel = document.getElementById("class-detail-panel");

  list.innerHTML = classes.map(c => `
    <button
      class="w-full text-left px-4 py-3 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
      data-class-id="${c.id}"
      onclick="selectClass(${c.id})">
      <div class="font-semibold">${c.name}</div>
    </button>
  `).join("");

  renderClassEmptyState();
}

function renderClassEmptyState() {
  const panel = document.getElementById("class-detail-panel");

  panel.innerHTML = `
    <div class="space-y-3 max-w-md">
      <div class="text-xl font-semibold">
        Choose a Class
      </div>
      <div class="text-sm text-zinc-500">
        Your class determines your core features, starting stats, and overall playstyle.
        Select one from the list to view its details.
      </div>
    </div>
  `;
}

function selectClass(classId) {
  selectedClassId = classId;

  // Highlight selected
  document.querySelectorAll("#class-list button")
    .forEach(btn => {
      btn.classList.remove("ring-2","ring-blue-500");
      if (parseInt(btn.dataset.classId) === classId) {
        btn.classList.add("ring-2","ring-blue-500");
      }
    });

  const selectedClass =
    cachedClasses.find(c => Number(c.id) === Number(classId));

  renderClassDetail(selectedClass);
}

function renderClassDetail(c) {
  const panel = document.getElementById("class-detail-panel");

  // Remove empty-state centering classes
  panel.classList.remove("flex","items-center","justify-center","text-center");

  panel.innerHTML = `
    <div class="space-y-6">

      <div>
        <h2 class="text-2xl font-bold mb-2">${c.name}</h2>
        <p class="text-zinc-500">${c.class_description || ""}</p>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">

        <div>
          <div class="font-semibold">Starting HP</div>
          <div>${c.starting_hp ?? "-"}</div>
        </div>

        <div>
          <div class="font-semibold">Starting Evasion</div>
          <div>${c.starting_evasion ?? "-"}</div>
        </div>

        <div class="col-span-2">
          <div class="font-semibold">Starting Items</div>
          <div class="text-zinc-500">${c.starting_items ?? "-"}</div>
        </div>

        <div class="col-span-2">
          <div class="font-semibold">Hope Feature</div>
          <div class="text-zinc-500">${c.hope_feature ?? "-"}</div>
        </div>

        <div class="col-span-2">
          <div class="font-semibold">Class Feature</div>
          <div class="text-zinc-500">${c.class_feature ?? "-"}</div>
        </div>

      </div>

      <div>
        <div class="font-semibold mb-3 text-lg">
            Choose Your Subclass
        </div>

        <div class="space-y-4">
            ${(c.subclasses || []).map(s => `
            <div class="border rounded p-4 bg-zinc-50/60 dark:bg-zinc-800 space-y-3">

                <div>
                <div class="font-semibold text-base">
                    ${s.subclass_name}
                </div>
                <div class="text-sm text-zinc-500">
                    ${s.subclass_description ?? ""}
                </div>
                </div>

                <div class="text-sm space-y-2">

                <div>
                    <span class="font-semibold">Foundation Feature:</span>
                    <div class="text-zinc-500">
                    ${s.foundation_feature ?? "-"}
                    </div>
                </div>

                <div>
                    <span class="font-semibold">Mastery Feature:</span>
                    <div class="text-zinc-500">
                    ${s.mastery_feature ?? "-"}
                    </div>
                </div>

                </div>

                <button
                class="mt-2 px-4 py-2 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                onclick="selectSubclass(${c.id}, ${s.id})">
                Select ${s.subclass_name}
                </button>

            </div>
            `).join("")}
        </div>
        </div>

    </div>
  `;

  panel.classList.remove("hidden");
}

function selectSubclass(classId, subclassId) {
  wizardState.class_id = classId;
  wizardState.subclass_id = subclassId;

  completeStep(2);
  openStep(3, async () => {
    await loadAncestries();
    await loadCommunities();
  });
}

/* ===============================
   STEP 3 – Heritage
================================ */

async function loadAncestries() {

  //Show loading message
  const loading =
    document.getElementById("ancestry-loading");

  if (loading) {
    loading.classList.remove("hidden");
  }

  const data = await apiFetch("/ancestries");

  renderAncestries(data);
}

async function loadCommunities() {
  renderCommunities(await apiFetch("/communities"));
}

function renderAncestries(data) {
  cachedAncestries = data;

  //Hide loading text once data is ready
  const loading =
    document.getElementById("ancestry-loading");

  if (loading) {
    loading.classList.add("hidden");
  }

  const list = document.getElementById("ancestry-list");

  list.innerHTML = data.map(a => `
    <button
      class="w-full text-left px-4 py-3 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
      data-ancestry-id="${a.id}"
      onclick="selectAncestry(${a.id})">
      <div class="font-semibold">${a.name}</div>
    </button>
  `).join("");

  renderAncestryEmptyState();
}

function renderAncestryEmptyState() {
  const panel = document.getElementById("ancestry-detail-panel");

  panel.innerHTML = `
    <div class="space-y-3 max-w-md">
      <div class="text-xl font-semibold">
        Select an Ancestry
      </div>
      <div class="text-sm text-zinc-500">
        Your ancestry influences your physical traits and heritage features.
      </div>
    </div>
  `;
}

function renderCommunities(data) {
  cachedCommunities = data;

  document.getElementById("community-loading")
    .classList.add("hidden");

  const list = document.getElementById("community-list");

  list.innerHTML = data.map(c => `
    <button
      class="w-full text-left px-4 py-3 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
      data-community-id="${c.id}"
      onclick="selectCommunity(${c.id})">
      <div class="font-semibold">${c.name}</div>
    </button>
  `).join("");

  renderCommunityEmptyState();
}

function renderCommunityEmptyState() {
  const panel =
    document.getElementById("community-detail-panel");

  panel.innerHTML = `
    <div class="space-y-3 max-w-md">
      <div class="text-xl font-semibold">
        Select a Community
      </div>
      <div class="text-sm text-zinc-500">
        Your community reflects your upbringing,
        culture, and social background.
      </div>
    </div>
  `;
}

function selectAncestry(id) {

  wizardState.ancestry_id = id;

  document.querySelectorAll("#ancestry-list button")
    .forEach(btn => {
      btn.classList.remove("ring-2","ring-blue-500","bg-zinc-100","dark:bg-zinc-700");

      if (Number(btn.dataset.ancestryId) === Number(id)) {
        btn.classList.add("ring-2","ring-blue-500","bg-zinc-100","dark:bg-zinc-700");
      }
    });

  const selected =
    cachedAncestries.find(a => Number(a.id) === Number(id));

  renderAncestryDetail(selected);

  // Unlock community
  const communitySection =
    document.getElementById("community-section");

  communitySection.classList.remove("opacity-50","pointer-events-none");

  wizardState.community_id = null;

    document.querySelectorAll("#community-list button")
    .forEach(btn => {
        btn.classList.remove("ring-2","ring-blue-500","bg-zinc-100","dark:bg-zinc-700");
    });

    renderCommunityEmptyState();
}

function renderAncestryDetail(a) {

  const panel =
    document.getElementById("ancestry-detail-panel");

  panel.classList.remove("flex","items-center","justify-center","text-center");

  panel.innerHTML = `
    <div class="space-y-6">

      <div>
        <h2 class="text-2xl font-bold">${a.name}</h2>
        <p class="text-zinc-500">${a.description}</p>
      </div>

      <div class="text-sm space-y-3">
        <div>
          <span class="font-semibold">Feature 1:</span>
          <div class="text-zinc-500">${a.feature_1}</div>
        </div>
        <div>
          <span class="font-semibold">Feature 2:</span>
          <div class="text-zinc-500">${a.feature_2}</div>
        </div>
        <div>
          <span class="font-semibold">Height:</span>
          <div class="text-zinc-500">${a.height}</div>
        </div>
        <div>
          <span class="font-semibold">Lifespan:</span>
          <div class="text-zinc-500">${a.lifespan}</div>
        </div>
      </div>
    </div>
  `;
}

function selectCommunity(id) {

  wizardState.community_id = id;

  document.querySelectorAll("#community-list button")
    .forEach(btn => {
      btn.classList.remove("ring-2","ring-blue-500","bg-zinc-100","dark:bg-zinc-700");

      if (Number(btn.dataset.communityId) === Number(id)) {
        btn.classList.add("ring-2","ring-blue-500","bg-zinc-100","dark:bg-zinc-700");
      }
    });

  const selected =
    cachedCommunities.find(c => Number(c.id) === Number(id));

  renderCommunityDetail(selected);
}

function renderCommunityDetail(c) {

  const panel =
    document.getElementById("community-detail-panel");

  panel.classList.remove("flex","items-center","justify-center","text-center");

  panel.innerHTML = `
    <div class="space-y-6">

      <div>
        <h2 class="text-2xl font-bold">${c.name}</h2>
        <p class="text-zinc-500">${c.description}</p>
      </div>

      <div class="text-sm space-y-3">
        <div>
          <span class="font-semibold">Adjectives:</span>
          <div class="text-zinc-500">${c.adjectives}</div>
        </div>

        <div>
          <span class="font-semibold">Community Feature:</span>
          <div class="text-zinc-500">${c.community_feature}</div>
        </div>
      </div>

    </div>
  `;
}


/* ===============================
   STEP 4 – Traits (Pool Enforced)
================================ */

const TRAIT_VALUES = [-1,0,0,1,1,2];
const TRAITS = ["agility","presence","knowledge","strength","finesse","instinct"];

function renderTraits() {
  const grid = document.getElementById("trait-grid");

  grid.innerHTML = TRAITS.map(trait => `
    <div class="border rounded p-3 bg-white dark:bg-zinc-800">
      <label class="block text-sm mb-1 capitalize">${trait}</label>
      <select class="w-full border p-1 rounded dark:bg-zinc-700"
        data-trait="${trait}">
      </select>
    </div>
  `).join("");

  updateTraitDropdowns();
}

function updateTraitDropdowns() {
  const selects = document.querySelectorAll("#trait-grid select");

  // Count selected values
  const selectedValues = Object.values(wizardState.traits)
    .filter(v => v !== null);

  // Clone pool
  const remainingPool = [...TRAIT_VALUES];

  // Remove already-used values
  selectedValues.forEach(val => {
    const index = remainingPool.indexOf(val);
    if (index !== -1) remainingPool.splice(index, 1);
  });

  selects.forEach(select => {
    const trait = select.dataset.trait;
    const currentValue = wizardState.traits[trait];

    select.innerHTML = `<option value="">Select</option>`;

    // If trait already has a value, allow it to remain selectable
    const allowed = currentValue !== null
      ? [...remainingPool, currentValue]
      : [...remainingPool];

    const uniqueSorted = [...new Set(allowed)].sort((a,b)=>a-b);

    uniqueSorted.forEach(val => {
      const option = document.createElement("option");
      option.value = val;
      option.textContent = val >= 0 ? `+${val}` : val;

      if (val === currentValue) option.selected = true;

      select.appendChild(option);
    });

    select.onchange = (e) => {
      wizardState.traits[trait] =
        e.target.value === "" ? null : parseInt(e.target.value);

      updateTraitDropdowns();
    };
  });
}

document.getElementById("step3-complete")
?.addEventListener("click", () => {

  if (!wizardState.ancestry_id || !wizardState.community_id) {
    alert("Please choose both an ancestry and a community.");
    return;
  }

  completeStep(3);
  openStep(4, renderTraits);
});

document.getElementById("step4-complete")
?.addEventListener("click", () => {

  const selected = Object.values(wizardState.traits);
  if (selected.includes(null)) {
    document.getElementById("trait-error").classList.remove("hidden");
    return;
  }

  document.getElementById("trait-error").classList.add("hidden");
  completeStep(4);
  openStep(5, loadArmor);
});

/* ===============================
   STEP 5 – Armor
================================ */

let cachedArmor = [];
let selectedArmorId = null;

async function loadArmor() {

  // Reset selection when loading
  wizardState.armor_id = null;
  selectedArmorId = null;

  const allArmor = await apiFetch("/armor");

  const characterTier =
    getTierFromLevel(wizardState.level);

  const filteredArmor =
    allArmor.filter(a => Number(a.tier) === characterTier);

  cachedArmor = filteredArmor;

  renderArmor(filteredArmor);
}

function renderArmor(data) {

  document.getElementById("armor-loading")
    .classList.add("hidden");

  const selector =
    document.getElementById("armor-selector");

  selector.classList.remove("hidden");

  const tier = getTierFromLevel(wizardState.level);

  const tierMessage =
    document.getElementById("armor-tier-message");

  tierMessage.textContent =
    `Showing Tier ${tier} armor based on Level ${wizardState.level}.`;

  tierMessage.classList.remove("hidden");

  const list =
    document.getElementById("armor-list");

  list.innerHTML = data.length === 0
    ? `<div class="text-sm text-zinc-500">No armor available for this tier.</div>`
    : data.map(a => `
        <button
          class="w-full text-left px-4 py-3 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
          data-armor-id="${a.id}"
          onclick="selectArmor(${a.id})">
          <div class="font-semibold">${a.name}</div>
          <div class="text-xs text-zinc-500">Tier ${a.tier}</div>
        </button>
      `).join("");

  renderArmorEmptyState();
}

function renderArmorEmptyState() {
  const panel =
    document.getElementById("armor-detail-panel");

  panel.innerHTML = `
    <div class="space-y-3 max-w-md">
      <div class="text-xl font-semibold">
        Select Armor (Optional)
      </div>
      <div class="text-sm text-zinc-500">
        Armor modifies your defensive thresholds and may grant special features.
        You may also choose to proceed without armor.
      </div>
    </div>
  `;
}

function selectArmor(id) {

  selectedArmorId = id;
  wizardState.armor_id = id;

  document.querySelectorAll("#armor-list button")
    .forEach(btn => {
      btn.classList.remove("ring-2","ring-blue-500");
      if (Number(btn.dataset.armorId) === Number(id)) {
        btn.classList.add("ring-2","ring-blue-500");
      }
    });

  const selected =
    cachedArmor.find(a => Number(a.id) === Number(id));

  renderArmorDetail(selected);
}

function renderArmorDetail(a) {

  const panel =
    document.getElementById("armor-detail-panel");

  panel.classList.remove("flex","items-center","justify-center","text-center");

  panel.innerHTML = `
    <div class="space-y-4">
      <h2 class="text-2xl font-bold">${a.name}</h2>

      <div class="text-sm space-y-3">

        <div>
          <span class="font-semibold">Tier:</span>
          <div class="text-zinc-500">${a.tier}</div>
        </div>

        <div>
          <span class="font-semibold">Base Score:</span>
          <div class="text-zinc-500">${a.base_score}</div>
        </div>

        <div>
          <span class="font-semibold">Base Thresholds:</span>
          <div class="text-zinc-500">${a.base_thresholds}</div>
        </div>

        <div>
          <span class="font-semibold">Feature:</span>
          <div class="text-zinc-500">${a.feature}</div>
        </div>

      </div>
    </div>
  `;
}

document.getElementById("step5-complete")
?.addEventListener("click", () => {

  // Optional step — no validation required

  completeStep(5);
  openStep(6, loadWeapons);
});

/* ===============================
   STEP 6 – Weapons
================================ */

async function loadWeapons(){
  cachedWeapons = await apiFetch("/weapons");
  renderWeaponTables();
}

function renderWeaponTables(){
  const primary = cachedWeapons.filter(w=>w.weapon_type==="primary");
  const secondary = cachedWeapons.filter(w=>w.weapon_type==="secondary");

  document.getElementById("primary-weapon-table")
    .innerHTML = buildWeaponTable(primary,"primary");

  document.getElementById("secondary-weapon-table")
    .innerHTML = buildWeaponTable(secondary,"secondary");
}

function buildWeaponTable(data,type){
  return `
    <table class="w-full border text-sm">
      <tbody>
        ${data.map(w=>`
          <tr class="border-t">
            <td class="p-2">${w.name}</td>
            <td class="p-2">${w.damage}</td>
            <td class="p-2">
              <button class="border px-2 py-1 rounded"
                onclick="selectWeapon(${w.id},'${type}','${w.burden}')">
                Select
              </button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function selectWeapon(id,type,burden){
  wizardState.weapons[type]={id,burden};
}

document.getElementById("step6-complete")
?.addEventListener("click",()=>{
  const p = wizardState.weapons.primary;
  const s = wizardState.weapons.secondary;

  if (!p) {
    document.getElementById("weapon-error").textContent =
      "Primary weapon required.";
    document.getElementById("weapon-error").classList.remove("hidden");
    return;
  }

  if (p.burden==="Two-handed" && s){
    document.getElementById("weapon-error").textContent =
      "Two-handed weapon cannot equip secondary.";
    document.getElementById("weapon-error").classList.remove("hidden");
    return;
  }

  document.getElementById("weapon-error").classList.add("hidden");
  completeStep(6);
  openStep(7);
});

/* ===============================
   STEP 7 – Experiences
================================ */

document.getElementById("step7-complete")
?.addEventListener("click",()=>{

  const e1 = document.getElementById("exp-1").value.trim();
  const e2 = document.getElementById("exp-2").value.trim();

  if (!e1 || !e2){
    document.getElementById("exp-error").textContent =
      "Two experiences required.";
    document.getElementById("exp-error").classList.remove("hidden");
    return;
  }

  wizardState.experiences=[e1,e2];
  document.getElementById("exp-error").classList.add("hidden");

  completeStep(7);
  openStep(8);
});

/* ===============================
   STEP 8 – Details
================================ */

document.getElementById("step8-complete")
?.addEventListener("click",()=>{

  wizardState.appearance =
    document.getElementById("char-appearance").value.trim();

  wizardState.background =
    document.getElementById("char-background").value.trim();

  completeStep(8);
  openStep(9);
  renderReview();
});

function editStep(stepNumber) {
  resetFromStep(stepNumber);
  openStep(stepNumber);
}

function resetFromStep(stepNumber) {

  const totalSteps = 9;

  for (let i = stepNumber; i <= totalSteps; i++) {
    const step = document.querySelector(`[data-step="${i}"]`);
    const status = step.querySelector(".wizard-status");

    status.textContent = "";
  }

  // Reset wizardState downstream

  if (stepNumber <= 2) {
    wizardState.class_id = null;
    wizardState.subclass_id = null;
  }

  if (stepNumber <= 3) {
    wizardState.ancestry_id = null;
    wizardState.community_id = null;
  }

  if (stepNumber <= 4) {
    wizardState.traits = {
      agility: null,
      presence: null,
      knowledge: null,
      strength: null,
      finesse: null,
      instinct: null
    };
  }

  if (stepNumber <= 5) {
    wizardState.armor_id = null;
  }

  if (stepNumber <= 6) {
    wizardState.weapons = { primary: null, secondary: null };
  }

  if (stepNumber <= 7) {
    wizardState.experiences = [];
  }

  if (stepNumber <= 8) {
    wizardState.appearance = "";
    wizardState.background = "";
  }
}

/* ===============================
   STEP 9 – Review + Submit
================================ */

function renderReview(){
  const container =
    document.getElementById("review-container");

  container.innerHTML = `
    <div><strong>Name:</strong> ${wizardState.name}</div>
    <div><strong>Level:</strong> ${wizardState.level}</div>
    <div><strong>Experiences:</strong>
      <ul class="ml-4 list-disc">
        ${wizardState.experiences.map(e=>`<li>${e}</li>`).join("")}
      </ul>
    </div>
  `;
}

document.getElementById("confirm-character")
?.addEventListener("click", async ()=>{

  if (isSubmitting) return;
  isSubmitting=true;

  try{
    const token=getAccessToken();

    if (portraitFile){
      const userId=cachedSession.user.id;
      const path=`${userId}/${crypto.randomUUID()}.${portraitFile.name.split(".").pop()}`;

      const {error}=await window.supabase
        .storage.from("portraits")
        .upload(path,portraitFile);

      if (error) throw error;

      uploadedPortraitPath=path;

      const {data}=window.supabase
        .storage.from("portraits")
        .getPublicUrl(path);

      wizardState.portrait_url=data.publicUrl;
    }

    const response=await fetch(`${API_BASE}/characters`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      body:JSON.stringify(wizardState)
    });

    if (!response.ok) throw new Error("Creation failed");

    window.location.href="/characters";

  }catch(err){

    if (uploadedPortraitPath){
      await window.supabase
        .storage.from("portraits")
        .remove([uploadedPortraitPath]);
    }

    document.getElementById("confirm-error")
      .classList.remove("hidden");

    isSubmitting=false;
  }
});

function toggleClassCard(classId) {
  const allCards = document.querySelectorAll("[data-class-id]");

  allCards.forEach(card => {
    const content = card.querySelector(".class-content");
    const icon = card.querySelector("button span:last-child");

    if (parseInt(card.dataset.classId) === classId) {
      const isHidden = content.classList.contains("hidden");

      // Collapse all first
      document.querySelectorAll(".class-content")
        .forEach(c => c.classList.add("hidden"));

      document.querySelectorAll("[data-class-id] button span:last-child")
        .forEach(i => i.textContent = "+");

      if (isHidden) {
        content.classList.remove("hidden");
        icon.textContent = "–";
      }

    } else {
      content.classList.add("hidden");
      icon.textContent = "+";
    }
  });
}

