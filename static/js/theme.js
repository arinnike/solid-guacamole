const sb = window.supabase;

async function applyDarkMode() {
  const { data: { user } } = await sb.auth.getUser();

  if (!user) return;

  const { data, error } = await sb
    .from("user_settings")
    .select("dark_mode")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Dark mode fetch failed:", error);
    return;
  }

  document.body.classList.toggle("dark", data.dark_mode);
}

document.addEventListener("user-ready", applyDarkMode);
applyDarkMode();