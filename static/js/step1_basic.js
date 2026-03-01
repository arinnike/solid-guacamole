/* =========================================
   STEP 1 – Basic Info
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const completeBtn =
    document.getElementById("step1-complete");

  if (!completeBtn) return;

  completeBtn.addEventListener("click", () => {

    const nameInput =
      document.getElementById("char-name");

    const pronounsInput =
      document.getElementById("char-pronouns");

    const levelInput =
      document.getElementById("char-level");

    const name =
      nameInput?.value.trim();

    if (!name) {
      alert("Character name required.");
      return;
    }

    wizardState.name = name;

    wizardState.pronouns =
      pronounsInput?.value.trim() || null;

    wizardState.level =
      parseInt(levelInput?.value || 1);

    completeStep(1);

    // Step 2 will define its own loader
    openStep(2, loadClasses);
  });
});