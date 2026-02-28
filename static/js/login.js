var sb = window.supabase;

// Elements
const loggedOut = document.getElementById("logged-out");
const loggedIn = document.getElementById("logged-in");
const signinToggle = document.getElementById("signin-toggle");
const signinMenu = document.getElementById("signin-menu");
const navCharacters = document.getElementById("nav-characters");

// Global user cache
window.currentUserId = null;

/*
====================================
Role Handling (with localStorage cache)
====================================
*/

async function fetchAndCacheUserRole(userId) {
  const { data, error } = await sb
    .from("user_settings")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  localStorage.setItem("user_role", data.role);
  return data.role;
}

function applyRoleToNav(role) {
  if (!navCharacters) return;

  if (role >= 3) {
    navCharacters.classList.remove("hidden");
  } else {
    navCharacters.classList.add("hidden");
  }
}

async function updateNavForUser(userId) {
  let role = localStorage.getItem("user_role");

  if (role === null) {
    role = await fetchAndCacheUserRole(userId);
  }

  if (role !== null) {
    applyRoleToNav(parseInt(role));
  }
}

/*
====================================
Dropdown Toggle
====================================
*/
signinToggle?.addEventListener("click", () => {
  signinMenu?.classList.toggle("hidden");
});

/*
====================================
Email Login
====================================
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
====================================
Discord Login
====================================
*/
document.getElementById("discord-login")?.addEventListener("click", async () => {
  await sb.auth.signInWithOAuth({
    provider: "discord",
    options: { redirectTo: "https://dhgmtools.com" },
  });
});

/*
====================================
Logout
====================================
*/
document.addEventListener("click", async (e) => {
  const logoutBtn = e.target.closest("#logout");
  if (!logoutBtn) return;

  await sb.auth.signOut();
  await fetch("/logout");

  // Clear Supabase storage
  Object.keys(localStorage)
    .filter(k => k.includes("sb-"))
    .forEach(k => localStorage.removeItem(k));

  // Clear role cache
  localStorage.removeItem("user_role");

  sessionStorage.clear();

  window.currentUserId = null;

  loggedIn?.classList.add("hidden");
  loggedOut?.classList.remove("hidden");

  navCharacters?.classList.add("hidden");

  window.location.href = "/";
});

/*
====================================
Forgot Password
====================================
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
====================================
Auth State Watcher (Single Source of Truth)
====================================
*/
sb.auth.onAuthStateChange(async (event, session) => {

  if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {

    if (!session?.user) return;

    window.currentUserId = session.user.id;

    loggedOut?.classList.add("hidden");
    loggedIn?.classList.remove("hidden");

    // Sync Supabase → Flask (only once per session)
    await fetch("/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session)
    });

    // Apply role-based nav (cached)
    await updateNavForUser(session.user.id);

    document.dispatchEvent(new Event("user-ready"));
  }

  if (event === "SIGNED_OUT") {
    window.currentUserId = null;

    loggedIn?.classList.add("hidden");
    loggedOut?.classList.remove("hidden");

    navCharacters?.classList.add("hidden");

    localStorage.removeItem("user_role");
  }
});