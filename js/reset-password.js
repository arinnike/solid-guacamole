import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  window.SUPABASE_URL,
  window.SUPABASE_KEY
);

document.getElementById("reset-btn")?.addEventListener("click", async () => {
  const password = document.getElementById("new-password").value;
  const status = document.getElementById("status");

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    status.textContent = error.message;
  } else {
    status.textContent = "Password updated! Redirecting...";
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  }
});