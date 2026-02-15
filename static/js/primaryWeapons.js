console.log("primaryWeapons.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("search");
  const table = document.getElementById("primaryWeaponsTable");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  const status = document.getElementById("table-status");

  let debounceTimeout = null;

  async function loadWeapons(query = "") {
    try {
      status.textContent = "Loading...";
      tbody.innerHTML = "";
      thead.innerHTML = "";

      const res = await fetch(`/api/primary_weapons?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Failed to fetch weapons");

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        status.textContent = "No weapons found.";
        return;
      }

      status.textContent = "";

      // Build headers
      const headers = Object.keys(data[0]);

      const headerRow = document.createElement("tr");

      headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        th.className = "px-3 py-2 text-left font-semibold";
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);

      // Build rows safely
      data.forEach(row => {
        const tr = document.createElement("tr");
        tr.className = "border-t dark:border-zinc-700";

        headers.forEach(header => {
          const td = document.createElement("td");
          td.textContent = row[header] ?? "";
          td.className = "px-3 py-2";
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

    } catch (err) {
      console.error(err);
      status.textContent = "Error loading weapons.";
    }
  }

  // Debounced search
  searchInput?.addEventListener("input", (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      loadWeapons(e.target.value);
    }, 300);
  });

  // Initial load
  loadWeapons();
});
