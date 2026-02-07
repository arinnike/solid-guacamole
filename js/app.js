const rules = [
{
title: "Action Rolls",
summary: "Roll 2d12 + Trait vs Difficulty",
body: `
ROLL
• Roll 2d12 + Trait
• Compare to Difficulty

OUTCOMES
• Full Success
• Partial Success
• Failure gains Fear

CRITICAL
• Doubles = Critical success
`
},
{
title: "Fear & Hope",
summary: "Core resource mechanics",
body: `
HOPE
• Spend for bonuses and abilities

FEAR
• GM gains on failures
• Spend to escalate threats
`
},
{
title: "Conditions",
summary: "Status effects",
body: `
• Impaired
• Frightened
• Vulnerable
`
},
{
title: "Range & Movement",
summary: "Close / Near / Far",
body: `
RANGES
• Close
• Near
• Far

MOVEMENT
• Free move per turn
`
},
{
title: "Downtime Actions",
summary: "Between adventures",
body: `
• Recover
• Train
• Craft
• Gather Information
`
},
{
title: "Death Moves",
summary: "When reduced to zero",
body: `
• Make Death Move
• Allies may intervene
`
},
{
title: "Group Action Rolls",
summary: "Party coordination",
body: `
• One rolls
• Others assist
`
},
{
title: "Tag Team Rolls",
summary: "Two players act together",
body: `
• Coordinate
• Roll once with bonus
`
}
]

const container = document.getElementById("cards")
const search = document.getElementById("search")
const expandBtn = document.getElementById("expandBtn")
const collapseBtn = document.getElementById("collapseBtn")

function render() {
container.innerHTML = ""
rules.forEach((r,i)=>{
container.innerHTML += `
<div class="card bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-4">
  <div class="cursor-pointer font-semibold" onclick="toggle(${i})">
    ${r.title}
    <p class="text-sm text-zinc-400">${r.summary}</p>
  </div>
  <div id="body${i}" class="hidden mt-3 whitespace-pre-line text-sm">${r.body}</div>
</div>`
})
}

function toggle(i){
document.getElementById("body"+i).classList.toggle("hidden")
}

function expandAll(){
rules.forEach((_,i)=>document.getElementById("body"+i).classList.remove("hidden"))
}

function collapseAll(){
rules.forEach((_,i)=>document.getElementById("body"+i).classList.add("hidden"))
}

function filterCards(){
const q = search.value.toLowerCase()
document.querySelectorAll(".card").forEach(card=>{
card.style.display = card.innerText.toLowerCase().includes(q) ? "block" : "none"
})
}

function toggleDark(){
document.documentElement.classList.toggle("dark")
localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light"
}

search.addEventListener("input", filterCards)
expandBtn.addEventListener("click", expandAll)
collapseBtn.addEventListener("click", collapseAll)

// Load theme
if(localStorage.theme==="dark"){
document.documentElement.classList.add("dark")
}

render()
