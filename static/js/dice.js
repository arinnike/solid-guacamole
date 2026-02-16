const history = [];

function d(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function pushHistory(text) {
  history.unshift(text);
  if (history.length > 5) history.pop();

  document.getElementById("history").innerHTML =
    history.map(h => `<div class="history-item">${h}</div>`).join("");
}

function roll(sides) {
  const value = d(sides);
  document.getElementById("result").textContent = value;
  document.getElementById("details").textContent = `Rolled d${sides}`;
  pushHistory(`d${sides}: ${value}`);
}

function rollDuality() {
  const hope = d(12);
  const fear = d(12);
  const total = hope + fear;

  let text;

  if (hope === fear) {
    text = "CRITICAL";
  } else if (hope > fear) {
    text = "Hope Dominates";
  } else {
    text = "Fear Dominates";
  }

  document.getElementById("result").textContent = total;
  document.getElementById("details").textContent =
    `Hope ${hope} • Fear ${fear} — ${text}`;

  pushHistory(`Duality → ${total} (H:${hope} F:${fear})`);
}