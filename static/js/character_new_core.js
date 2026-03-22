/* =========================================
   CHARACTER NEW – CORE
   Shared State + Shared Helpers Only
========================================= */

const API_BASE =
  window.API_BASE || "https://dhgmtools-api-production.up.railway.app";

/* =========================================
   GLOBAL STATE
========================================= */

let cachedSession = null;

const wizardState = {
  name: null,
  pronouns: null,
  level: 1,
  portrait_url: null,

  class_id: null,
  subclass_id: null,
  spellcast_trait: null,

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

/* =========================================
   DOM READY – Session + Step Toggle
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

  /* ---------- SESSION INIT ---------- */

  const { data } =
    await window.supabase.auth.getSession();

  if (!data?.session) {
    window.location.href = "/unauthorized";
    return;
  }

  cachedSession = data.session;

});

/* =========================================
   AUTH HELPERS
========================================= */

function getAccessToken() {
  return cachedSession?.access_token || null;
}

/* =========================================
   API HELPER
========================================= */

async function apiFetch(endpoint, options = {}) {

  const token = getAccessToken();

  if (!token) {
    throw new Error("No access token available.");
  }

  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("API error:", text);
    throw new Error(`API failed: ${endpoint}`);
  }

  return await response.json();
}

/* =========================================
   WIZARD NAVIGATION
========================================= */

function openStep(stepNumber, loaderFn) {

  const step =
    document.querySelector(
      `[data-step="${stepNumber}"]`
    );

  if (!step) return;

  step.classList.remove("hidden");

  const content =
    step.querySelector(".wizard-content");

  if (!content) return;

  content.classList.remove("hidden");

  if (loaderFn && !content.dataset.loaded) {
    loaderFn();
    content.dataset.loaded = "true";
  }
}

function completeStep(stepNumber) {

  const step =
    document.querySelector(
      `[data-step="${stepNumber}"]`
    );

  if (!step) return;

  const content =
    step.querySelector(".wizard-content");

  const status =
    step.querySelector(".wizard-status");

  if (content) {
    content.classList.add("hidden");
  }

  if (status) {

    status.innerHTML = `
      <span class="text-green-600">Complete</span>
      <button
        type="button"
        class="ml-2 text-xs text-blue-600 hover:underline"
        onclick="editStep(${stepNumber})">
        Edit
      </button>
    `;

    status.classList.remove("text-zinc-500");
  }
}

/* =========================================
   TIER HELPERS
========================================= */

//Shared by Armor + Weapons
function getTierFromLevel(level) {

  if (level <= 1) return 1;
  if (level >= 2 && level <= 4) return 2;
  if (level >= 5 && level <= 7) return 3;
  if (level >= 8 && level <= 10) return 4;

  return 1;
}

// Reopens a completed step for editing without reloading its data
function editStep(stepNumber) {

  const step =
    document.querySelector(
      `[data-step="${stepNumber}"]`
    );

  if (!step) return;

  const content =
    step.querySelector(".wizard-content");

  if (!content) return;

  content.classList.remove("hidden");
}