console.log("settings.js loaded");

const sb = window.supabase;

const displayNameInput = document.getElementById("display-name");
const darkModeCheckbox = document.getElementById("dark-mode");
const saveBtn = document.getElementById("save-settings");
const status = document.getElementById("status");

if (!saveBtn) {
  console.error("Save button not found");
} else {

  let currentUserId = null;

  // ==========================
  // LOAD USER + SETTINGS
  // ==========================
  (async () => {

    const { data: userResult, error: userError } = await sb.auth.getUser();

    if (userError || !userResult.user) {
      window.location.href = "/";
      return;
    }

    currentUserId = userResult.user.id;
    console.log("CURRENT USER ID:", currentUserId);

    const { data: settings } = await sb
      .from("user_settings")
      .select("display_name, dark_mode")
      .eq("user_id", currentUserId)
      .single();

    if (settings) {
      displayNameInput.value = settings.display_name || "";
      darkModeCheckbox.checked = !!settings.dark_mode;
    }

  })();

  // ==========================
  // SAVE HANDLER
  // ==========================
  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    console.log("SAVE BUTTON PRESSED");

    if (!currentUserId) {
      status.textContent = "Not logged in.";
      return;
    }

    status.textContent = "Saving…";

    const displayName = displayNameInput.value;
    const darkMode = darkModeCheckbox.checked;

    console.log("ABOUT TO UPSERT", {
      user_id: currentUserId,
      display_name: displayName,
      dark_mode: darkMode
    });

    const result = await sb
      .from("user_settings")
      .upsert(
        {
          user_id: currentUserId,
          display_name: displayName,
          dark_mode: darkMode,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    console.log("UPSERT RESULT:", result);

    if (result.error) {
      status.textContent = result.error.message;
      console.error(result.error);
      return;
    }

    status.textContent = "Saved!";
    document.documentElement.classList.toggle("dark", darkMode);
  });
}