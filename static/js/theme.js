async function applyDarkMode() {
  const { data: { user } } = await window.supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await window.supabase
    .from("user_settings")
    .select("dark_mode")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Dark mode fetch failed:", error);
    return;
  }

  document.documentElement.classList.toggle("dark", data.dark_mode);
  localStorage.setItem("dark_mode", data.dark_mode ? "true" : "false");
}

document.addEventListener("user-ready", applyDarkMode);
applyDarkMode();