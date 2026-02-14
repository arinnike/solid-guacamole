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

  // Auth state watcher
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      loggedOut.classList.add("hidden");
      loggedIn.classList.remove("hidden");

      const userId = session.user.id;

      // Ensure user_settings exists
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

  // Initial session check
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    loggedIn.classList.remove("hidden");
  } else {
    loggedOut.classList.remove("hidden");
  }

  // Forgot password (delegated)
  document.addEventListener("click", async (e) => {
    if (e.target.id !== "forgot-password") return;

    e.preventDefault();

    signinMenu?.classList.add("hidden");

    const email = document.getElementById("email")?.value;

    if (!email) {
      alert("Please enter your email first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://dhgmtools.com/reset-password",
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password reset email sent! Check your inbox.");
    }
  });

  console.log("login.js loaded");

});