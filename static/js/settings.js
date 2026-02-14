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

  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    console.log("SESSION:", sessionData, sessionError);

    if (!sessionData?.session) {
      status.textContent = "No session";
      return;
    }

    const userId = sessionData.session.user.id;
    const displayName = displayNameInput.value;
    const darkMode = darkModeCheckbox.checked;

    console.log("UPSERT PAYLOAD:", {
      user_id: userId,
      display_name: displayName,
      dark_mode: darkMode,
    });

    const result = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        display_name: displayName,
        dark_mode: darkMode,
      })
      .select();

    console.log("UPSERT RESULT:", result);

    if (result.error) {
      status.textContent = result.error.message;
      console.error(result.error);
      return;
    }

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    status.textContent = "Saved!";
  } catch (err) {
    console.error("SETTINGS SAVE CRASH:", err);
    status.textContent = "Crash — see console";
  }
});