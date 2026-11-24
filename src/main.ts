import './style.css';
import { allLessons, lessonById, stageForLesson, stages } from './data';
import { mountDemo } from './demos';
import { exportProgress, loadProgress, saveProgress, validateProgress } from './storage';
import type { Lesson, ProgressState } from './types';

let progress: ProgressState = loadProgress();
let demoCleanup: (() => void) | undefined;
let searchTerm = '';

const app = document.querySelector<HTMLDivElement>('#app')!;

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char] ?? char));

const lessonNumber = (id: number): string => String(id).padStart(2, '0');
const percent = (): number => Math.round((progress.completedLessons.length / allLessons.length) * 100);

function shell(): void {
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#home" aria-label="Gamecraft Path home">
        <span class="brand-mark">G</span>
        <span><strong>GAMECRAFT</strong><small>PHASER · TYPESCRIPT · SYSTEMS</small></span>
      </a>
      <div class="top-actions">
        <button class="icon-button mobile-nav" data-action="toggle-nav" aria-label="Open course navigation">☰</button>
        <button class="utility" data-action="import">Import</button>
        <button class="utility" data-action="export">Export</button>
        <a class="progress-chip" href="#home" aria-label="View overall progress">
          <span class="progress-mini" style="--progress:${percent() * 3.6}deg"><b>${percent()}%</b></span>
          <span>${progress.completedLessons.length}<small>/ 72 lessons</small></span>
        </a>
      </div>
    </header>
    <div class="workspace">
      <aside class="sidebar" aria-label="Course navigation">
        <div class="sidebar-head">
          <label class="search"><span>⌕</span><input type="search" placeholder="Find a lesson…" value="${escapeHtml(searchTerm)}" aria-label="Find a lesson"></label>
          <div class="legend"><span><i class="dot authored"></i> Authored</span><span><i class="dot outline"></i> Outline</span></div>
        </div>
        <nav class="course-nav">${renderNavigation()}</nav>
        <div class="offline-note"><span>◉</span><div><strong>Local-first</strong><small>Progress stays on this device</small></div></div>
      </aside>
      <main id="content" tabindex="-1"></main>
    </div>
    <input class="visually-hidden" id="progress-file" type="file" accept="application/json,.json">
    <div class="toast" role="status" aria-live="polite"></div>`;
  wireShell();
  renderRoute();
}

function renderNavigation(): string {
  return stages.map((stage) => {
    const matches = stage.lessons.filter((lesson) => `${lesson.title} ${lesson.summary}`.toLowerCase().includes(searchTerm.toLowerCase()));
    if (searchTerm && !matches.length) return '';
    const done = stage.lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length;
    return `<section class="nav-stage">
      <div class="nav-stage-title"><span>STAGE ${stage.id}</span><span>${done}/${stage.lessons.length}</span></div>
      <a class="nav-stage-name" href="#stage-${stage.id}">${stage.title}<small>${stage.project}</small></a>
      <div class="nav-lessons">
        ${matches.map((lesson) => `<a href="#lesson-${lesson.id}" data-lesson-link="${lesson.id}">
          <span class="lesson-state ${progress.completedLessons.includes(lesson.id) ? 'done' : lesson.status}" aria-hidden="true">${progress.completedLessons.includes(lesson.id) ? '✓' : lesson.status === 'authored' ? '◆' : '·'}</span>
          <span><small>${lessonNumber(lesson.id)}</small>${lesson.title}</span>
        </a>`).join('')}
      </div>
    </section>`;
  }).join('');
}

function wireShell(): void {
  app.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'toggle-nav') document.querySelector('.sidebar')?.classList.toggle('open');
    if (action === 'export') { exportProgress(progress); toast('Progress exported'); }
    if (action === 'import') document.querySelector<HTMLInputElement>('#progress-file')?.click();
    if (action === 'complete-lesson') toggleLesson(Number(target.dataset.lesson));
    if (action === 'toggle-exercise') toggleExercise(String(target.dataset.exercise));
    if (action === 'copy-code') copyCode(target);
  });

  document.querySelector<HTMLInputElement>('.search')?.addEventListener('input', (event) => {
    searchTerm = (event.target as HTMLInputElement).value;
    const nav = document.querySelector<HTMLElement>('.course-nav');
    if (nav) nav.innerHTML = renderNavigation();
  });

  document.querySelector<HTMLInputElement>('#progress-file')?.addEventListener('change', async (event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      progress = validateProgress(JSON.parse(await file.text()));
      saveProgress(progress);
      shell();
      toast('Progress imported successfully');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not import progress', true);
    } finally { input.value = ''; }
  });
}

function renderRoute(): void {
  demoCleanup?.();
  demoCleanup = undefined;
  document.querySelector('.sidebar')?.classList.remove('open');
  const hash = location.hash || '#home';
  const lessonMatch = hash.match(/^#lesson-(\d+)$/);
  const stageMatch = hash.match(/^#stage-(\d+)$/);
  if (lessonMatch) renderLesson(lessonById(Number(lessonMatch[1])));
  else if (stageMatch) renderStage(Number(stageMatch[1]));
  else renderDashboard();
  updateActiveNav();
  document.querySelector<HTMLElement>('#content')?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderDashboard(): void {
  const content = document.querySelector<HTMLElement>('#content')!;
  const resume = lessonById(progress.lastLesson);
  const authoredTotal = allLessons.filter((lesson) => lesson.status === 'authored').length;
  const authoredDone = allLessons.filter((lesson) => lesson.status === 'authored' && progress.completedLessons.includes(lesson.id)).length;
  content.innerHTML = `
    <div class="dashboard page">
      <section class="hero">
        <div class="eyebrow">YOUR CAMPAIGN</div>
        <h1>Learn to build<br><em>game systems.</em></h1>
        <p>From your first Phaser scene to a professional capstone. Build four portfolio games, practise the engineering behind them, and progress by competence—not a calendar.</p>
        <div class="hero-actions">
          <a class="primary-button" href="#lesson-${resume.id}">Continue · Lesson ${lessonNumber(resume.id)} <span>→</span></a>
          <a class="text-button" href="#stage-0">View learning path</a>
        </div>
        <div class="hero-grid" aria-hidden="true"></div>
        <div class="pixel-party" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      </section>
      <section class="dashboard-stats" aria-label="Course statistics">
        <div><strong>${percent()}%</strong><span>overall progress</span></div>
        <div><strong>${authoredDone}<small>/${authoredTotal}</small></strong><span>authored lessons complete</span></div>
        <div><strong>4</strong><span>portfolio games</span></div>
        <div><strong>6</strong><span>competency stages</span></div>
      </section>
      <section class="path-section">
        <div class="section-heading"><div><span class="eyebrow">THE LEARNING PATH</span><h2>Six stages. Increasing independence.</h2></div><p>Lessons 01–08 complete the authored Foundations stage. Later lessons remain clearly marked syllabus outlines ready for expansion.</p></div>
        <div class="stage-grid">${stages.map(renderStageCard).join('')}</div>
      </section>
      <section class="principles">
        <div><span>01</span><h3>Understand first</h3><p>Each lesson starts with the game-development principle and the reason it exists.</p></div>
        <div><span>02</span><h3>Build deliberately</h3><p>Demonstrations become guided exercises, then independent challenges.</p></div>
        <div><span>03</span><h3>Prove the skill</h3><p>Reviews test correctness, explanation, edge cases and adaptability.</p></div>
      </section>
    </div>`;
}

function renderStageCard(stage: (typeof stages)[number]): string {
  const done = stage.lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length;
  const first = stage.lessons[0];
  return `<a class="stage-card" href="#stage-${stage.id}" style="--accent:${stage.accent}">
    <div class="stage-card-top"><span>0${stage.id}</span><span>${stage.range}</span></div>
    <div class="stage-icon" aria-hidden="true">${['✦','◈','⌁','▦','♜','▲'][stage.id]}</div>
    <h3>${stage.title}</h3><p>${stage.goal}</p>
    <div class="stage-progress"><i style="width:${Math.round(done / stage.lessons.length * 100)}%"></i></div>
    <div class="stage-card-foot"><span>${done}/${stage.lessons.length} complete</span><span>Explore →</span></div>
    <span class="visually-hidden">First lesson: ${first.title}</span>
  </a>`;
}

function renderStage(stageId: number): void {
  const stage = stages[stageId] ?? stages[0];
  const content = document.querySelector<HTMLElement>('#content')!;
  const done = stage.lessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length;
  content.innerHTML = `<article class="stage-page page" style="--accent:${stage.accent}">
    <a class="back-link" href="#home">← Course overview</a>
    <header class="stage-hero">
      <div><span class="eyebrow">STAGE ${stage.id} · ${stage.project}</span><h1>${stage.title}</h1><p>${stage.goal}</p></div>
      <div class="stage-score"><strong>${done}<small>/${stage.lessons.length}</small></strong><span>lessons complete</span><i><b style="width:${done / stage.lessons.length * 100}%"></b></i></div>
    </header>
    <section class="deliverable"><span>PORTFOLIO DELIVERABLE</span><p>${stage.deliverable}</p></section>
    <section class="lesson-cards">
      ${stage.lessons.map((lesson) => `<a href="#lesson-${lesson.id}" class="lesson-card ${progress.completedLessons.includes(lesson.id) ? 'complete' : ''}">
        <span class="lesson-card-number">${lessonNumber(lesson.id)}</span>
        <div><span class="status-tag ${lesson.status}">${lesson.status === 'authored' ? 'Full lesson' : 'Syllabus outline'}</span><h2>${lesson.title}</h2><p>${lesson.summary}</p></div>
        <span class="lesson-card-arrow">${progress.completedLessons.includes(lesson.id) ? '✓' : '→'}</span>
      </a>`).join('')}
    </section>
  </article>`;
}

function renderLesson(lesson: Lesson): void {
  progress.lastLesson = lesson.id;
  saveProgress(progress);
  const stage = stageForLesson(lesson.id);
  const content = document.querySelector<HTMLElement>('#content')!;
  const isComplete = progress.completedLessons.includes(lesson.id);
  const previous = lesson.id > 1 ? lesson.id - 1 : undefined;
  const next = lesson.id < 72 ? lesson.id + 1 : undefined;
  content.innerHTML = `<article class="lesson-page page" style="--accent:${stage.accent}">
    <div class="lesson-toolbar"><a class="back-link" href="#stage-${stage.id}">← Stage ${stage.id}: ${stage.title}</a><span>${lesson.duration}</span></div>
    <header class="lesson-header">
      <div class="lesson-kicker"><span>LESSON ${lessonNumber(lesson.id)}</span><span class="status-tag ${lesson.status}">${lesson.status === 'authored' ? 'Complete authored lesson' : 'Syllabus outline'}</span></div>
      <h1>${lesson.title}</h1>
      <p>${lesson.content?.lead ?? lesson.summary}</p>
      <button class="complete-button ${isComplete ? 'is-complete' : ''}" data-action="complete-lesson" data-lesson="${lesson.id}"><span>${isComplete ? '✓' : ''}</span>${isComplete ? 'Lesson complete' : 'Mark lesson complete'}</button>
    </header>
    ${lesson.content ? renderAuthoredLesson(lesson) : renderOutlineLesson(lesson)}
    ${renderNotes(lesson)}
    <nav class="lesson-pager">
      ${previous ? `<a href="#lesson-${previous}"><span>← Previous</span><strong>${lessonById(previous).title}</strong></a>` : '<span></span>'}
      ${next ? `<a href="#lesson-${next}" class="next"><span>Next →</span><strong>${lessonById(next).title}</strong></a>` : ''}
    </nav>
  </article>`;
  wireLesson(lesson);
}

function renderAuthoredLesson(lesson: Lesson): string {
  const data = lesson.content!;
  return `<div class="lesson-body">
    <aside class="on-this-page"><span>IN THIS LESSON</span><a href="#outcomes">Outcomes</a><a href="#concept">Concept</a>${data.demo ? '<a href="#demo">Demonstration</a>' : ''}<a href="#practice">Practice</a><a href="#review">Review</a></aside>
    <div class="lesson-content">
      <section id="outcomes" class="outcomes"><span class="section-label">LEARNING OUTCOMES</span><ul>${data.outcomes.map((item) => `<li><i>✓</i>${item}</li>`).join('')}</ul></section>
      <section id="concept"><span class="section-label">01 · CONCEPT</span><h2>Build the mental model</h2>${data.concept.map((paragraph) => `<p>${paragraph}</p>`).join('')}${data.conceptSections ? `<div class="concept-deep-dives">${data.conceptSections.map((section, index) => `<article class="concept-deep-dive"><span class="concept-index">${String(index + 1).padStart(2, '0')}</span><h3>${section.title}</h3>${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}${section.code ? renderCodeExample(section.code, true) : ''}${section.takeaway ? `<div class="takeaway"><strong>KEY IDEA</strong><span>${section.takeaway}</span></div>` : ''}</article>`).join('')}</div>` : ''}</section>
      ${data.code ? renderCodeExample(data.code) : ''}
      ${data.demo ? `<section id="demo"><span class="section-label">02 · INTERACTIVE DEMONSTRATION</span><h2>${data.demo.title}</h2><p>${data.demo.description}</p><div class="demo-host" data-demo="${data.demo.kind}"><div class="demo-loading">Loading Phaser demo…</div></div></section>` : ''}
      <section id="practice"><span class="section-label">03 · PRACTICE</span><h2>From guidance to independence</h2><div class="exercise-list">${data.exercises.map((exercise) => {
        const checked = progress.completedExercises.includes(exercise.id);
        return `<article class="exercise ${checked ? 'done' : ''}"><button data-action="toggle-exercise" data-exercise="${exercise.id}" aria-label="${checked ? 'Reopen' : 'Complete'} ${escapeHtml(exercise.title)}">${checked ? '✓' : ''}</button><div><span>${exercise.kind}</span><h3>${exercise.title}</h3><p>${exercise.description}</p></div></article>`;
      }).join('')}</div></section>
      <section id="review" class="review"><span class="section-label">04 · REVIEW GATE</span><h2>Before you move on</h2><ul>${data.review.map((item) => `<li>${item}</li>`).join('')}</ul></section>
      ${data.resources ? `<section class="resources"><span class="section-label">OFFICIAL RESOURCES</span>${data.resources.map((item) => `<a href="${item.url}" target="_blank" rel="noreferrer"><strong>${item.label} ↗</strong><span>${item.note}</span></a>`).join('')}</section>` : ''}
    </div>
  </div>`;
}

function renderOutlineLesson(lesson: Lesson): string {
  const stage = stageForLesson(lesson.id);
  return `<div class="outline-body">
    <section class="outline-warning"><div>OUTLINE</div><div><h2>This is the syllabus, not a finished tutorial.</h2><p>It establishes the lesson’s place, intent and portfolio contribution. Explanations, code, demonstrations and assessed exercises have not yet been authored—so it will never masquerade as complete course material.</p></div></section>
    <div class="outline-grid">
      <section><span class="section-label">WHY IT MATTERS</span><h2>${lesson.title}</h2><p>${lesson.summary} This work supports the stage goal: ${stage.goal.toLowerCase()}</p></section>
      <section><span class="section-label">PLANNED STRUCTURE</span><ul><li>Concept and dependency check</li><li>Isolated Phaser demonstration</li><li>Guided implementation</li><li>Independent variation</li><li>Review gate and project integration</li></ul></section>
    </div>
    <section class="expansion-card"><span>EXPANSION CONTRACT</span><p>When authored, this lesson will use the same six-part structure as Lessons 01–08 and introduce every prerequisite before it appears in an exercise.</p></section>
  </div>`;
}

function renderCodeExample(
  example: { filename: string; source: string },
  compact = false
): string {
  return `<section class="code-section ${compact ? 'compact' : ''}"><div class="code-head"><span>${example.filename}</span><button data-action="copy-code">Copy code</button></div><pre><code>${escapeHtml(example.source)}</code></pre></section>`;
}

function renderNotes(lesson: Lesson): string {
  return `<section class="notes"><div><span class="section-label">YOUR FIELD NOTES</span><h2>Record what you learned</h2><p>Saved automatically on this device and included in progress exports.</p></div><textarea data-notes="${lesson.id}" rows="6" placeholder="Decisions, questions, test results, things to revisit…">${escapeHtml(progress.notes[String(lesson.id)] ?? '')}</textarea><small class="save-state">Ready</small></section>`;
}

function wireLesson(lesson: Lesson): void {
  const notes = document.querySelector<HTMLTextAreaElement>('[data-notes]');
  let saveTimer = 0;
  notes?.addEventListener('input', () => {
    const status = document.querySelector<HTMLElement>('.save-state');
    if (status) status.textContent = 'Saving…';
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      progress.notes[String(lesson.id)] = notes.value;
      saveProgress(progress);
      if (status) status.textContent = 'Saved locally';
    }, 350);
  });
  const demo = document.querySelector<HTMLElement>('[data-demo]');
  if (demo && lesson.content?.demo) demoCleanup = mountDemo(lesson.content.demo.kind, demo);
}

function toggleLesson(id: number): void {
  progress.completedLessons = progress.completedLessons.includes(id)
    ? progress.completedLessons.filter((item) => item !== id)
    : [...progress.completedLessons, id].sort((a, b) => a - b);
  saveProgress(progress);
  shell();
  toast(progress.completedLessons.includes(id) ? `Lesson ${lessonNumber(id)} complete` : `Lesson ${lessonNumber(id)} reopened`);
}

function toggleExercise(id: string): void {
  progress.completedExercises = progress.completedExercises.includes(id)
    ? progress.completedExercises.filter((item) => item !== id)
    : [...progress.completedExercises, id];
  saveProgress(progress);
  const current = Number(location.hash.match(/lesson-(\d+)/)?.[1] ?? 1);
  renderLesson(lessonById(current));
}

async function copyCode(button: HTMLElement): Promise<void> {
  const code = button.closest('.code-section')?.querySelector('code')?.textContent;
  if (!code) return;
  await navigator.clipboard.writeText(code);
  button.textContent = 'Copied';
  window.setTimeout(() => { button.textContent = 'Copy code'; }, 1200);
}

function updateActiveNav(): void {
  const id = location.hash.match(/lesson-(\d+)/)?.[1];
  document.querySelectorAll('[data-lesson-link]').forEach((link) => link.classList.toggle('active', (link as HTMLElement).dataset.lessonLink === id));
}

function toast(message: string, error = false): void {
  const element = document.querySelector<HTMLElement>('.toast');
  if (!element) return;
  element.textContent = message;
  element.className = `toast show ${error ? 'error' : ''}`;
  window.setTimeout(() => { element.className = 'toast'; }, 2600);
}

window.addEventListener('hashchange', renderRoute);
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    document.querySelector<HTMLInputElement>('.search input')?.focus();
  }
});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

shell();
