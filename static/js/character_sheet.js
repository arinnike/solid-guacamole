const API_BASE = window.API_BASE || "https://dhgmtools-api-production.up.railway.app";

/*
================================
Get Character ID From URL PATH
================================
Example:
  /characters/abc-123
*/
function getCharacterIdFromPath() {
  const parts = window.location.pathname.split("/");
  return parts[parts.length - 1];
}

/*
================================
Auth
================================
*/
async function getAccessToken() {
  const { data } = await window.supabase.auth.getSession();

  if (!data?.session) {
    window.location.href = "/unauthorized";
    return null;
  }

  return data.session.access_token;
}

/*
================================
Load Character
================================
*/
async function loadCharacter() {
  const token = await getAccessToken();
  if (!token) return;

  const characterId = getCharacterIdFromPath();

  if (!characterId) {
    document.getElementById("character-loading").textContent =
      "Invalid character ID.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/characters/${characterId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to fetch character");

    const char = await res.json();

    document.getElementById("character-loading").classList.add("hidden");
    document.getElementById("character-sheet").classList.remove("hidden");

    renderCharacter(char);

  } catch (err) {
    console.error("Character load error:", err);
    document.getElementById("character-loading").textContent =
      "Failed to load character.";
  }
}

/*
================================
Render Character
================================
*/
function renderCharacter(char) {
  document.getElementById("char-name").textContent = char.name;

  document.getElementById("char-meta").textContent =
    `Level ${char.level}`;

  // Ancestry, Class, Community
  const classPart = char.class_name
    ? `${char.class_name}${char.subclass_name ? ` (${char.subclass_name})` : ""}`
    : "Unknown Class";

  const ancestryPart = char.ancestry_name || "Unknown Ancestry";
  const communityPart = char.community_name || null;

  document.getElementById("char-lineage").textContent =
    communityPart
      ? `${classPart} • ${ancestryPart} • ${communityPart}`
      : `${classPart} • ${ancestryPart}`;

  const portraitHTML = char.portrait_url
    ? `<img src="${char.portrait_url}" class="w-full h-full object-cover">`
    : `<span class="text-xl font-bold text-zinc-500">
         ${char.name?.charAt(0).toUpperCase() || "?"}
       </span>`;

  document.getElementById("char-portrait").innerHTML = portraitHTML;

  // Character Stats
  document.getElementById("char-stats").innerHTML = `

    <!-- TRAITS -->
    <div class="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-800 shadow">

      <h2 class="text-sm font-semibold text-zinc-500 mb-3 tracking-widest">
        TRAITS
      </h2>

      <div class="grid grid-cols-6 gap-3 text-center">

        ${statBox("Agility", char.agility)}
        ${statBox("Strength", char.strength)}
        ${statBox("Finesse", char.finesse)}
        ${statBox("Presence", char.presence)}
        ${statBox("Instinct", char.instinct)}
        ${statBox("Knowledge", char.knowledge)}

      </div>

      <!-- DIVIDER -->
      <div class="my-4 border-t border-zinc-200 dark:border-zinc-700"></div>

      <!-- EXPERIENCES -->
      <div>
        <div class="text-xs text-zinc-500 tracking-widest mb-2">
          EXPERIENCES
        </div>

        ${renderExperiences(char.experiences)}

      </div>

    </div>

    <!-- STATUS + DEFENSE -->
    <div class="grid grid-cols-2 gap-4 mt-6">

      ${statusPanel(char)}

      ${defensePanel(char)}

    </div>

  `;

  //Debug
  console.log("CHAR DATA:", char);
}

function statBox(label, value) {
  return `
    <div class="border rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center gap-0.5 h-20">
      <div class="text-sm text-zinc-500">${label}</div>
      <div class="text-2xl font-bold">
        ${value ?? "—"}
      </div>
    </div>
  `;
}

function counterRow(label, value, max, key, type) {
  return `
    <div class="flex items-center justify-between gap-4">

      <div class="text-sm text-zinc-500 w-20">
        ${label.toUpperCase()}
      </div>

      <div class="flex gap-0.5 flex-wrap items-center">

        ${Array.from({ length: max }, (_, i) => {
          const filled = i < (value ?? 0);

          return `
            <button
              onclick="updateCounter('${key}', ${i + 1})"
              class="transition hover:scale-105"
            >
              ${renderPip(type, filled)}
            </button>
          `;
        }).join("")}

      </div>

    </div>
  `;
}

function renderPip(type, filled) {

  const base = "w-4 h-4 rounded-md border transition";

  const styles = {
    health: filled
      ? "bg-red-500 border-red-600"
      : "bg-transparent border-zinc-400",

    hope: filled
      ? "bg-green-500 border-green-600"
      : "bg-transparent border-zinc-400",

    stress: filled
      ? "bg-purple-500 border-purple-600"
      : "bg-transparent border-zinc-400",

    armor: filled
      ? "bg-blue-400 border-blue-500"
      : "bg-transparent border-zinc-400",
  };

  return `<div class="${base} ${styles[type] || ""}"></div>`;
}

function updateCounter(type, newValue) {
  console.log("Update", type, newValue);

  // For now: just reload UI with new value (temporary hack)
  // We'll replace this with real state + API call next step
}

function combatSummary(char) {
  return `
    <div class="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-800 shadow">

      <div class="grid grid-cols-3 gap-4 items-center text-center">

        <!-- EVASION -->
        <div>
          <div class="text-xs text-zinc-500 tracking-widest mb-1">
            EVASION
          </div>
          <div class="text-3xl font-bold">
            ${char.evasion ?? "—"}
          </div>
        </div>

        <!-- HP (placeholder for now) -->
        <div>
          <div class="text-xs text-zinc-500 tracking-widest mb-1">
            HP
          </div>
          <div class="text-3xl font-bold">
            ${char.current_hit_points ?? "—"}
          </div>
        </div>

        <!-- THRESHOLDS -->
        <div>
          <div class="text-xs text-zinc-500 tracking-widest mb-1">
            THRESHOLDS
          </div>
          <div class="text-sm">
            <span class="font-semibold">Major:</span> ${char.major_threshold ?? "—"}
          </div>
          <div class="text-sm">
            <span class="font-semibold">Severe:</span> ${char.severe_threshold ?? "—"}
          </div>
        </div>

      </div>

    </div>
  `;
}

function statusPanel(char) {
  return `
    <div class="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-800 shadow space-y-4">

      <h2 class="text-sm font-semibold text-zinc-500 tracking-widest">
        STATUS
      </h2>

      ${counterRow("Health", char.current_hit_points, 10, "health", "health")}
      ${counterRow("Hope", char.hope, 6, "hope", "hope")}
      ${counterRow("Stress", char.stress || 3, 6, "stress", "stress")}
      ${counterRow("Armor", char.armor_slots || 2, 5, "armor", "armor")}

    </div>
  `;
}

function defensePanel(char) {
  return `
    <div class="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-800 shadow space-y-4">

      <h2 class="text-sm font-semibold text-zinc-500 tracking-widest">
        DEFENSE
      </h2>

      <!-- EVASION -->
      <div class="text-center">
        <div class="text-xs text-zinc-500 tracking-widest mb-1">
          EVASION
        </div>
        <div class="text-3xl font-bold">
          ${char.evasion ?? "—"}
        </div>
      </div>

      ${thresholdPanel(char)}

      ${resistancePanel(char)}

    </div>
  `;
}

function thresholdPanel(char) {
  return `
    <div class="border rounded-md p-3 bg-zinc-50 dark:bg-zinc-900">

      <div class="text-xs text-zinc-500 tracking-widest mb-2 text-center">
        DAMAGE THRESHOLDS
      </div>

      <div class="grid grid-cols-3 text-center gap-2">

        <div>
          <div class="text-xs text-zinc-500">Minor</div>
          <div class="font-semibold">${char.level ?? "—"}</div>
          <div class="text-[10px] text-zinc-400">Mark 1 HP</div>
        </div>

        <div>
          <div class="text-xs text-zinc-500">Major</div>
          <div class="font-semibold">${char.major_threshold ?? "—"}</div>
          <div class="text-[10px] text-zinc-400">Mark 2 HP</div>
        </div>

        <div>
          <div class="text-xs text-zinc-500">Severe</div>
          <div class="font-semibold">${char.severe_threshold ?? "—"}</div>
          <div class="text-[10px] text-zinc-400">Mark 3 HP</div>
        </div>

      </div>

    </div>
  `;
}

function resistancePanel(char) {
  return `
    <div>

      <div class="text-xs text-zinc-500 tracking-widest mb-1">
        RESISTANCES
      </div>

      <div class="text-sm text-zinc-400 italic">
        None
      </div>

    </div>
  `;
}

function renderExperiences(experiences) {
  if (!experiences || experiences.length === 0) {
    return `
      <div class="text-sm text-zinc-400 italic">
        None
      </div>
    `;
  }

  return `
    <div class="text-sm flex flex-wrap gap-x-3 gap-y-1">

      ${experiences.map((exp, i) => `
        <span class="whitespace-nowrap">
          ${exp} <span class="font-semibold text-zinc-700 dark:text-zinc-300">+2</span>
          ${i < experiences.length - 1 ? '<span class="text-zinc-400 ml-2">•</span>' : ''}
        </span>
      `).join("")}

    </div>
  `;
}

/*
================================
Init
================================
*/
loadCharacter();
