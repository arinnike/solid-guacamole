console.log("settings.js loaded");

const sb = window.supabase;

document.addEventListener("DOMContentLoaded", async () => {

  const displayNameInput = document.getElementById("display-name");
  const darkModeCheckbox = document.getElementById("dark-mode");
  const saveBtn = document.getElementById("save-settings");
  const status = document.getElementById("status");

  if (!saveBtn) {
    console.error("Save button not found");
    return;
  }

  // ==========================
  // SAVE HANDLER (attach FIRST)
  // ==========================
  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    
    console.log("save clicked");
    console.log("sb exists:", !!sb);
    console.log("sb.auth exists:", !!sb?.auth);
    console.log("ABOUT TO CALL getUser");

    const userResult = await sb.auth.getUser();

    console.log("GET USER RESULT:", userResult);

    const userData = userResult.data;
    const userError = userResult.error;

    status.textContent = "Saving…";

    const displayName = displayNameInput.value;
    const darkMode = darkModeCheckbox.checked;

    // Get current user
    const { data: userData, error: userError } = await sb.auth.getUser();

    if (userError || !userData.user) {
      status.textContent = "Not logged in.";
      console.error(userError);
      return;
    }

    const userId = userData.user.id;

    console.log("payload:", {
      user_id: userId,
      display_name: displayName,
      dark_mode: darkMode,
    });

    const result = await sb
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
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

    // Apply dark mode immediately
    document.documentElement.classList.toggle("dark", darkMode);
  });

  // ==========================
  // LOAD SETTINGS
  // ==========================
  const { data: userData } = await sb.auth.getUser();

  if (!userData.user) {
    window.location.href = "/";
    return;
  }

  const userId = userData.user.id;

  const { data: settings } = await sb
    .from("user_settings")
    .select("display_name, dark_mode")
    .eq("user_id", userId)
    .single();

  if (settings) {
    displayNameInput.value = settings.display_name || "";
    darkModeCheckbox.checked = !!settings.dark_mode;
  }

});