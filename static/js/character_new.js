const API_BASE = window.API_BASE || "https://dhgmtools-api-production.up.railway.app";

let isSubmitting = false;
let cachedSession = null;

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
  weapons: {
    primary: null,
    secondary: null
  },
  experiences: [],
  appearance: "",
  background: ""
};

/* ===============================
   Session Init
================================ */

async function initSession() {
  const { data } = await window.supabase.auth.getSession();

  if (!data?.session) {
    window.location.href = "/unauthorized";
    return;
  }

  cachedSession = data.session;
}

function getAccessToken() {
  return cachedSession?.access_token || null;
}

initSession();

/* ===============================
   Wizard Toggle
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
   Portrait Validation + Preview
================================ */

document.getElementById("char-portrait")
  ?.addEventListener("change", (e) => {

  const file = e.target.files[0];
  const errorEl = document.getElementById("portrait-error");
  const preview = document.getElementById("portrait-preview");

  errorEl.classList.add("hidden");
  errorEl.textContent = "";
  preview.classList.add("hidden");

  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 2 * 1024 * 1024; // 2MB
  
  e.target.classList.remove("border-red-500");

  if (!allowedTypes.includes(file.type)) {
    errorEl.textContent = "Portrait must be PNG, JPG, or WebP.";
    errorEl.classList.remove("hidden");
    e.target.value = "";
    e.target.classList.add("border-red-500");
    return;
  }

  if (file.size > maxSize) {
    errorEl.textContent = "Portrait must be under 2MB.";
    errorEl.classList.remove("hidden");
    e.target.value = "";
    e.target.classList.add("border-red-500");
    return;
  }

  // Preview
  const img = preview.querySelector("img");

  const objectUrl = URL.createObjectURL(file);
  img.src = objectUrl;

  img.onload = () => {
    URL.revokeObjectURL(objectUrl);
  };

  preview.classList.remove("hidden");
});

/* ===============================
   STEP 1 – Basics
================================ */

document.getElementById("step1-complete")
  ?.addEventListener("click", async () => {

  const name = document.getElementById("char-name").value.trim();
  const pronouns = document.getElementById("char-pronouns").value.trim();
  const level = parseInt(document.getElementById("char-level").value);
  const file = document.getElementById("char-portrait").files[0];

  if (!name) {
    alert("Character name is required.");
    return;
  }

  wizardState.name = name;
  wizardState.pronouns = pronouns || null;
  wizardState.level = level;

  if (file) {
    try {
      const userId = cachedSession.user.id;

      const fileExt = file.name.split(".").pop().toLowerCase();
      const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await window.supabase
        .storage
        .from("portraits")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = window.supabase
        .storage
        .from("portraits")
        .getPublicUrl(filePath);

      wizardState.portrait_url = publicUrlData.publicUrl;

    } catch (err) {
      console.error("Portrait upload failed:", err);
      alert("Portrait upload failed.");
      return;
    }
  }

  completeStep(1);
  document.querySelector('[data-step="2"]').classList.remove("hidden");
});

/* ===============================
   API Helpers
================================ */

async function apiFetch(endpoint) {
  const token = getAccessToken();
  if (!token) return null;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.json();
}

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
    <button
      class="border rounded p-4 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700"
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
  document.getElementById("community-grid")
    .classList.remove("opacity-50", "pointer-events-none");
}

function selectCommunity(id) {
  wizardState.community_id = id;
  completeStep(3);
  document.querySelector('[data-step="4"]').classList.remove("hidden");
}

/* ===============================
   Traits + Final Confirm
   (unchanged logic)
================================ */

const TRAIT_VALUES = [-1, 0, 0, 1, 1, 2];
const TRAITS = ["agility","presence","knowledge","strength","finesse","instinct"];

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

  return JSON.stringify([...selected].sort((a,b)=>a-b))
       === JSON.stringify([...TRAIT_VALUES].sort((a,b)=>a-b));
}

document.getElementById("confirm-character")
  ?.addEventListener("click", async () => {

  if (isSubmitting) return;
  isSubmitting = true;

  const btn = document.getElementById("confirm-character");
  btn.disabled = true;
  btn.textContent = "Creating...";

  try {
    const token = getAccessToken();
    if (!token) return;

    const response = await fetch(`${API_BASE}/characters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(wizardState)
    });

    if (!response.ok) throw new Error("Creation failed");

    window.location.href = "/characters";

  } catch (err) {
    document.getElementById("confirm-error").classList.remove("hidden");
    document.getElementById("confirm-error").textContent =
      "Character creation failed.";

    isSubmitting = false;
    btn.disabled = false;
    btn.textContent = "Create Character";
  }
});

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
}