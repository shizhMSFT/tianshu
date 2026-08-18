const app = document.querySelector("#app");
let state;
let screen = "home";
let index = 0;
let queue = [];
let flipped = false;
let selectedOption = null;
let submitted = false;

const events = new EventSource("/events");
for (const eventName of ["generation", "study-set", "progress"]) {
  events.addEventListener(eventName, () => refresh());
}

window.addEventListener("keydown", (event) => {
  if (screen === "flashcards" && event.code === "Space") {
    event.preventDefault();
    if (!flipped) {
      flipped = true;
      render();
    }
  }
  if (screen === "flashcards" && flipped && ["1", "2", "3"].includes(event.key)) {
    rateCard(["again", "unsure", "know"][Number(event.key) - 1]);
  }
});

await refresh();

async function refresh() {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load study state.");
    state = await response.json();
    render();
  } catch (error) {
    app.innerHTML = `<section class="shell card error"><strong>Canvas error</strong><p>${escapeHtml(error.message)}</p></section>`;
  }
}

function render() {
  if (!state) return;
  if (state.generation.status === "generating" || state.generation.status === "repairing") return renderGenerating();
  if (!state.studySet || screen === "home") return renderHome();
  if (screen === "quiz") return renderQuiz();
  if (screen === "flashcards") return renderFlashcard();
  return renderResults();
}

function shell(content, progress = null) {
  const progressMarkup = progress === null ? "" : `
    <div class="progress-label"><span>${progress.label}</span><strong>${progress.current}/${progress.total}</strong></div>
    <div class="progress-track"><div class="progress-fill" style="width:${progress.total ? (progress.current / progress.total) * 100 : 0}%"></div></div>`;
  return `<div class="shell">
    <header class="topbar">
      <div><p class="eyebrow">Knowledge Study</p><h1>${escapeHtml(state.knowledge.title)}</h1></div>
      ${state.studySet ? `<button class="button" data-action="home">Capability map</button>` : ""}
    </header>
    ${progressMarkup}
    ${content}
  </div>`;
}

function renderHome() {
  const hasSet = Boolean(state.studySet);
  const generationError = state.generation.error
    ? `<div class="error"><strong>Generation needs attention</strong><p>${escapeHtml(state.generation.error)}</p></div>` : "";
  const counts = hasSet ? `
    <div class="metrics">
      <div class="metric"><strong>${state.mastery.concepts.filter((concept) => concept.status === "Mastered").length}/${state.mastery.concepts.length}</strong><span>Capabilities mastered</span></div>
      <div class="metric"><strong>${Math.round(state.mastery.overallScore * 100)}%</strong><span>Current mastery</span></div>
      <div class="metric"><strong>${state.recommended?.questionIds.length || 0}</strong><span>Recommended questions</span></div>
    </div>` : "";
  const recommendation = state.recommended;
  const action = recommendation?.questionIds.length
    ? `<button class="button primary" data-action="start-recommended">Start ${escapeHtml(recommendation.title)}</button>`
    : "";
  app.innerHTML = shell(`
    <section class="card study-card">
      ${generationError}
      <p class="source"><strong>Knowledge source:</strong> ${escapeHtml(state.knowledge.path)}<br>${state.knowledge.headings.length} knowledge sections</p>
      <h2>${hasSet ? "Your next training session" : "Build your training pool"}</h2>
      <p>${hasSet
        ? escapeHtml(recommendation?.description || "Preparing your next training session.")
        : "Copilot will create source-grounded diagnostic, practice, and challenge questions using only this knowledge material. Each capability receives questions in different scenarios."}</p>
      ${counts}
      <div class="actions">
        ${action}
        ${hasSet ? `<button class="button" data-action="results">View capability map</button>
          <button class="button" data-action="flashcards">Review flashcards</button>` : ""}
        <button class="button ${hasSet ? "" : "primary"}" data-action="generate">${hasSet ? "Generate new pool" : "Generate pool"}</button>
        ${hasSet ? `<button class="button danger" data-action="reset">Reset progress</button>` : ""}
      </div>
    </section>`);
  bindCommon();
}

function renderGenerating() {
  app.innerHTML = shell(`
    <section class="card loading">
      <div class="spinner" aria-hidden="true"></div>
      <div><h2>${state.generation.status === "repairing" ? "Repairing question quality" : "Generating training pool"}</h2>
      <p>Copilot is checking for clear prompts, one best answer, and traceable sources.</p></div>
    </section>`);
  bindCommon();
}

function renderQuiz() {
  if (!queue.length || index >= queue.length) {
    screen = "results";
    index = 0;
    resetQuestion();
    return render();
  }
  const question = state.studySet.quizQuestions.find((item) => item.id === queue[index]);
  if (!question) {
    index += 1;
    return render();
  }
  const optionMarkup = question.options.map((option, optionIndex) => {
    const classes = ["option"];
    if (selectedOption === optionIndex) classes.push("selected");
    if (submitted && optionIndex === question.correctOption) classes.push("correct");
    if (submitted && selectedOption === optionIndex && optionIndex !== question.correctOption) classes.push("incorrect");
    return `<button class="${classes.join(" ")}" data-option="${optionIndex}" ${submitted ? "disabled" : ""}>
      <strong>${String.fromCharCode(65 + optionIndex)}.</strong> ${escapeHtml(option)}
    </button>`;
  }).join("");
  app.innerHTML = shell(`
    <section class="card study-card">
      <p class="eyebrow">${stageLabel(question.stage)} · ${escapeHtml(conceptTitle(question.conceptId))}</p>
      <h2>${escapeHtml(question.prompt)}</h2>
      <div class="options">${optionMarkup}</div>
      ${submitted ? `<div class="feedback"><strong>${selectedOption === question.correctOption ? "Correct" : "Needs reinforcement"}</strong>
        <p>${escapeHtml(question.rationale)}</p>
        <p class="source"><strong>${escapeHtml(question.source.heading)}</strong><br>${escapeHtml(question.source.excerpt)}</p></div>` : ""}
      <div class="actions">
        ${submitted
          ? `<button class="button primary" data-action="next-question">${index + 1 === queue.length ? "View capability map" : "Next question"}</button>`
          : `<button class="button primary" data-action="submit-answer" ${selectedOption === null ? "disabled" : ""}>Check answer</button>`}
      </div>
    </section>`, { label: stageLabel(question.stage), current: index + 1, total: queue.length });
  bindCommon();
  document.querySelectorAll("[data-option]").forEach((button) => button.addEventListener("click", () => {
    selectedOption = Number(button.dataset.option);
    render();
  }));
  document.querySelector("[data-action='submit-answer']")?.addEventListener("click", () => submitQuiz(question));
  document.querySelector("[data-action='next-question']")?.addEventListener("click", () => {
    index += 1;
    resetQuestion();
    render();
  });
}

function renderFlashcard() {
  const cards = state.studySet.flashcards;
  if (index >= cards.length) return changeScreen("home");
  const card = cards[index];
  app.innerHTML = shell(`
    <section class="card study-card">
      <p class="eyebrow">${escapeHtml(card.difficulty)} · ${escapeHtml(conceptTitle(card.conceptId))}</p>
      <div class="flash-face">
        ${flipped
          ? `<div class="answer"><h2>${escapeHtml(card.answer)}</h2><p>${escapeHtml(card.explanation)}</p>
             <p class="source"><strong>${escapeHtml(card.source.heading)}</strong><br>${escapeHtml(card.source.excerpt)}</p></div>`
          : `<div><h2>${escapeHtml(card.prompt)}</h2><p class="muted">Recall your answer, then reveal the back.</p></div>`}
      </div>
      <div class="actions center">
        ${flipped
          ? `<button class="button danger" data-rating="again">1 · Again</button>
             <button class="button" data-rating="unsure">2 · Unsure</button>
             <button class="button primary" data-rating="know">3 · Know</button>`
          : `<button class="button primary" data-action="flip">Reveal answer <span class="muted">(Space)</span></button>`}
      </div>
    </section>`, { label: "Flashcard review", current: index + 1, total: cards.length });
  bindCommon();
  document.querySelector("[data-action='flip']")?.addEventListener("click", () => {
    flipped = true;
    render();
  });
  document.querySelectorAll("[data-rating]").forEach((button) => button.addEventListener("click", () => rateCard(button.dataset.rating)));
}

function renderResults() {
  const rows = state.mastery.concepts.map((concept) => `
    <li class="concept-row">
      <strong>${escapeHtml(concept.title)}</strong>
      <span>${concept.correctCount}/${concept.requiredCorrect} 正确</span>
      <span class="status">${escapeHtml(concept.status)}</span>
    </li>`).join("");
  const recommendation = state.recommended;
  app.innerHTML = shell(`
    <section class="card study-card">
      <p class="eyebrow">Capability map</p>
      <h2>${escapeHtml(recommendation?.title || state.mastery.status)}</h2>
      <p>${escapeHtml(recommendation?.description || "继续训练以建立稳定掌握度。")}</p>
      <div class="metrics">
        <div class="metric"><strong>${Math.round(state.mastery.overallScore * 100)}%</strong><span>Current mastery</span></div>
        <div class="metric"><strong>${state.mastery.concepts.filter((concept) => concept.status === "Mastered").length}</strong><span>Capabilities mastered</span></div>
        <div class="metric"><strong>${state.mastery.weakConceptIds.length}</strong><span>Capabilities to reinforce</span></div>
      </div>
      <ul class="concept-list">${rows}</ul>
      <div class="actions">
        ${recommendation?.questionIds.length ? `<button class="button primary" data-action="start-recommended">Start ${escapeHtml(recommendation.title)}</button>` : ""}
        <button class="button" data-action="flashcards">Review flashcards</button>
        <button class="button" data-action="home">Back to overview</button>
      </div>
    </section>`);
  bindCommon();
}

function bindCommon() {
  document.querySelector("[data-action='home']")?.addEventListener("click", () => changeScreen("home"));
  document.querySelector("[data-action='results']")?.addEventListener("click", () => changeScreen("results"));
  document.querySelector("[data-action='flashcards']")?.addEventListener("click", () => changeScreen("flashcards"));
  document.querySelector("[data-action='start-recommended']")?.addEventListener("click", startRecommended);
  document.querySelector("[data-action='generate']")?.addEventListener("click", generate);
  document.querySelector("[data-action='reset']")?.addEventListener("click", resetProgress);
}

function startRecommended() {
  queue = state.recommended?.questionIds || [];
  index = 0;
  resetQuestion();
  screen = "quiz";
  render();
}

function changeScreen(next) {
  screen = next;
  index = 0;
  queue = [];
  flipped = false;
  resetQuestion();
  render();
}

async function generate() {
  const response = await fetch("/api/generate", { method: "POST" });
  if (!response.ok) {
    const body = await response.json();
    state.generation = { status: "failed", error: body.error };
  } else {
    state.generation = { status: "generating", error: null };
  }
  render();
}

async function resetProgress() {
  if (!window.confirm("Reset all answers and flashcard ratings for this study set?")) return;
  const response = await fetch("/api/reset", { method: "POST" });
  state = await response.json();
  changeScreen("home");
}

async function rateCard(rating) {
  const card = state.studySet.flashcards[index];
  await postAttempt({ kind: "flashcard", itemId: card.id, rating });
  index += 1;
  flipped = false;
  render();
}

async function submitQuiz(question) {
  if (selectedOption === null) return;
  await postAttempt({ kind: "quiz", itemId: question.id, selectedIndex: selectedOption });
  submitted = true;
  render();
}

async function postAttempt(body) {
  const response = await fetch("/api/attempt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Unable to save progress.");
  }
  state = await response.json();
}

function resetQuestion() {
  selectedOption = null;
  submitted = false;
}

function conceptTitle(conceptId) {
  return state.studySet.concepts.find((concept) => concept.id === conceptId)?.title || conceptId;
}

function stageLabel(stage) {
  return ({ diagnostic: "Foundation diagnostic", practice: "Targeted practice", challenge: "Advanced challenge" })[stage] || stage;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
