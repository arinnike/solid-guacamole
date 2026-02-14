const sb = window.supabase;

console.log("login.js loaded");

// Elements
const loggedOut = document.getElementById("logged-out");
const loggedIn = document.getElementById("logged-in");
const signinToggle = document.getElementById("signin-toggle");
const signinMenu = document.getElementById("signin-menu");

// Global user cache (used by settings.js)
window.currentUserId = null;

// --------------------
// Dropdown toggle
// --------------------
signinToggle?.addEventListener("click", () => {
  signinMenu?.classList.toggle("hidden");
});

// --------------------
// Email login
// --------------------
document.getElementById("email-login")?.addEventListener("click", async () => {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  const { error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    alert(error.message);
    return;
  }

  signinMenu?.classList.add("hidden");
});

// --------------------
// Discord login
// --------------------
document.getElementById("discord-login")?.addEventListener("click", async () => {
  await sb.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: "https://dhgmtools.com",
    },
  });
});

// --------------------
// Logout
// --------------------
document.addEventListener("click", async (e) => {
  const logoutBtn = e.target.closest("#logout");
  if (!logoutBtn) return;

  console.log("logout clicked");

  await sb.auth.signOut();

  window.currentUserId = null;

  loggedIn?.classList.add("hidden");
  loggedOut?.classList.remove("hidden");

  window.location.reload();
});

// --------------------
// Forgot password
// --------------------
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("#forgot-password");
  if (!btn) return;

  e.preventDefault();

  const email = document.getElementById("email")?.value;

  if (!email) {
    alert("Please enter your email first.");
    return;
  }

  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: "https://dhgmtools.com/reset-password",
  });

  if (error) alert(error.message);
  else alert("Password reset email sent!");
});

// --------------------
// Auth watcher (single source of truth)
// --------------------
sb.auth.onAuthStateChange(async (_event, session) => {

  if (session) {
    console.log("AUTH STATE: logged in");

    window.currentUserId = session.user.id;

    loggedOut?.classList.add("hidden");
    loggedIn?.classList.remove("hidden");

    const { data } = await sb
      .from("user_settings")
      .select("dark_mode")
      .eq("user_id", window.currentUserId)
      .single();

    if (!data) {
      await sb.from("user_settings").insert({
        user_id: window.currentUserId,
        dark_mode: false,
      });
    }

    if (data?.dark_mode) {
      document.documentElement.classList.add("dark");
    }

  } else {
    console.log("AUTH STATE: logged out");

    window.currentUserId = null;

    loggedIn?.classList.add("hidden");
    loggedOut?.classList.remove("hidden");
  }
});

// --------------------
// Initial hydration
// --------------------
(async () => {
  const { data } = await sb.auth.getUser();

  if (data.user) {
    window.currentUserId = data.user.id;
    loggedOut?.classList.add("hidden");
    loggedIn?.classList.remove("hidden");
  } else {
    loggedIn?.classList.add("hidden");
    loggedOut?.classList.remove("hidden");
  }
})();