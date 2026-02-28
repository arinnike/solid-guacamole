const API_BASE = "https://dhgmtools-api-production.up.railway.app";

const loadingState = document.getElementById("loading-state");
const emptyState = document.getElementById("empty-state");
const characterGrid = document.getElementById("character-grid");

async function fetchCharacters() {
  try {
    const { data } = await window.supabase.auth.getSession();
    const token = data?.session?.access_token;

    if (!token) {
      loadingState.textContent = "You must be logged in.";
      return;
    }

    const response = await fetch(`${API_BASE}/characters`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch characters");
    }

    const characters = await response.json();

    renderCharacters(characters);

  } catch (err) {
    console.error(err);
    loadingState.textContent = "Failed to load characters.";
  }
}

function renderCharacters(characters) {
  loadingState.classList.add("hidden");

  if (!characters || characters.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  characterGrid.classList.remove("hidden");

  characterGrid.innerHTML = characters.map(c => `
    <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 space-y-3">

      <div class="h-40 bg-zinc-200 dark:bg-zinc-700 rounded overflow-hidden">
        ${c.portrait_url
          ? `<img src="${c.portrait_url}" class="w-full h-full object-cover">`
          : `<div class="flex items-center justify-center h-full text-zinc-500">
               No Portrait
             </div>`}
      </div>

      <div>
        <h2 class="text-lg font-semibold">${c.name}</h2>
        <p class="text-sm text-zinc-500">
          Level ${c.level} • ${c.ancestry || "Unknown"} ${c.community || ""}
        </p>
      </div>

      <button
        class="w-full border rounded py-1 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        onclick="viewCharacter('${c.id}')">
        View
      </button>

    </div>
  `).join("");
}

function viewCharacter(id) {
  window.location.href = `/characters/${id}`;
}

document.addEventListener("DOMContentLoaded", fetchCharacters);