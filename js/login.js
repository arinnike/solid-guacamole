const supabase = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_KEY
);

document.getElementById("discordLogin").addEventListener("click", async () => {
  await supabase.auth.signInWithOAuth({
    provider: "discord",
  });
});