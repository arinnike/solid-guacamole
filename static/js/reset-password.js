import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

window.supabase ??= createClient(
  window.SUPABASE_URL,
  window.SUPABASE_KEY
);

const supabase = window.supabase;

document.addEventListener("click", async (e) => {
  if (e.target.id !== "forgot-password") return;

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

  if (error) {
    alert(error.message);
  } else {
    alert("Password reset email sent! Check your inbox.");
  }
});

console.log("reset-password.js loaded");