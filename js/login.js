const supabaseClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_KEY
);

document.getElementById("discordLogin").addEventListener("click", async () => {
  await supabaseClient.auth.signInWithOAuth({
    provider: "discord",
  });
});

console.log("login.js loaded");