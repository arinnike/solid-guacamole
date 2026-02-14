import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

window.supabase ??= createClient(
  window.SUPABASE_URL,
  window.SUPABASE_KEY
);

const supabase = window.supabase;

console.log("login.js loaded");

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
      redirectTo: "https://dhgmtools.com"
    }
  });
});

// Logout
document.addEventListener("click", async (e) => {
  const logoutBtn = e.target.closest("#logout");
  if (!logoutBtn) return;

  console.log("logout clicked");

  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn("Supabase signOut failed (Firefox IndexedDB)", e);
  }

  // Force clear browser auth state
  Object.keys(localStorage)
    .filter(k => k.includes("sb-"))
    .forEach(k => localStorage.removeItem(k));

  sessionStorage.clear();

  // Force UI
  loggedIn.classList.add("hidden");
  loggedOut.classList.remove("hidden");

  // Hard reload to prevent rehydration
  window.location.href = "/";
});

// Forgot password (delegated)
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("#forgot-password");
  if (!btn) return;

  e.preventDefault();
  console.log("forgot password clicked");

  const email = document.getElementById("email")?.value;
  if (!email) {
    alert("Please enter your email first.");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://dhgmtools.com/reset-password",
  });

  if (error) alert(error.message);
  else alert("Password reset email sent! Check your inbox.");
});

// Auth watcher
supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session) {
    loggedOut.classList.add("hidden");
    loggedIn.classList.remove("hidden");

    const userId = session.user.id;

    const { data } = await supabase
      .from("user_settings")
      .select("dark_mode")
      .eq("user_id", userId)
      .single();

    if (!data) {
      await supabase.from("user_settings").insert({
        user_id: userId,
        dark_mode: false
      });
    }

    if (data?.dark_mode) {
      document.documentElement.classList.add("dark");
    }

  } else {
    loggedIn.classList.add("hidden");
    loggedOut.classList.remove("hidden");
  }
});

// Run session check WITHOUT blocking module
(async () => {
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    loggedOut.classList.add("hidden");
    loggedIn.classList.remove("hidden");
  } else {
    loggedIn.classList.add("hidden");
    loggedOut.classList.remove("hidden");
  }
})();