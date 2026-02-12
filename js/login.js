/**document.addEventListener("DOMContentLoaded", () => {

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
});**/

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Elements
const loggedOut = document.getElementById("logged-out");
const loggedIn = document.getElementById("logged-in");
const signinToggle = document.getElementById("signin-toggle");
const signinMenu = document.getElementById("signin-menu");

// Toggle dropdown
signinToggle?.addEventListener("click", () => {
  signinMenu.classList.toggle("hidden");
});

// Email login
document.getElementById("email-login")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) alert(error.message);
});

// Discord login
document.getElementById("discord-login")?.addEventListener("click", async () => {
  await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: "https://yourdomain.com"
    }
  });
});

// Logout
document.getElementById("logout")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
});

// Auth state watcher
supabase.auth.onAuthStateChange((_event, session) => {
  if (session) {
    loggedOut.classList.add("hidden");
    loggedIn.classList.remove("hidden");
  } else {
    loggedIn.classList.add("hidden");
    loggedOut.classList.remove("hidden");
  }
});

// Initial load
const {
  data: { session },
} = await supabase.auth.getSession();

if (session) {
  loggedIn.classList.remove("hidden");
} else {
  loggedOut.classList.remove("hidden");
}