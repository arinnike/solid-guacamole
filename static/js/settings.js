const sb = window.supabase;

const displayNameInput = document.getElementById("display-name");
const darkModeCheckbox = document.getElementById("dark-mode");
const saveBtn = document.getElementById("save-settings");
const status = document.getElementById("status");

if (saveBtn) {

  let currentUserId = null;

  // Load user + settings
  (async () => {

    const { data: userResult } = await sb.auth.getUser();

    if (!userResult.user) {
      window.location.href = "/";
      return;
    }

    currentUserId = userResult.user.id;

    const { data: settings } = await sb
      .from("user_settings")
      .select("display_name, dark_mode")
      .eq("user_id", currentUserId)
      .single();

    if (settings) {
  displayNameInput.value = settings.display_name || "";
  darkModeCheckbox.checked = !!settings.dark_mode;

  document.body.classList.toggle("dark", settings.dark_mode);
}

  })();

  // Save handler
  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!currentUserId) {
      status.textContent = "Not logged in.";
      return;
    }

    status.textContent = "Saving…";

    const displayName = displayNameInput.value;
    const darkMode = darkModeCheckbox.checked;

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

    if (result.error) {
      status.textContent = result.error.message;
      return;
    }

    status.textContent = "Saved!";
    document.body.classList.toggle("dark", darkMode);
  });
}