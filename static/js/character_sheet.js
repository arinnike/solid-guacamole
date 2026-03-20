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
    <div class="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-800 shadow space-y-4">

      <h2 class="text-sm font-semibold text-zinc-500 tracking-widest">
        COMBAT
      </h2>

      ${counterRow("Health", char.current_hit_points, 20, "health")}
      ${counterRow("Hope", char.hope, 6, "hope")}
      ${counterRow("Stress", char.stress ?? 0, 6, "stress")}
      ${counterRow("Armor", char.armor ?? 0, 5, "armor")}

    </div>

    <!-- TRAITS -->
    <div class="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-800 shadow mt-4">

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

function counterRow(label, value, max, key) {
  return `
    <div>
      <div class="text-sm text-zinc-500 mb-1">${label}</div>

      <div class="flex flex-wrap gap-1">
        ${Array.from({ length: max }, (_, i) => {
          const filled = i < (value ?? 0);

          return `
            <button
              class="w-5 h-5 rounded-full border
                ${filled
                  ? "bg-zinc-800 dark:bg-zinc-200"
                  : "bg-transparent"}
              "
              onclick="updateCounter('${key}', ${i + 1})"
            ></button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function updateCounter(type, newValue) {
  console.log("Update", type, newValue);

  // For now: just reload UI with new value (temporary hack)
  // We'll replace this with real state + API call next step
}

/*
================================
Init
================================
*/
loadCharacter();
