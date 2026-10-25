// Our Little Date — no Firebase or online database required.

let screens = ["screen-invite", "screen-plan", "screen-dinner", "screen-songs", "screen-payment"];
let featureScreenIds = [];
const $ = (id) => document.getElementById(id);

let selectedFoods = new Set(["Chicken biryani"]);
let selectedVibe = "Cozy café ☕";
let plan = null;

function showScreen(id) {
  screens.forEach(s => $(s).classList.toggle("hidden", s !== id));
  window.scrollTo({top: 0, behavior: "smooth"});
}

// Tiny secret note reveal (no photos or personal data required).
$("noteBtn").addEventListener("click", () => {
  const note = $("secretNote");
  note.classList.toggle("hidden");
  $("noteBtn").textContent = note.classList.contains("hidden") ? "💌 Open a tiny secret note" : "💌 Hide the secret note";
});

// NO moves on hover, pointer and touch; YES never moves.
const noBtn = $("noBtn");
const buttonArea = $("buttonArea");
function moveNo() {
  const area = buttonArea.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const maxX = Math.max(0, area.width - btn.width);
  // Give the button a taller play area so it can dodge without covering YES.
  buttonArea.style.minHeight = "150px";
  noBtn.style.position = "absolute";
  noBtn.style.left = Math.floor(Math.random() * (maxX + 1)) + "px";
  noBtn.style.top = Math.floor(Math.random() * 95) + "px";
}
noBtn.addEventListener("pointerenter", moveNo);
noBtn.addEventListener("click", (e) => { e.preventDefault(); moveNo(); });
noBtn.addEventListener("touchstart", (e) => { e.preventDefault(); moveNo(); }, {passive:false});
$("yesBtn").addEventListener("click", () => showScreen("screen-plan"));

document.querySelectorAll(".food").forEach(button => {
  button.addEventListener("click", () => {
    const food = button.dataset.food;
    if (selectedFoods.has(food)) {
      selectedFoods.delete(food);
      button.classList.remove("selected");
      button.setAttribute("aria-pressed", "false");
    } else {
      selectedFoods.add(food);
      button.classList.add("selected");
      button.setAttribute("aria-pressed", "true");
    }
  });
});

document.querySelectorAll(".vibe").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".vibe").forEach(b => b.classList.remove("selected"));
    button.classList.add("selected");
    selectedVibe = button.dataset.vibe;
    $("surpriseText").textContent = `Our vibe: ${selectedVibe}. Sounds cute already! 💗`;
  });
});
const dateIdeas = [
  {vibe:"Cozy café ☕", text:"Find a cozy café, share a snack, and talk without rushing."},
  {vibe:"Sunset walk 🌅", text:"Take a sunset walk, then get ice cream together."},
  {vibe:"Movie + snacks 🎬", text:"Pick a feel-good movie and make a mini snack rating list."},
  {vibe:"Food adventure 🍜", text:"Try a new dish each and rate it out of ten."},
  {vibe:"Cozy café ☕", text:"Order one favourite and one new snack to share."}
];
$("surpriseBtn").addEventListener("click", () => {
  const idea = dateIdeas[Math.floor(Math.random() * dateIdeas.length)];
  selectedVibe = idea.vibe;
  document.querySelectorAll(".vibe").forEach(b => b.classList.toggle("selected", b.dataset.vibe === selectedVibe));
  $("surpriseText").textContent = `✨ ${idea.text}`;
});
const songChoice = $("songChoice");
function updateSongLink() {
  const selectedSong = songChoice.options[songChoice.selectedIndex];
  $("songLink").href = "https://www.youtube.com/watch?v=" + encodeURIComponent(selectedSong.value);
  $("songSearchLink").href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(selectedSong.dataset.search);
}
songChoice.addEventListener("change", updateSongLink);
updateSongLink();

const dateInput = $("date");
const today = new Date();
dateInput.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

$("detailsContinueBtn").addEventListener("click", () => {
  if (!dateInput.value) { alert("Please choose a date."); dateInput.focus(); return; }
  if (!$("time").value) { alert("Please choose a time."); $("time").focus(); return; }
  showScreen("screen-dinner");
});
$("dinnerBackBtn").addEventListener("click", () => showScreen("screen-plan"));
$("dinnerContinueBtn").addEventListener("click", () => {
  if (selectedFoods.size === 0) { alert("Choose at least one food."); $("foodGrid").scrollIntoView({behavior:"smooth", block:"center"}); return; }
  showScreen("screen-songs");
});
$("songsBackBtn").addEventListener("click", () => showScreen("screen-dinner"));
$("continueBtn").addEventListener("click", () => {
  if (!dateInput.value) { alert("Please choose a date."); dateInput.focus(); return; }
  if (!$("time").value) { alert("Please choose a time."); $("time").focus(); return; }
  if (selectedFoods.size === 0) { alert("Choose at least one food."); $("foodGrid").scrollIntoView({behavior:"smooth", block:"center"}); return; }
  plan = { name: $("nickname").value.trim(), date: dateInput.value, time: $("time").value, foods: Array.from(selectedFoods), vibe: selectedVibe, song: songChoice.options[songChoice.selectedIndex].text, budget: $("budget").value, specialNote: $("specialNote").value.trim(), place: $("place").value.trim() || "Surprise place", createdAt: new Date().toISOString() };
  showScreen("screen-payment");
});
$("backBtn").addEventListener("click", () => showScreen("screen-songs"));

$("confirmBtn").addEventListener("click", async () => {
  if (!plan) return;
  showScreen(featureScreenIds[0] || "screen-done");
  $("summary").innerHTML = `${plan.name ? `<div>💌 <b>For:</b> ${escapeHtml(plan.name)}</div>` : ""}
    <div>📅 <b>Date:</b> ${escapeHtml(plan.date)}</div>
    <div>⏰ <b>Time:</b> ${escapeHtml(plan.time)}</div>
    <div>🍽️ <b>Food:</b> ${escapeHtml(plan.foods.join(", "))}</div>
    <div>✨ <b>Date vibe:</b> ${escapeHtml(plan.vibe)}</div>
    <div>♫ <b>Song:</b> ${escapeHtml(plan.song)}</div>
    <div>💸 <b>Budget:</b> ${escapeHtml(plan.budget)}</div>
    ${plan.specialNote ? `<div>💌 <b>Special request:</b> ${escapeHtml(plan.specialNote)}</div>` : ""}
    <div>📍 <b>Place / இடம்:</b> ${escapeHtml(plan.place)}</div>
    <div>💝 <b>Payment:</b> Joke only — ₹0 charged</div>`;
  updateCountdown();
  $("complimentText").textContent = "";
  // Save only in this browser. Nothing is sent to an online database.
  let savedLocally = false;
  try {
    localStorage.setItem("romanticDatePlan", JSON.stringify(plan));
    savedLocally = true;
  } catch (e) {
    console.warn("Local browser storage is unavailable.", e);
  }
  $("saveStatus").textContent = savedLocally
    ? "Saved on this device/browser only. No Firebase or online database is used."
    : "This browser could not save locally. You can still share or copy the plan.";
});
function getSummaryText() {
  if (!plan) return "";
  return `💗 Our little food date 💗${plan.name ? `\nFor: ${plan.name}` : ""}\nDate: ${plan.date}\nTime: ${plan.time}\nFood: ${plan.foods.join(", ")}\nDate vibe: ${plan.vibe}\nSong: ${plan.song}\nBudget: ${plan.budget}${plan.specialNote ? `\nSpecial request: ${plan.specialNote}` : ""}\nPlace: ${plan.place}\n₹499 screen was only a joke — ₹0 charged.`;
}
$("whatsappBtn").addEventListener("click", () => {
  const url = "https://wa.me/?text=" + encodeURIComponent(getSummaryText());
  window.open(url, "_blank", "noopener");
});
$("copyBtn").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(getSummaryText()); alert("Date plan copied!"); }
  catch { alert(getSummaryText()); }
});
const cuteLines = [
  "Your smile would be my favourite part of the plan. 💗",
  "Good food is great; good company is better. 🌙",
  "A little time together can make an ordinary day special. ✨",
  "No fancy plan needed—just kindness, comfort, and a snack. 🍓",
  "The best date vibe is the one we both feel happy with. 🌹"
];
$("complimentBtn").addEventListener("click", () => {
  $("complimentText").textContent = cuteLines[Math.floor(Math.random() * cuteLines.length)];
});
function updateCountdown() {
  const target = new Date(`${plan.date}T12:00:00`);
  const now = new Date();
  const days = Math.ceil((target.setHours(0,0,0,0) - new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime()) / 86400000);
  $("countdown").textContent = days <= 0 ? "✨ It's date day! Have a lovely time 💗" : `⏳ ${days} day${days === 1 ? "" : "s"} until the planned date 💗`;
}

$("restartBtn").addEventListener("click", () => {
  plan = null; dateInput.value = ""; $("time").value = ""; $("place").value = ""; $("nickname").value = ""; $("specialNote").value = ""; $("budget").selectedIndex = 0;
  selectedFoods = new Set(["Chicken biryani"]); selectedVibe = "Cozy café ☕";
  document.querySelectorAll(".food").forEach(b => { const selected = b.dataset.food === "Chicken biryani"; b.classList.toggle("selected", selected); b.setAttribute("aria-pressed", String(selected)); });
  document.querySelectorAll(".vibe").forEach(b => b.classList.toggle("selected", b.dataset.vibe === selectedVibe));
  noBtn.style.position = ""; noBtn.style.left = ""; noBtn.style.top = ""; buttonArea.style.minHeight = "80px";
  showScreen("screen-invite");
});
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}


// Step-by-step experience: each feature becomes its own screen in the same website.
(function buildStepFlow() {
  const suite = $("featureSuite");
  if (!suite) return;
  const cards = Array.from(suite.querySelectorAll(":scope > .feature-card"));
  const labels = ["Secret Love Letter", "Couple Quiz", "Date Wheel", "Final Surprise", "Date Invitation"];
  const ids = ["screen-letter", "screen-quiz", "screen-wheel", "screen-surprise", "screen-invitation"];
  const main = document.querySelector("main.wrap");
  cards.forEach((card, index) => {
    const section = document.createElement("section");
    section.className = "card hidden step-feature-screen";
    section.id = ids[index];
    const progress = document.createElement("div");
    progress.className = "step-progress";
    progress.textContent = `OUR LITTLE DATE  ·  STEP ${index + 1} OF ${cards.length}`;
    const title = document.createElement("h1");
    title.className = "step-title";
    title.textContent = labels[index];
    const intro = document.createElement("p");
    intro.className = "sub";
    intro.textContent = ["A little note, written just for someone special.", "Pick the date mood that sounds most like you.", "Let the wheel choose a little adventure.", "One tiny secret is waiting to be unlocked.", "Your personal invitation is ready to create."][index];
    section.append(progress, title, intro, card);
    const nav = document.createElement("div");
    nav.className = "step-nav";
    const back = document.createElement("button");
    back.className = "btn secondary"; back.type = "button"; back.textContent = "← Previous";
    back.addEventListener("click", () => showScreen(index === 0 ? "screen-payment" : ids[index - 1]));
    const next = document.createElement("button");
    next.className = "btn yes"; next.type = "button"; next.textContent = index === cards.length - 1 ? "View our plan ♥" : "Next step →";
    next.addEventListener("click", () => showScreen(index === cards.length - 1 ? "screen-done" : ids[index + 1]));
    nav.append(back, next); section.append(nav); main.append(section);
    featureScreenIds.push(ids[index]);
  });
  suite.remove();
  screens = ["screen-invite", "screen-plan", "screen-dinner", "screen-songs", "screen-payment", ...featureScreenIds, "screen-done"];
  const done = $("screen-done");
  const progress = document.createElement("div");
  progress.className = "step-progress"; progress.textContent = "FINAL STEP  ·  YOUR DATE PLAN";
  done.insertBefore(progress, done.firstChild);
  const top = document.createElement("div"); top.className = "step-progress top-progress";
  top.id = "journeyProgress"; main.insertBefore(top, main.firstChild);
  const originalShow = showScreen;
  showScreen = function(id) {
    originalShow(id);
    const position = screens.indexOf(id);
    if (top) top.textContent = position > 0 ? `STEP ${position} OF ${screens.length - 1}  ·  ${id === "screen-done" ? "YOUR DATE PLAN" : "OUR LITTLE DATE JOURNEY"}` : "";
    if (top) top.classList.toggle("hidden", id === "screen-invite");
  };
})();

// Gentle falling hearts/petals.
const petalBox = $("petals");
setInterval(() => {
  const el = document.createElement("span");
  el.className = "petal";
  el.textContent = Math.random() > .45 ? "♡" : "✿";
  el.style.left = Math.random() * 100 + "vw";
  el.style.animationDuration = (7 + Math.random() * 7) + "s";
  el.style.fontSize = (10 + Math.random() * 13) + "px";
  petalBox.appendChild(el);
  setTimeout(() => el.remove(), 15000);
}, 700);


// Cinematic features: local-only letter, playful quiz, date wheel, surprise and invitation.
let wheelTurns = 0;
let unlockTaps = 0;
let latestInvitation = "";
const wheelIdeas = ["Sunset walk + ice cream 🌅🍨", "Share a pizza and swap stories 🍕💗", "A cozy café and long talks ☕🌙", "Try a new street-food spot 🌯✨", "Movie night with favourite snacks 🎬🍿", "Dessert first — just this once 🍰💞"];
const safeText = (value) => String(value || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c]));

$("nightBtn").addEventListener("click", () => {
  const enabled = document.body.classList.toggle("night-dim");
  $("nightBtn").setAttribute("aria-pressed", String(enabled));
  $("nightBtn").textContent = enabled ? "✨ Cinematic glow" : "🌙 Night mode";
});

$("openLetterBtn").addEventListener("click", () => {
  const name = $("letterName").value.trim();
  const message = $("letterMessage").value.trim() || "I don't need a perfect day. A little time, good food, and your smile would make it special. 💗";
  const result = $("letterResult");
  result.innerHTML = `<strong>To ${safeText(name || "my favourite person")} 💌</strong>\n\n${safeText(message)}\n\n— someone who hopes you smile ✨`;
  result.classList.remove("hidden");
  try { localStorage.setItem("romanticLoveLetter", JSON.stringify({name, message})); } catch (_) {}
});

$("quizOptions").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-answer]");
  if (!button) return;
  const replies = {food:"Your date mission: discover something delicious together. 🍜",talk:"Your date mission: put the phones away and talk under the evening sky. 🌙",movie:"Your date mission: choose a feel-good movie and share the snacks. 🎬"};
  $("quizResult").textContent = replies[button.dataset.answer];
  document.querySelectorAll("#quizOptions button").forEach(b => b.classList.toggle("selected", b === button));
});

$("spinBtn").addEventListener("click", () => {
  const wheel = $("dateWheel");
  wheelTurns += 1;
  wheel.style.transform = `rotate(${wheelTurns * 720 + Math.floor(Math.random()*360)}deg)`;
  const idea = wheelIdeas[Math.floor(Math.random()*wheelIdeas.length)];
  $("wheelResult").textContent = "Tonight's little possibility: " + idea;
  try { localStorage.setItem("romanticWheelIdea", idea); } catch (_) {}
});

$("unlockBtn").addEventListener("click", () => {
  unlockTaps += 1;
  $("unlockBtn").textContent = unlockTaps >= 3 ? "♥" : "♡".repeat(unlockTaps + 1);
  if (unlockTaps >= 3) {
    $("unlockResult").classList.remove("hidden");
    $("unlockBtn").disabled = true;
  }
});

function invitationText() {
  if (!plan) return "YOU'RE INVITED 💗\nTo our little date. Pick a day, bring your smile, and let's make a memory.";
  return `🌙 YOU'RE INVITED TO OUR LITTLE DATE 💗\n${plan.name ? "For: " + plan.name + "\n" : ""}Date: ${plan.date}\nTime: ${plan.time}\nFood: ${plan.foods.join(", ")}\nVibe: ${plan.vibe}\nPlace: ${plan.place}\n\nNo pressure, just a little time together and a memory waiting to happen. ✨`;
}
$("makeInviteBtn").addEventListener("click", () => {
  latestInvitation = invitationText();
  $("invitationPreview").innerHTML = `YOU'RE INVITED<br><span>to our little date</span> 🌙<br><small>${safeText(plan?.date || "A day to remember")} · ${safeText(plan?.time || "Whenever we're both free")}</small><br>💗`;
  try { localStorage.setItem("romanticDateInvitation", latestInvitation); } catch (_) {}
});
$("downloadInviteBtn").addEventListener("click", () => {
  latestInvitation = invitationText();
  const blob = new Blob([latestInvitation], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "our-little-date-invitation.txt";
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

// Countdown now respects the selected time as well as the date.
const originalUpdateCountdown = updateCountdown;
updateCountdown = function() {
  if (!plan) return originalUpdateCountdown();
  const target = new Date(`${plan.date}T${plan.time || "00:00"}`);
  const diff = target.getTime() - Date.now();
  if (diff <= 0) { $("countdown").textContent = "✨ It's date time! Have a lovely time together. 💗"; return; }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  $("countdown").textContent = `⏳ ${days}d ${hours}h ${minutes}m until your date 💗`;
};
try {
  const savedLetter = JSON.parse(localStorage.getItem("romanticLoveLetter") || "null");
  if (savedLetter) { $("letterName").value = savedLetter.name || ""; $("letterMessage").value = savedLetter.message || ""; }
} catch (_) {}
