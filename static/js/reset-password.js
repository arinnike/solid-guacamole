const supabase = window.supabase;

console.log("reset-password.js loaded");

// Handle password update
document.getElementById("reset-btn")?.addEventListener("click", async () => {
  const password = document.getElementById("new-password")?.value;
  const status = document.getElementById("status");

  if (!password) {
    alert("Please enter a new password.");
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error(error);
    status.textContent = error.message;
  } else {
    status.textContent = "Password updated! Redirecting…";

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  }
});