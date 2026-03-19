const API_BASE = window.API_BASE || "https://dhgmtools-api-production.up.railway.app";

async function getAccessToken() {
  const { data } = await window.supabase.auth.getSession();

  if (!data?.session) {
    window.location.href = "/unauthorized";
    return null;
  }

  return data.session.access_token;
}

async function loadCharacter() {
  const token = await getAccessToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/characters/${CHARACTER_ID}`, {
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
    console.error(err);
    document.getElementById("character-loading").textContent =
      "Failed to load character.";
  }
}

function renderCharacter(char) {
  document.getElementById("char-name").textContent = char.name;

  document.getElementById("char-meta").textContent =
    `Level ${char.level}`;

  document.getElementById("char-stats").innerHTML = `
    <div class="grid grid-cols-2 gap-2 border rounded p-4">

      <p><strong>HP:</strong> ${char.current_hit_points}</p>
      <p><strong>Hope:</strong> ${char.hope}</p>

      <p>Agility: ${char.agility}</p>
      <p>Strength: ${char.strength}</p>
      <p>Presence: ${char.presence}</p>
      <p>Instinct: ${char.instinct}</p>
      <p>Knowledge: ${char.knowledge}</p>
      <p>Finesse: ${char.finesse}</p>

    </div>
  `;
}

const portrait = char.portrait_url
  ? `<img src="${char.portrait_url}" class="w-24 h-24 rounded object-cover">`
  : `<div class="w-24 h-24 bg-zinc-300 flex items-center justify-center text-xl">
       ${char.name.charAt(0)}
     </div>`;

loadCharacter();