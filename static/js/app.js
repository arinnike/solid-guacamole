console.log("APP.JS LOADED");

// ============================
// RULES DATA (unchanged)
// ============================
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
title: "Traits",
summary: "Character attributes",
body: `
• <b>Agility</b>: Sprint, Leap, Manuever
• <b>Strength</b>: Lift, Smash, Grapple
• <b>Finesse</b>: Control, Hide, Tinker
• <b>Instinct</b>: Perceive, Sense, Navigate
• <b>Presence</b>: Charm, Perform, Deceive
• <b>Knowledge</b>: Recall, Analyze, Comprehend
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
  title: "Resistance, Immunity, & Damage",
  summary: "Modifying damage",
  body: `
  <b>DAMAGE TYPES</b>
  • There are only two damage types: Physical and Magical
  • Unless otherwise stated, all attacks deal one of these damage types
  • Mundane and unarmed attacks deal Physical damage
  • Spells deal Magical damage
  
  
  <b>RESISTANCE</b>
  • Reduce incoming damage of that type by half
  • Apply resistance before any other modifiers (ex: armor)
  • Effects of multiple resistances to same damage type do not stack
  • Attacks dealing both physical and magical damage only benefit from resistance if they are resistant to both types


  <b>IMMUNITY</b>
  • Ignore incoming damage of that type
  • Attacks dealing both physical and magical damage only benefit from immunity if they are immune to both types


  <b>ARMOR</b>
  • Players may reduce damage thresholds by spending an armor slot
  • Direct damage cannot be reduced by armor slots

  
  <b>EVASION</b>
  • Attack rolls that are greater than or equal to the targets Evasion they hit and deal damage


  <b>MULTI-TARGET ATTACK ROLLS</b>
  • Some abilities allow players to target multiple advesaries
  • Make one attack roll and one damage roll, then apply results to each target individually


  <b>MULTIPLE DAMAGE SOURCES</b>
  • Damage dealt simultaneously from multiple sources
  • Always total before comparing to target's damage thresholds
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
Use these rules if your table uses a 1-inch grid battlemap and prefers a more precise ruleset:

• <b>Melee</b>: 1 square
• <b>Very Close</b>: 3 squares
• <b>Close</b>: 6 squares
• <b>Far</b>: 12 squares
• <b>Very Far</b>: 13+ squares
• <b>Out of Range</b>: Off the battlemap


<b>ABSTRACT RANGE</b>
Use these rules if your table uses physical distances for theater of the mind/LARP sessions: :

• <b>Melee</b>: Close enough to touch, up to a few feet away
• <b>Very Close</b>: Close enough to see details, up to about 5-10 feet away
• <b>Close</b>: Close enough to see prominent details, about 10-30 feet away
• <b>Far</b>: Close enough to see very little detail, about 30-100 feet away
• <b>Very Far</b>: Too far to make out details, about 100-300 feet away
• <b>Out of Range</b>: Anythinbg outside of Very Far range usually can't be targeted


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
];

// ============================
// Globals
// ============================
const container = document.getElementById("cards");
const search = document.getElementById("search");

// ============================
// Sidebar active link (SAFE)
// ============================
document.addEventListener("DOMContentLoaded", () => {
  try {
    const currentPath = window.location.pathname;

    document.querySelectorAll(".nav-link").forEach(link => {
      const href = link.getAttribute("href");
      if (href && href === currentPath) {
        link.classList.add("font-bold");
      }
    });
  } catch (err) {
    console.warn("Sidebar highlight skipped:", err);
  }
});

// ============================
// Dark mode
// ============================
if (localStorage.theme === "dark") {
  document.documentElement.classList.add("dark");
}

function toggleDark() {
  document.documentElement.classList.toggle("dark");
  localStorage.theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

// ============================
// Cheat Sheet Functions (GLOBAL)
// ============================
function toggle(i) {
  document.getElementById("body" + i)?.classList.toggle("hidden");
}

function expandAll() {
  rules.forEach((_, i) =>
    document.getElementById("body" + i)?.classList.remove("hidden")
  );
}

function collapseAll() {
  rules.forEach((_, i) =>
    document.getElementById("body" + i)?.classList.add("hidden")
  );
}

function filterCards() {
  if (!search) return;

  const q = search.value.toLowerCase();
  document.querySelectorAll(".card").forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(q)
      ? "block"
      : "none";
  });
}

// ============================
// Render Cards (isolated)
// ============================
function renderCards() {
  if (!container) return;

  container.innerHTML = "";

  rules.forEach((r, i) => {
    container.innerHTML += `
      <div class="card bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-4">
        <div class="cursor-pointer font-semibold" onclick="toggle(${i})">
          ${r.title}
          <p class="text-sm text-zinc-400">${r.summary}</p>
        </div>
        <div id="body${i}" class="hidden mt-3 whitespace-pre-line text-sm">${r.body}</div>
      </div>
    `;
  });
}

// ============================
// Init Cheat Sheet (guaranteed)
// ============================
if (container) {
  search?.addEventListener("input", filterCards);
  renderCards();
}