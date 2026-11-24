# Lesson authoring guide

The curriculum and application are deliberately separated. A syllabus entry becomes a complete lesson by adding a `LessonContent` record in `src/data.ts`; the interface automatically changes its badge from **Syllabus outline** to **Complete authored lesson**.

## Required lesson shape

Every authored lesson follows the same progression:

1. **Concept** — the underlying game-development principle and why it exists
2. **Demonstration** — a small, isolated, inspectable example
3. **Guided exercise** — a bounded extension using only introduced ideas
4. **Independent challenge** — a related problem without supplied implementation
5. **Review gate** — correctness, explanation, edge cases and adaptability
6. **Integration** — apply the idea to the current portfolio game and commit it

Nothing essential should appear in an exercise before it has been introduced. If a lesson depends on an unfamiliar TypeScript feature, data structure, mathematical idea or Phaser API, introduce that dependency first.

## Adding content

1. Add a new entry to the `authored` record in `src/data.ts`, keyed by lesson number.
2. Supply a lead, outcomes, concept paragraphs, exercises and review questions.
3. Use `conceptSections` for deeper explanations, focused code examples and explicit key ideas. Add a full lesson code example only where it clarifies integration; avoid providing the independent solution.
4. If the idea benefits from manipulation, add a focused demo kind to `DemoKind` in `src/types.ts` and implement it in `src/demos.ts`.
5. Run `npm run build` and inspect the lesson at narrow and wide viewport sizes.

## Content quality gate

A lesson is not complete merely because it has prose. Before changing its status, verify that:

- The learner can state what competence they are building.
- The demonstration isolates one main idea.
- The guided work has an observable success condition.
- The independent challenge does not require hidden prerequisites.
- The review includes at least one edge case.
- The integration produces a meaningful project commit.
- Phaser APIs match the pinned version.
- Any external asset has a recorded licence.

## Progress compatibility

Lesson IDs and exercise IDs are persistence keys. Do not reuse or renumber them after release. New fields may be added to lesson content without changing the progress format. If the progress format itself changes, add a migration in `src/storage.ts` and increment the stored version deliberately.
