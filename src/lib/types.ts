export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ALL_INSTRUMENTS = [
  'Piano', 'Guitar', 'Drums', 'Violin', 'Bass', 'Vocals',
  'Saxophone', 'Trumpet', 'Flute', 'Cello', 'Ukulele', 'Clarinet',
] as const;

export type Instrument = typeof ALL_INSTRUMENTS[number];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type SkillLevel = typeof SKILL_LEVELS[number];

export const LESSON_DURATIONS = [30, 60, 90] as const;
export type LessonDuration = typeof LESSON_DURATIONS[number];

export interface TimeSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export interface InstructorProfile {
  name: string;
  instruments: Instrument[];
  skillLevels: SkillLevel[];
  lessonDurations: LessonDuration[];
  availability: TimeSlot[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  instruments: Instrument[];
  skillLevel: SkillLevel;
  preferredDuration: LessonDuration;
  availability: TimeSlot[];
  // legacy compat
  instrument?: string;
}

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  instrument: string;
  recurring: boolean;
  notes: string;
  createdAt: string;
}

export interface MatchResult {
  student: Student;
  score: number;            // 0-100
  instrumentOverlap: Instrument[];
  skillLevelMatch: boolean;
  durationMatch: boolean;
  timeOverlap: TimeSlot[];
  breakdown: {
    instrumentScore: number;   // 0-30
    skillScore: number;        // 0-25
    durationScore: number;     // 0-20
    timeScore: number;         // 0-25
  };
}
