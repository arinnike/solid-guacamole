document.addEventListener("DOMContentLoaded", () => {

  const supabaseClient = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_KEY
  );

  const discordBtn = document.getElementById("discordLogin");

  if (discordBtn) {
    discordBtn.addEventListener("click", async () => {
      await supabaseClient.auth.signInWithOAuth({
        provider: "discord",
      });
    });
  }

  console.log("login.js loaded");
});