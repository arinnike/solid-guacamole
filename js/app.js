const rules = [
{
title: "Action Rolls",
summary: "Roll Duality Dice + Trait vs Difficulty",
body: `
<b>ROLL</b>
• Roll Duality Dice + Trait
• Compare to Difficulty
• Note which is higher, Hope or Fear
• Critical Success occurs when the Duality Dice show a matching result

<b>Critical Success</b>
• Succeed with a bonus
• Take a Hope and remove a Stress

<b>Success</b>
• With Hope: Succeed and take a Hope
• With Fear: Succeed with a cost or complication. GM gains a Fear

<b>Failure</b>
• With Hope: Fail with a minor consequence and gain a Hope. Spotlight swings to the GM
• With Fear: Fail with a major consequence and the GM gains a Fear. Spotlight swings to the GM


<b>ADVANTAGE & DISADVANTAGE</b>
• Advantage adds 1d6 to an action or reaction roll
• Disadvantage subtracts 1d6 from an action roll
• Both advantage and disadvantage cancel eachother out when added to the same dice pool
• When gaining advantage from another dice pool (ex: another players help action) their effects stack with your rolled results


<b>DIFFICULTY</b>
• Easiest: 5
• Easy: 10
• Moderate: 15
• Hard: 20
• Very Hard: 25
• Impossible: 30
`
},
{
title: "Fear & Hope",
summary: "Core resource mechanics",
body: `
<b>HOPE</b>
Players can spend Hope to:

<b>Help an Ally</b>
• Roll an advantage die to help an ally making an action roll
• If multiple players spend Hope to help an ally that player only adds the highest result to their total

<b>Use an Experience</b>
• Add its modifier to the result of the roll
• Players may multiple hope to utilize multiple Experiences
 
<b>Initiate a Tag Team Roll</b>
• See Tag Team Rolls card for details

<b>Activate a Hope Feature</b>
• Each class has a specific hope feature that may be found on their character sheet
• Certain spells and abilities may also require spending Hope to activate


<b>FEAR</b>
Spent by GMs on moves or features:

• Gained when a player rolls with Fear
• Can be spent at any time to make or enhance a GM move or use a Fear Feature
• GM can have up to 12 Fear at one time
• Fear carries over between sessions
`
},
{
title: "Conditions",
summary: "Status effects",
body: `
<b>HIDDEN</b>
• Gain Hidden when you are out of sight from all enemies and they do not otherwise know your location
• While Hidden, any rolls against you have disadvantage
• You lose Hidden after an adversary moves to where they would see you, you move into their line of sight, or you make an attack

<b>RESTRAINED</b>
• Restrained characters cannot move, but you can still take actions from your current position

<b>VULNERABLE</b>
• When a creature is Vulnerable, all rolls targeting them have advantage
`
},
{
title: "Range & Movement",
summary: "Positioning and distance",
body: `
<b>MOVEMENT</b>
• Counts as an action during your turn
• When under pressure/in danger you can move to a location within Close range as part of that action
• If you want to move further than your Close range you must succeed on an Agility roll to do so
• An advesary can move within Close range for free as part of an action or within Very Far range as a seperate action


<b>DEFINED RANGE</b>
Use the following if your table uses a 1-inch grid battlemap and prefers a more precise ruleset:

• Melee: 1 square
• Very Close: 3 squares
• Close: 6 squares
• Far: 12 squares
• Very Far: 13+ squares
• Out of Range: Off the battlemap


<b>ABSTRACT RANGE</b>
Use these rules if you are using physical distances for theater of the mind/LARP sessions: :

• Melee: Close enough to touch, up to a few feet away
• Very Close: Close enough to see details, up to about 5-10 feet away
• Close: Close enough to see prominent details, about 10-30 feet away
• Far: Close enough to see very little detail, about 30-100 feet away
• Very Far: Too far to make out details, about 100-300 feet away
• Out of Range: Anythinbg outside of Very Far range usually can't be targeted


<b>LINE OF SIGHT & COVER </b>
• You must have line of sight to the target to make an attack roll unless otherwise stated
• A partial obstruction between attacker and target grants the target cover
• Attacks rolled through cover have disadvantage
• If the obstruction is total there is no line of sight


<b>AREA OF EFFECT</b>
• Targets must be within Very Close range of a single origin point unless otherwise stated
`
},
{
title: "Downtime",
summary: "Short and Long Rests",
body: `
<b>SHORT REST</b>
• Rest for about an hour in-world
• Freely move domain cards between loadout and vault
• Choose 2 downtime moves (same move may be chosen twice)
• GM gains 1d4 Fear

<b>LONG REST</b>
• Rest for several hours for sleep or relaxation
• Freely move domain cards between loadout and vault
• Choose 2 downtime moves (same move may be chosen twice)
•  GM gains Fear equal to 1d4 + number of players

<b>DOWNTIME MOVES</b>
<b>Short Rest</b>
• Tend to Wounds: Clear 1d4+Tier HP for self or ally
• Clear Stress: Clear 1d4+Tier Stress for self or ally
• Repair Armor: Clear 1d4+Tier Armor Slots for self or ally
• Prepare: Gain 1 Hope - If preparing with one or more party members each gains 2 Hope

<b>Long Rest</b>
• Tend to Wounds: Clear ALL for self or ally
• Clear Stress: Clear ALL Stress for self or ally
• Repair Armor: Clear ALL Armor Slots for self or ally
• Prepare: Gain 1 Hope - If preparing with one or more party members each gains 2 Hope
• Work on a Project: Pursue a long term project with a countdown
`
},
{
title: "Death",
summary: "Blaze of Glory / Avoid Death / Risk It All",
body: `
When a PC marks their last HP they must make a death move by choosing one of the following:

<b>BLAZE OF GLORY</b>
• Embrace death and go out in a blaze of glory
• Take one final action that automatically critically succeeds (with GM approval)
• Cross through the veil of death

<b>AVOID DEATH</b>
• Avoid death and face the consequences
• Drop unconscious and work with the GM to decide how the situation worsens
• While unconscious the PC cannot move, act, or be targeted by an attack
• Return to consciousness when an ally clears one or more of the PC's HP or the party finishes a long rest
• After falling unconscious roll your Hope Die (1d12); if result is higher or equal to character level gain a scar and permanently cross out a Hope
• If the players last Hope is ever crossed out the characters journey ends

<b>RISK IT ALL</b>
• Player rolls their Duality Dice
• If Hope is higher, character lives and clears either HP equal to value of the Hope die or can split it between HP and Stress
• If Fear is higher, character dies
• On a critical success (matching results) the character stays up and clears all HP and Stress
`
},
{
title: "Group Action Rolls",
summary: "Party coordination",
body: `
• When multiple PCs take action together they choose one PC to lead the action.
• Leader makes a roll as usual and other players make reaction rolls with traits.
• Leader gains a +1 bonus to their action roll for each reaction roll that succeeds and a -1 penalty for each reaction roll that fails.
`
},
{
title: "Tag Team Rolls",
summary: "Two players acting together",
body: `
• A player can be involved in multiple Tag Team Rolls but may only initiate it once per session at a cost of 3 Hope.
• Player initiating the Tag Team Roll partners with another player character
• Both players make separate action rolls and decide which roll they want to use for the outcome
• Rolls with Hope grant both players a Hope
• Rolls with Fear grant the GM a Fear for each PC involved

<b>ATTACK ROLLS</b>
• On a successful attack roll both players roll damage and add totals together
• Damage treated as coming from a single source
• If attacks deal different types of damage players choose which type to deal
`
}
]

const container = document.getElementById("cards")
const search = document.getElementById("search")

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


// Load theme
if(localStorage.theme==="dark"){
document.documentElement.classList.add("dark")
}

render()
