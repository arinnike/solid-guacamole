/* =========================================
   STEP 2 – Class Selection
========================================= */

let cachedClasses = [];

/* ---------- Loader ---------- */

async function loadClasses() {

  const loading =
    document.getElementById("class-loading");

  if (loading) {
    loading.classList.remove("hidden");
  }

  const classes =
    await apiFetch("/classes");

  cachedClasses = classes;

  renderClassList(classes);

  if (loading) {
    loading.classList.add("hidden");
  }
}

/* ---------- Render Left Column ---------- */

function renderClassList(classes) {

  const list =
    document.getElementById("class-list");

  if (!list) return;

  list.innerHTML = classes.map(c => `
    <button
      class="w-full text-left px-4 py-3 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
      data-class-id="${c.id}"
      onclick="selectClass(${c.id})">
      <div class="font-semibold">${c.name}</div>
    </button>
  `).join("");

  renderClassEmptyState();
}

/* ---------- Empty State ---------- */

function renderClassEmptyState() {

  const panel =
    document.getElementById("class-detail-panel");

  if (!panel) return;

  panel.innerHTML = `
    <div class="space-y-3 max-w-md">
      <div class="text-xl font-semibold">
        Select a Class
      </div>
      <div class="text-sm text-zinc-500">
        Choose a class to view its features and subclasses.
      </div>
    </div>
  `;
}

/* ---------- Select Class ---------- */

function selectClass(id) {

  document.querySelectorAll("#class-list button")
    .forEach(btn => {
      btn.classList.remove(
        "ring-2","ring-blue-500",
        "bg-zinc-100","dark:bg-zinc-700"
      );

      if (Number(btn.dataset.classId) === Number(id)) {
        btn.classList.add(
          "ring-2","ring-blue-500",
          "bg-zinc-100","dark:bg-zinc-700"
        );
      }
    });

  const selected =
    cachedClasses.find(
      c => Number(c.id) === Number(id)
    );

  renderClassDetail(selected);
}

/* ---------- Render Detail Panel ---------- */

function renderClassDetail(c) {

  const panel =
    document.getElementById("class-detail-panel");

  if (!panel || !c) return;

  panel.innerHTML = `
    <div class="space-y-6">

      <div>
        <h2 class="text-2xl font-bold">${c.name}</h2>
        <p class="text-zinc-500">${c.class_description || ""}</p>
      </div>

      <div class="grid grid-cols-2 gap-4 text-sm">

        <div>
          <div class="font-semibold">Starting HP</div>
          <div>${c.starting_hp ?? "-"}</div>
        </div>

        <div>
          <div class="font-semibold">Starting Evasion</div>
          <div>${c.starting_evasion ?? "-"}</div>
        </div>

        <div class="col-span-2">
          <div class="font-semibold">Starting Items</div>
          <div class="text-zinc-500">${c.starting_items ?? "-"}</div>
        </div>

        <div class="col-span-2">
          <div class="font-semibold">Hope Feature</div>
          <div class="text-zinc-500">${c.hope_feature ?? "-"}</div>
        </div>

        <div class="col-span-2">
          <div class="font-semibold">Class Feature</div>
          <div class="text-zinc-500">${c.class_feature ?? "-"}</div>
        </div>

      </div>

      <div>
        <div class="font-semibold mb-3 text-lg">
          Choose Your Subclass
        </div>

        <div class="space-y-4">
          ${c.subclasses.map(s => `
            <div class="border rounded p-4 bg-zinc-50 dark:bg-zinc-900 space-y-3">

              <div>
                <div class="font-semibold text-base">
                  ${s.subclass_name}
                </div>
                <div class="text-sm text-zinc-500">
                  ${s.subclass_description || ""}
                </div>
              </div>

              <div class="text-sm space-y-2">

                <div>
                  <span class="font-semibold">Foundation Feature:</span>
                  <div class="text-zinc-500">
                    ${s.foundation_feature ?? "-"}
                  </div>
                </div>

                <div>
                  <span class="font-semibold">Mastery Feature:</span>
                  <div class="text-zinc-500">
                    ${s.mastery_feature ?? "-"}
                  </div>
                </div>

              </div>

              <button
                class="mt-2 px-4 py-2 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                onclick="selectSubclass(${c.id}, ${s.id})">
                Select ${s.subclass_name}
              </button>

            </div>
          `).join("")}
        </div>

      </div>

    </div>
  `;
}

//Step 4 helper to get class name for spellcast trait display
function getSelectedClassName() {
  const selected =
    cachedClasses.find(
      c => Number(c.id) === Number(wizardState.class_id)
    );

  return selected?.name || "";
}

/* ---------- Select Subclass ---------- */

function selectSubclass(classId, subclassId) {

  wizardState.class_id = classId;
  wizardState.subclass_id = subclassId;

  const selectedClass =
    cachedClasses.find(
      c => Number(c.id) === Number(classId)
    );

  wizardState.spellcast_trait =
    selectedClass?.spellcast_trait || null;

  completeStep(2);

  openStep(3, loadAncestries);
}