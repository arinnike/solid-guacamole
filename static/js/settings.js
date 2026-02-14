console.log("settings.js loaded");

console.log("saveBtn:", document.getElementById("save-settings"));

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

window.supabase ??= createClient(
  window.SUPABASE_URL,
  window.SUPABASE_KEY
);

const supabase = window.supabase;

const displayNameInput = document.getElementById("display-name");
const darkModeCheckbox = document.getElementById("dark-mode");
const saveBtn = document.getElementById("save-settings");
const status = document.getElementById("status");

// Ensure logged in + load settings
(async () => {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.href = "/";
    return;
  }

  const userId = data.session.user.id;

  const { data: settings } = await supabase
    .from("user_settings")
    .select("display_name, dark_mode")
    .eq("user_id", userId)
    .single();

  if (settings) {
    displayNameInput.value = settings.display_name || "";
    darkModeCheckbox.checked = !!settings.dark_mode;
  }
})();

// Save settings
saveBtn.addEventListener("click", async () => {
  status.textContent = "Saving…";

  const { data: sessionData } = await supabase.auth.getSession();

  console.log("session:", sessionData);

  const userId = sessionData.session.user.id;

  const displayName = displayNameInput.value;
  const darkMode = darkModeCheckbox.checked;

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: userId,
      display_name: displayName,
      dark_mode: darkMode,
    })
    .select();

  console.log("upsert result:", data);
  console.log("upsert error:", error);

  if (error) {
    status.textContent = error.message;
    return;
  }

  status.textContent = "Saved!";
});