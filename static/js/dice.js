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

  let outcome;
  let text;

  if (hope === fear) {
    outcome = total * 2;
    text = "CRITICAL SUCCESS";
  } else if (hope > fear) {
    outcome = total + hope;
    text = "Hope Dominates";
  } else {
    outcome = total + fear;
    text = "Fear Dominates";
  }

  document.getElementById("result").textContent = outcome;
  document.getElementById("details").textContent =
    `Hope ${hope} • Fear ${fear} — ${text}`;

  pushHistory(`Duality → ${outcome} (H:${hope} F:${fear})`);
}