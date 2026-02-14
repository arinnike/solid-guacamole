import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

document.addEventListener("DOMContentLoaded", async () => {

  const supabase = createClient(
    window.SUPABASE_URL,
    window.SUPABASE_KEY
  );

  const loggedOut = document.getElementById("logged-out");
  const loggedIn = document.getElementById("logged-in");
  const signinToggle = document.getElementById("signin-toggle");
  const signinMenu = document.getElementById("signin-menu");

  signinToggle?.addEventListener("click", () => {
    signinMenu.classList.toggle("hidden");
  });

  document.getElementById("email-login")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
  });

  document.getElementById("discord-login")?.addEventListener("click", async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: "https://dhgmtools.com"
      }
    });
  });

  document.getElementById("logout")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      loggedOut.classList.add("hidden");
      loggedIn.classList.remove("hidden");
    } else {
      loggedIn.classList.add("hidden");
      loggedOut.classList.remove("hidden");
    }
  });

  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    loggedIn.classList.remove("hidden");
  } else {
    loggedOut.classList.remove("hidden");
  }

//Debugging
console.log("login.js loaded");

document.getElementById("forgot-password")?.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("forgot password clicked");
});

});