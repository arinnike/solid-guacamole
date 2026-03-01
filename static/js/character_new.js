const API_BASE = window.API_BASE || "https://dhgmtools-api-production.up.railway.app";

let cachedSession = null;
let isSubmitting = false;

let portraitFile = null;
let uploadedPortraitPath = null;
let cachedWeapons = [];

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

  // Close all steps first
  allSteps.forEach(step => {
    step.querySelector(".wizard-content")
      .classList.add("hidden");
  });

  const step = document.querySelector(`[data-step="${stepNumber}"]`);
  const content = step.querySelector(".wizard-content");

  content.classList.remove("hidden");

  if (loaderFn && !content.dataset.loaded) {
    loaderFn();
    content.dataset.loaded = "true";
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
  document.getElementById("class-loading").classList.add("hidden");
  const grid = document.getElementById("class-grid");
  grid.classList.remove("hidden");

  grid.innerHTML = classes.map(c => `
    <div class="border rounded bg-white dark:bg-zinc-800 overflow-hidden transition-all duration-200"
         data-class-id="${c.id}">

      <button
        class="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-700"
        onclick="toggleClassCard(${c.id})">

        <span class="font-semibold text-lg">${c.name}</span>
        <span class="text-sm opacity-60">+</span>
      </button>

      <div class="class-content hidden px-4 pb-4 space-y-4">

            <p class="text-sm text-zinc-500">
                ${c.class_description || ""}
            </p>

            <div class="grid grid-cols-2 gap-4 text-sm">

                <div>
                <span class="font-semibold">Starting HP:</span>
                <div>${c.starting_hp ?? "-"}</div>
                </div>

                <div>
                <span class="font-semibold">Starting Evasion:</span>
                <div>${c.starting_evasion ?? "-"}</div>
                </div>

                <div class="col-span-2">
                <span class="font-semibold">Starting Items:</span>
                <div class="text-zinc-500">${c.starting_items ?? "-"}</div>
                </div>

                <div class="col-span-2">
                <span class="font-semibold">Hope Feature:</span>
                <div class="text-zinc-500">${c.hope_feature ?? "-"}</div>
                </div>

                <div class="col-span-2">
                <span class="font-semibold">Class Feature:</span>
                <div class="text-zinc-500">${c.class_feature ?? "-"}</div>
                </div>

            </div>

            <div class="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <div class="text-sm font-semibold mb-2">Choose Subclass</div>
                <div class="space-y-2">
                ${c.subclasses?.map(s => `
                    <button
                    class="w-full border rounded py-2 px-3 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                    onclick="selectSubclass(${c.id}, ${s.id})">
                    ${s.subclass_name}
                    </button>
                `).join("")}
                </div>
            </div>
        </div>
    </div>
  `).join("");
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
  renderAncestries(await apiFetch("/ancestries"));
}

async function loadCommunities() {
  renderCommunities(await apiFetch("/communities"));
}

function renderAncestries(data) {
  document.getElementById("ancestry-loading").classList.add("hidden");
  const grid = document.getElementById("ancestry-grid");
  grid.classList.remove("hidden");

  grid.innerHTML = data.map(a => `
    <button class="border rounded p-4 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700"
      onclick="selectAncestry(${a.id})">
      <h4 class="font-semibold">${a.name}</h4>
      <p class="text-sm text-zinc-500">${a.description}</p>
    </button>
  `).join("");
}

function renderCommunities(data) {
  const grid = document.getElementById("community-grid");
  grid.classList.remove("hidden");

  grid.innerHTML = data.map(c => `
    <button class="border rounded p-4 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700"
      onclick="selectCommunity(${c.id})">
      <h4 class="font-semibold">${c.name}</h4>
      <p class="text-sm text-zinc-500">${c.description}</p>
    </button>
  `).join("");
}

function selectAncestry(id) {
  wizardState.ancestry_id = id;
  document.getElementById("community-grid")
    .classList.remove("opacity-50","pointer-events-none");
}

function selectCommunity(id) {
  wizardState.community_id = id;
  completeStep(3);
  openStep(4, renderTraits);
}

/* ===============================
   STEP 4 – Traits
================================ */

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

async function loadArmor(){
  const armor = await apiFetch("/armor");
  renderArmor(armor);
}

function renderArmor(data){
  document.getElementById("armor-loading").classList.add("hidden");
  const container = document.getElementById("armor-table");
  container.classList.remove("hidden");

  container.innerHTML = `
    <table class="w-full border text-sm">
      <tbody>
        ${data.map(a=>`
          <tr class="border-t">
            <td class="p-2">${a.name}</td>
            <td class="p-2">${a.tier}</td>
            <td class="p-2">
              <button class="border px-2 py-1 rounded"
                onclick="wizardState.armor_id=${a.id}">
                Equip
              </button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

document.getElementById("step5-complete")
?.addEventListener("click",()=>{
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

