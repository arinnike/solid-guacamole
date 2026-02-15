async function applyDarkMode() {
  const { data: { user } } = await window.supabase.auth.getUser();

  if (!user) {
    document.documentElement.style.visibility = "visible";
    return;
  }

  const { data, error } = await window.supabase
    .from("user_settings")
    .select("dark_mode")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Dark mode fetch failed:", error);
    document.documentElement.style.visibility = "visible";
    return;
  }

  document.documentElement.classList.toggle("dark", data.dark_mode);

  // Reveal page AFTER theme applied
  document.documentElement.style.visibility = "visible";
}

document.addEventListener("user-ready", applyDarkMode);
applyDarkMode();