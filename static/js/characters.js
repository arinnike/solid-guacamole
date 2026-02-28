const API_BASE = window.API_BASE || "https://dhgmtools-api-production.up.railway.app";

async function getAccessToken() {
  const { data } = await window.supabase.auth.getSession();

  if (!data?.session) {
    window.location.href = "/unauthorized";
    return null;
  }

  return data.session.access_token;
}

async function loadCharacters() {
  const token = await getAccessToken();
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/characters`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch characters");
    }

    const characters = await response.json();

    document.getElementById("characters-loading").classList.add("hidden");

    if (!characters.length) {
      document.getElementById("characters-empty").classList.remove("hidden");
      return;
    }

    renderCharacters(characters);

  } catch (err) {
    console.error("Character load failed:", err);
    document.getElementById("characters-loading").textContent =
      "Failed to load characters.";
  }
}

function renderCharacters(characters) {
  const grid = document.getElementById("characters-grid");
  grid.classList.remove("hidden");

  grid.innerHTML = characters.map(c => `
    <div class="border rounded-lg p-4 bg-white dark:bg-zinc-800 flex flex-col">

      <div class="flex items-center gap-4 mb-4">

        <div class="w-16 h-16 rounded overflow-hidden border bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
          ${
            c.portrait_url
              ? `<img src="${c.portrait_url}"
                     class="w-full h-full object-cover">`
              : `<span class="text-xl font-bold text-zinc-500">
                   ${c.name?.charAt(0).toUpperCase() || "?"}
                 </span>`
          }
        </div>

        <div>
          <h3 class="font-semibold text-lg">${c.name}</h3>
          <p class="text-sm text-zinc-500">
            Level ${c.level}
          </p>
          ${
            c.ancestry || c.community
              ? `<p class="text-xs text-zinc-400">
                   ${c.ancestry || ""} ${c.community ? "• " + c.community : ""}
                 </p>`
              : ""
          }
        </div>

      </div>

      <div class="mt-auto">
        <button
          class="w-full border rounded py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700"
          onclick="viewCharacter('${c.id}')">
          View
        </button>
      </div>

    </div>
  `).join("");
}

function viewCharacter(id) {
  window.location.href = `/characters/${id}`;
}

loadCharacters();