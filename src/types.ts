export type LessonStatus = 'authored' | 'outline';
export type DemoKind =
  | 'boot'
  | 'scenes'
  | 'coordinates'
  | 'input'
  | 'delta-time'
  | 'sprites'
  | 'animation'
  | 'scene-flow';

export interface CodeExample {
  filename: string;
  language: string;
  source: string;
}

export interface ConceptSection {
  title: string;
  paragraphs: string[];
  code?: CodeExample;
  takeaway?: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  kind: 'guided' | 'challenge' | 'integration';
}

export interface LessonContent {
  lead: string;
  outcomes: string[];
  concept: string[];
  conceptSections?: ConceptSection[];
  code?: CodeExample;
  demo?: { kind: DemoKind; title: string; description: string };
  exercises: Exercise[];
  review: string[];
  resources?: { label: string; url: string; note: string }[];
}

export interface Lesson {
  id: number;
  title: string;
  summary: string;
  duration: string;
  status: LessonStatus;
  content?: LessonContent;
}

export interface Stage {
  id: number;
  title: string;
  project: string;
  range: string;
  accent: string;
  goal: string;
  deliverable: string;
  lessons: Lesson[];
}

export interface ProgressState {
  version: 1;
  completedLessons: number[];
  completedExercises: string[];
  notes: Record<string, string>;
  lastLesson: number;
  updatedAt: string;
}
