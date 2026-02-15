'use client';

import { Student, Booking, TimeSlot, InstructorProfile, MatchResult, Instrument } from './types';

const STORAGE_KEYS = {
  INSTRUCTOR_PROFILE: 'mlb_instructor_profile',
  STUDENTS: 'mlb_students',
  BOOKINGS: 'mlb_bookings',
};

const DEFAULT_INSTRUCTOR: InstructorProfile = {
  name: '',
  instruments: [],
  skillLevels: [],
  lessonDurations: [],
  availability: [],
};

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Instructor Profile
export function getInstructorProfile(): InstructorProfile {
  // Migrate from old availability-only format
  const profile = getItem<InstructorProfile>(STORAGE_KEYS.INSTRUCTOR_PROFILE, DEFAULT_INSTRUCTOR);
  if (!profile.instruments) profile.instruments = [];
  if (!profile.skillLevels) profile.skillLevels = [];
  if (!profile.lessonDurations) profile.lessonDurations = [];
  if (!profile.availability) profile.availability = [];
  return profile;
}

export function setInstructorProfile(profile: InstructorProfile): void {
  setItem(STORAGE_KEYS.INSTRUCTOR_PROFILE, profile);
}

// Legacy compat
export function getInstructorAvailability(): TimeSlot[] {
  return getInstructorProfile().availability;
}

export function setInstructorAvailability(slots: TimeSlot[]): void {
  const profile = getInstructorProfile();
  profile.availability = slots;
  setInstructorProfile(profile);
}

// Students
export function getStudents(): Student[] {
  const students = getItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
  // Migrate old format
  return students.map(s => ({
    ...s,
    instruments: s.instruments || (s.instrument ? [s.instrument as Instrument] : []),
    skillLevel: s.skillLevel || 'Beginner',
    preferredDuration: s.preferredDuration || 60,
  }));
}

export function setStudents(students: Student[]): void {
  setItem(STORAGE_KEYS.STUDENTS, students);
}

export function addStudent(student: Student): void {
  const students = getStudents();
  students.push(student);
  setStudents(students);
}

export function updateStudent(student: Student): void {
  const students = getStudents();
  const index = students.findIndex(s => s.id === student.id);
  if (index !== -1) {
    students[index] = student;
    setStudents(students);
  }
}

export function deleteStudent(id: string): void {
  const students = getStudents().filter(s => s.id !== id);
  setStudents(students);
  const bookings = getBookings().filter(b => b.studentId !== id);
  setBookings(bookings);
}

// Bookings
export function getBookings(): Booking[] {
  return getItem<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
}

export function setBookings(bookings: Booking[]): void {
  setItem(STORAGE_KEYS.BOOKINGS, bookings);
}

export function addBooking(booking: Booking): void {
  const bookings = getBookings();
  bookings.push(booking);
  setBookings(bookings);
}

export function deleteBooking(id: string): void {
  const bookings = getBookings().filter(b => b.id !== id);
  setBookings(bookings);
}

// Time overlap
export function findMatchingSlots(instructorSlots: TimeSlot[], studentSlots: TimeSlot[]): TimeSlot[] {
  const matches: TimeSlot[] = [];
  for (const iSlot of instructorSlots) {
    for (const sSlot of studentSlots) {
      if (iSlot.day !== sSlot.day) continue;
      const overlapStart = iSlot.startTime > sSlot.startTime ? iSlot.startTime : sSlot.startTime;
      const overlapEnd = iSlot.endTime < sSlot.endTime ? iSlot.endTime : sSlot.endTime;
      if (overlapStart < overlapEnd) {
        matches.push({
          id: `match-${iSlot.id}-${sSlot.id}`,
          day: iSlot.day,
          startTime: overlapStart,
          endTime: overlapEnd,
        });
      }
    }
  }
  return matches;
}

// Profile Matching
export function computeMatch(instructor: InstructorProfile, student: Student): MatchResult {
  // 1. Instrument overlap (0-30)
  const instrumentOverlap = student.instruments.filter(i =>
    instructor.instruments.includes(i)
  );
  const instrumentScore = student.instruments.length > 0
    ? Math.round((instrumentOverlap.length / student.instruments.length) * 30)
    : 0;

  // 2. Skill level (0-25)
  const skillLevelMatch = instructor.skillLevels.includes(student.skillLevel);
  const skillScore = skillLevelMatch ? 25 : 0;

  // 3. Duration (0-20)
  const durationMatch = instructor.lessonDurations.includes(student.preferredDuration);
  const durationScore = durationMatch ? 20 : 0;

  // 4. Time overlap (0-25)
  const timeOverlap = findMatchingSlots(instructor.availability, student.availability);
  // Score based on number of overlapping slots (cap at 5+ = full marks)
  const timeScore = Math.min(timeOverlap.length * 5, 25);

  const score = instrumentScore + skillScore + durationScore + timeScore;

  return {
    student,
    score,
    instrumentOverlap,
    skillLevelMatch,
    durationMatch,
    timeOverlap,
    breakdown: {
      instrumentScore,
      skillScore,
      durationScore,
      timeScore,
    },
  };
}

export function computeAllMatches(): MatchResult[] {
  const instructor = getInstructorProfile();
  const students = getStudents();
  return students
    .map(s => computeMatch(instructor, s))
    .sort((a, b) => b.score - a.score);
}
