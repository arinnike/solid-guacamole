/* =========================================
   STEP 3 – Heritage
========================================= */

let cachedAncestries = [];
let cachedCommunities = [];

/* ---------- Loader ---------- */

async function loadAncestries() {

  const loading =
    document.getElementById("ancestry-loading");

  if (loading) {
    loading.classList.remove("hidden");
  }

  const data =
    await apiFetch("/ancestries");

  cachedAncestries = data;

  renderAncestryList(data);

  if (loading) {
    loading.classList.add("hidden");
  }

  // Load communities at same time
  loadCommunities();
}

async function loadCommunities() {

  const loading =
    document.getElementById("community-loading");

  if (loading) {
    loading.classList.remove("hidden");
  }

  const data =
    await apiFetch("/communities");

  cachedCommunities = data;

  renderCommunityList(data);

  if (loading) {
    loading.classList.add("hidden");
  }
}

/* ---------- Render Lists ---------- */

function renderAncestryList(data) {

  const list =
    document.getElementById("ancestry-list");

  if (!list) return;

  list.innerHTML = data.map(a => `
    <button
      class="w-full text-left px-4 py-3 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
      data-id="${a.id}"
      onclick="selectAncestry(${a.id})">
      <div class="font-semibold">${a.name}</div>
    </button>
  `).join("");

  renderAncestryEmptyState();
}

function renderCommunityList(data) {

  const list =
    document.getElementById("community-list");

  if (!list) return;

  list.innerHTML = data.map(c => `
    <button
      class="w-full text-left px-4 py-3 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
      data-id="${c.id}"
      onclick="selectCommunity(${c.id})">
      <div class="font-semibold">${c.name}</div>
    </button>
  `).join("");

  renderCommunityEmptyState();
}

/* ---------- Empty States ---------- */

function renderAncestryEmptyState() {

  const panel =
    document.getElementById("ancestry-detail-panel");

  if (!panel) return;

  panel.innerHTML = `
    <div class="space-y-3 max-w-md">
      <div class="text-xl font-semibold">
        Select an Ancestry
      </div>
      <div class="text-sm text-zinc-500">
        Your ancestry defines your heritage and physical traits.
      </div>
    </div>
  `;
}

function renderCommunityEmptyState() {

  const panel =
    document.getElementById("community-detail-panel");

  if (!panel) return;

  panel.innerHTML = `
    <div class="space-y-3 max-w-md">
      <div class="text-xl font-semibold">
        Select a Community
      </div>
      <div class="text-sm text-zinc-500">
        Your community reflects your upbringing and social background.
      </div>
    </div>
  `;
}

/* ---------- Selection ---------- */

function selectAncestry(id) {

  wizardState.ancestry_id = id;

  document.querySelectorAll("#ancestry-list button")
    .forEach(btn => {
      btn.classList.remove(
        "ring-2","ring-blue-500",
        "bg-zinc-100","dark:bg-zinc-700"
      );

      if (Number(btn.dataset.id) === Number(id)) {
        btn.classList.add(
          "ring-2","ring-blue-500",
          "bg-zinc-100","dark:bg-zinc-700"
        );
      }
    });

  const selected =
    cachedAncestries.find(a =>
      Number(a.id) === Number(id)
    );

  renderAncestryDetail(selected);
}

function selectCommunity(id) {

  wizardState.community_id = id;

  document.querySelectorAll("#community-list button")
    .forEach(btn => {
      btn.classList.remove(
        "ring-2","ring-blue-500",
        "bg-zinc-100","dark:bg-zinc-700"
      );

      if (Number(btn.dataset.id) === Number(id)) {
        btn.classList.add(
          "ring-2","ring-blue-500",
          "bg-zinc-100","dark:bg-zinc-700"
        );
      }
    });

  const selected =
    cachedCommunities.find(c =>
      Number(c.id) === Number(id)
    );

  renderCommunityDetail(selected);
}

/* ---------- Detail Panels ---------- */

function renderAncestryDetail(a) {

  const panel =
    document.getElementById("ancestry-detail-panel");

  if (!panel || !a) return;

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

function renderCommunityDetail(c) {

  const panel =
    document.getElementById("community-detail-panel");

  if (!panel || !c) return;

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

/* ---------- Continue Logic ---------- */

document.addEventListener("DOMContentLoaded", () => {

  const btn =
    document.getElementById("step3-complete");

  if (!btn) return;

  btn.addEventListener("click", () => {

    if (!wizardState.ancestry_id ||
        !wizardState.community_id) {

      alert("Please select both ancestry and community.");
      return;
    }

    completeStep(3);
    openStep(4);
  });

});