var sb = window.supabase;

// Elements
const loggedOut = document.getElementById("logged-out");
const loggedIn = document.getElementById("logged-in");
const signinToggle = document.getElementById("signin-toggle");
const signinMenu = document.getElementById("signin-menu");

// Global user cache
window.currentUserId = null;

/*
============================
Utility: Update Role-Based Nav
============================
*/
async function updateNavForUser(userId) {
  const { data, error } = await sb
    .from("user_settings")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return;

  if (data.role >= 3) {
    document.getElementById("nav-characters")
      ?.classList.remove("hidden");
  }
}

/*
============================
Dropdown Toggle
============================
*/
signinToggle?.addEventListener("click", () => {
  signinMenu?.classList.toggle("hidden");
});

/*
============================
Email Login
============================
*/
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
  } else {
    signinMenu?.classList.add("hidden");
  }
});

/*
============================
Discord Login
============================
*/
document.getElementById("discord-login")?.addEventListener("click", async () => {
  await sb.auth.signInWithOAuth({
    provider: "discord",
    options: { redirectTo: "https://dhgmtools.com" },
  });
});

/*
============================
Logout
============================
*/
document.addEventListener("click", async (e) => {
  const logoutBtn = e.target.closest("#logout");
  if (!logoutBtn) return;

  await sb.auth.signOut();
  await fetch("/logout");

  // Clear Supabase local storage
  Object.keys(localStorage)
    .filter(k => k.includes("sb-"))
    .forEach(k => localStorage.removeItem(k));

  sessionStorage.clear();

  window.currentUserId = null;

  loggedIn?.classList.add("hidden");
  loggedOut?.classList.remove("hidden");

  // Hide role-based nav
  document.getElementById("nav-characters")
    ?.classList.add("hidden");

  window.location.href = "/";
});

/*
============================
Forgot Password
============================
*/
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

/*
============================
Auth State Watcher (Single)
============================
*/
sb.auth.onAuthStateChange(async (_event, session) => {
  if (session) {
    window.currentUserId = session.user.id;

    loggedOut?.classList.add("hidden");
    loggedIn?.classList.remove("hidden");

    // Sync Supabase → Flask
    await fetch("/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session)
    });

    // Role-based nav
    await updateNavForUser(session.user.id);

    document.dispatchEvent(new Event("user-ready"));

  } else {
    window.currentUserId = null;

    loggedIn?.classList.add("hidden");
    loggedOut?.classList.remove("hidden");

    document.getElementById("nav-characters")
      ?.classList.add("hidden");
  }
});

/*
============================
Initial Hydration
============================
*/
(async () => {
  const { data } = await sb.auth.getUser();

  if (data.user) {
    window.currentUserId = data.user.id;

    loggedOut?.classList.add("hidden");
    loggedIn?.classList.remove("hidden");

    await updateNavForUser(data.user.id);
  } else {
    loggedIn?.classList.add("hidden");
    loggedOut?.classList.remove("hidden");
  }
})();