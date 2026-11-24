import type { ProgressState } from './types';

const KEY = 'gamecraft-path-progress-v1';

const fresh = (): ProgressState => ({
  version: 1,
  completedLessons: [],
  completedExercises: [],
  notes: {},
  lastLesson: 1,
  updatedAt: new Date().toISOString()
});

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    return validateProgress(JSON.parse(raw));
  } catch {
    return fresh();
  }
}

export function saveProgress(progress: ProgressState): void {
  progress.updatedAt = new Date().toISOString();
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function validateProgress(value: unknown): ProgressState {
  if (!value || typeof value !== 'object') throw new Error('This file does not contain course progress.');
  const item = value as Partial<ProgressState>;
  if (item.version !== 1) throw new Error('This progress format is not supported by this version of the course.');
  if (!Array.isArray(item.completedLessons) || !Array.isArray(item.completedExercises)) {
    throw new Error('The progress file is missing completion data.');
  }
  const notes = Object.fromEntries(
    Object.entries(item.notes && typeof item.notes === 'object' ? item.notes : {})
      .filter(([key, note]) => /^\d+$/.test(key) && typeof note === 'string')
  );
  return {
    version: 1,
    completedLessons: [...new Set(item.completedLessons.filter((id): id is number => Number.isInteger(id) && id >= 1 && id <= 72))],
    completedExercises: [...new Set(item.completedExercises.filter((id): id is string => typeof id === 'string'))],
    notes,
    lastLesson: Number.isInteger(item.lastLesson) && Number(item.lastLesson) >= 1 && Number(item.lastLesson) <= 72 ? Number(item.lastLesson) : 1,
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString()
  };
}

export function exportProgress(progress: ProgressState): void {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `gamecraft-progress-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}
