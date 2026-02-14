console.log("SETTINGS.JS FILE EXECUTED");

const supabase = window.supabase;

document.addEventListener("DOMContentLoaded", async () => {

  console.log("settings.js loaded");

  const displayNameInput = document.getElementById("display-name");
  const darkModeCheckbox = document.getElementById("dark-mode");
  const saveBtn = document.getElementById("save-settings");
  const status = document.getElementById("status");

  console.log("saveBtn:", saveBtn);

  if (!saveBtn) return;

  // ==================
  // SAVE HANDLER FIRST
  // ==================
  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("save clicked");

    status.textContent = "Saving…";

    const displayName = displayNameInput.value;
    const darkMode = darkModeCheckbox.checked;

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      status.textContent = "Not logged in.";
      console.error(sessionError);
      return;
    }

    const userId = sessionData.session.user.id;

    console.log("payload:", {
      user_id: userId,
      display_name: displayName,
      dark_mode: darkMode,
    });

    const result = await supabase
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

    document.documentElement.classList.toggle("dark", darkMode);
  });

  // ============
  // LOAD SETTINGS
  // ============
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

});