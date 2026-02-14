console.log("settings.js loaded");

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

window.supabase ??= createClient(
  window.SUPABASE_URL,
  window.SUPABASE_KEY
);

const supabase = window.supabase;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM ready");
    
  const displayNameInput = document.getElementById("display-name");
  const darkModeCheckbox = document.getElementById("dark-mode");
  const saveBtn = document.getElementById("save-settings");
  const status = document.getElementById("status");
console.log("saveBtn:", saveBtn);
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = "/";
    return;
  }

  const userId = data.session.user.id;

  // Load settings
  const { data: settings } = await supabase
    .from("user_settings")
    .select("display_name, dark_mode")
    .eq("user_id", userId)
    .single();

  if (settings) {
    displayNameInput.value = settings.display_name || "";
    darkModeCheckbox.checked = !!settings.dark_mode;
  }

  // Save settings
  saveBtn.addEventListener("click", async () => {

    status.textContent = "Saving…";

    const displayName = displayNameInput.value;
    const darkMode = darkModeCheckbox.checked;

    const { error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        display_name: displayName,
        dark_mode: darkMode,
      });

    if (error) {
      status.textContent = error.message;
      return;
    }

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    status.textContent = "Saved!";
  });

});