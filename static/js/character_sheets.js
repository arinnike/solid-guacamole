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
    <div class="border rounded p-4">
      <p>HP: ${char.current_hit_points ?? "—"}</p>
      <p>Class: ${char.class_id ?? "—"}</p>
    </div>
  `;
}

loadCharacter();