'use client';

import { Student, Booking, TimeSlot } from './types';

const STORAGE_KEYS = {
  INSTRUCTOR_AVAILABILITY: 'mlb_instructor_availability',
  STUDENTS: 'mlb_students',
  BOOKINGS: 'mlb_bookings',
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

// Instructor Availability
export function getInstructorAvailability(): TimeSlot[] {
  return getItem<TimeSlot[]>(STORAGE_KEYS.INSTRUCTOR_AVAILABILITY, []);
}

export function setInstructorAvailability(slots: TimeSlot[]): void {
  setItem(STORAGE_KEYS.INSTRUCTOR_AVAILABILITY, slots);
}

// Students
export function getStudents(): Student[] {
  return getItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
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
  // Also delete bookings for this student
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

// Matching
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
