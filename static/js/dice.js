const history = [];

function d(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function pushHistory(text) {

  document.getElementById("history").innerHTML =
    history.map(h => `<div class="history-item">${h}</div>`).join("");

  history.unshift(text);

  if (history.length > 5) history.pop();
}

function roll(sides) {
  const value = d(sides);
  document.getElementById("result").style.display = "block";
  document.getElementById("details").style.display = "block";
  document.getElementById("history").style.display = "block";
  document.getElementById("result").textContent = value;
  document.getElementById("details").textContent = `Rolled d${sides}`;
  pushHistory(`d${sides}: ${value}`);
}

function rollDuality() {
    document.getElementById("result").style.display = "block";
    document.getElementById("details").style.display = "block";
    document.getElementById("history").style.display = "block";
    const hope = d(12);
    const fear = d(12);
    const total = hope + fear;

    let outcome;

    if (hope === fear) {
    outcome = "Critical";
    } else if (hope > fear) {
    outcome = "Hope";
    } else {
    outcome = "Fear";
    }

    // Top line becomes: "8 Fear" or "10 Hope"
    document.getElementById("result").textContent = `${total} ${outcome}`;

    // Details line becomes: "Duality → Hope 2 • Fear 6"
    document.getElementById("details").textContent =
    `Duality → Hope ${hope} • Fear ${fear}`;

    pushHistory(`Duality → ${total} ${outcome} (H:${hope} F:${fear})`);
}