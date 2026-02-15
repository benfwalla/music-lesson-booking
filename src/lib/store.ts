'use client';

import { Student, Booking, TimeSlot, InstructorProfile, MatchResult, Instrument, Announcement, RentalBooking, RentalPricing, Resource, LessonRequest } from './types';

const STORAGE_KEYS = {
  INSTRUCTOR_PROFILE: 'mlb_instructor_profile',
  INSTRUCTORS: 'mlb_instructors',
  STUDENTS: 'mlb_students',
  BOOKINGS: 'mlb_bookings',
  ANNOUNCEMENTS: 'mlb_announcements',
  ADMIN_MODE: 'mlb_admin_mode',
  RENTALS: 'mlb_rentals',
  RESOURCES: 'mlb_resources',
  SEEDED: 'mlb_seeded',
  LESSON_REQUESTS: 'mlb_lesson_requests',
};

const DEFAULT_INSTRUCTOR: InstructorProfile = {
  id: 'default',
  name: '',
  email: '',
  phone: '',
  bio: '',
  instruments: [],
  customInstruments: [],
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

// Admin mode
export function getAdminMode(): boolean {
  return getItem<boolean>(STORAGE_KEYS.ADMIN_MODE, false);
}

export function setAdminMode(val: boolean): void {
  setItem(STORAGE_KEYS.ADMIN_MODE, val);
}

// Multiple Instructors
export function getInstructors(): InstructorProfile[] {
  const instructors = getItem<InstructorProfile[]>(STORAGE_KEYS.INSTRUCTORS, []);
  if (instructors.length > 0) return instructors.map(migrateInstructor);
  // Migrate from single instructor
  const legacy = getItem<InstructorProfile>(STORAGE_KEYS.INSTRUCTOR_PROFILE, DEFAULT_INSTRUCTOR);
  if (legacy && legacy.name) {
    const migrated = migrateInstructor({ ...legacy, id: legacy.id || 'default' });
    setItem(STORAGE_KEYS.INSTRUCTORS, [migrated]);
    return [migrated];
  }
  return [];
}

function migrateInstructor(p: InstructorProfile): InstructorProfile {
  return {
    ...p,
    id: p.id || crypto.randomUUID(),
    email: p.email || '',
    phone: p.phone || '',
    bio: p.bio || '',
    instruments: p.instruments || [],
    customInstruments: p.customInstruments || [],
    skillLevels: p.skillLevels || [],
    lessonDurations: p.lessonDurations || [],
    availability: p.availability || [],
  };
}

export function setInstructors(instructors: InstructorProfile[]): void {
  setItem(STORAGE_KEYS.INSTRUCTORS, instructors);
  // Keep legacy key in sync with first instructor for backward compat
  if (instructors.length > 0) {
    setItem(STORAGE_KEYS.INSTRUCTOR_PROFILE, instructors[0]);
  }
}

export function addInstructor(instructor: InstructorProfile): void {
  const list = getInstructors();
  list.push(instructor);
  setInstructors(list);
}

export function updateInstructor(instructor: InstructorProfile): void {
  const list = getInstructors();
  const idx = list.findIndex(i => i.id === instructor.id);
  if (idx !== -1) {
    list[idx] = instructor;
  } else {
    list.push(instructor);
  }
  setInstructors(list);
}

export function deleteInstructor(id: string): void {
  setInstructors(getInstructors().filter(i => i.id !== id));
}

// Backward compat: single instructor profile
export function getInstructorProfile(): InstructorProfile {
  const instructors = getInstructors();
  if (instructors.length > 0) return instructors[0];
  return { ...DEFAULT_INSTRUCTOR };
}

export function setInstructorProfile(profile: InstructorProfile): void {
  const instructors = getInstructors();
  if (instructors.length > 0) {
    instructors[0] = { ...profile, id: instructors[0].id };
    setInstructors(instructors);
  } else {
    setInstructors([{ ...profile, id: profile.id || 'default' }]);
  }
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
  return students.map(s => ({
    ...s,
    instruments: s.instruments || (s.instrument ? [s.instrument as Instrument] : []),
    customInstruments: s.customInstruments || [],
    skillLevel: s.skillLevel || 'Beginner',
    preferredDuration: s.preferredDuration || 60,
    emergencyContactName: s.emergencyContactName || '',
    emergencyContactPhone: s.emergencyContactPhone || '',
    emergencyContactRelationship: s.emergencyContactRelationship || '',
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

// Announcements
export function getAnnouncements(): Announcement[] {
  return getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
}

export function setAnnouncements(announcements: Announcement[]): void {
  setItem(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
}

export function addAnnouncement(a: Announcement): void {
  const list = getAnnouncements();
  list.push(a);
  setAnnouncements(list);
}

export function updateAnnouncement(a: Announcement): void {
  const list = getAnnouncements();
  const idx = list.findIndex(x => x.id === a.id);
  if (idx !== -1) {
    list[idx] = a;
    setAnnouncements(list);
  }
}

export function deleteAnnouncement(id: string): void {
  setAnnouncements(getAnnouncements().filter(a => a.id !== id));
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
  const instrumentOverlap = student.instruments.filter(i =>
    instructor.instruments.includes(i)
  );
  const instrumentScore = student.instruments.length > 0
    ? Math.round((instrumentOverlap.length / student.instruments.length) * 30)
    : 0;

  const skillLevelMatch = instructor.skillLevels.includes(student.skillLevel);
  const skillScore = skillLevelMatch ? 25 : 0;

  const durationMatch = instructor.lessonDurations.includes(student.preferredDuration);
  const durationScore = durationMatch ? 20 : 0;

  const timeOverlap = findMatchingSlots(instructor.availability, student.availability);
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

// Custom Rental Pricing (admin-adjustable)
const RENTAL_PRICING_KEY = 'mlb_rental_pricing';

export function getCustomRentalPricing(): Record<string, RentalPricing> | null {
  return getItem<Record<string, RentalPricing> | null>(RENTAL_PRICING_KEY, null);
}

export function setCustomRentalPricing(pricing: Record<string, RentalPricing>): void {
  setItem(RENTAL_PRICING_KEY, pricing);
}

// Rentals
export function getRentals(): RentalBooking[] {
  return getItem<RentalBooking[]>(STORAGE_KEYS.RENTALS, []);
}

export function setRentals(rentals: RentalBooking[]): void {
  setItem(STORAGE_KEYS.RENTALS, rentals);
}

export function addRental(rental: RentalBooking): void {
  const list = getRentals();
  list.push(rental);
  setRentals(list);
}

export function updateRental(rental: RentalBooking): void {
  const list = getRentals();
  const idx = list.findIndex(r => r.id === rental.id);
  if (idx !== -1) {
    list[idx] = rental;
    setRentals(list);
  }
}

// Resources
export function getResources(): Resource[] {
  return getItem<Resource[]>(STORAGE_KEYS.RESOURCES, []);
}

export function addResource(r: Resource): void {
  const list = getResources();
  list.push(r);
  setItem(STORAGE_KEYS.RESOURCES, list);
}

export function updateResource(r: Resource): void {
  const list = getResources();
  const idx = list.findIndex(x => x.id === r.id);
  if (idx !== -1) {
    list[idx] = r;
    setItem(STORAGE_KEYS.RESOURCES, list);
  }
}

export function deleteResource(id: string): void {
  setItem(STORAGE_KEYS.RESOURCES, getResources().filter(r => r.id !== id));
}

// Lesson Requests
export function getLessonRequests(): LessonRequest[] {
  return getItem<LessonRequest[]>(STORAGE_KEYS.LESSON_REQUESTS, []);
}

export function addLessonRequest(request: LessonRequest): void {
  const list = getLessonRequests();
  list.push(request);
  setItem(STORAGE_KEYS.LESSON_REQUESTS, list);
}

export function updateLessonRequest(request: LessonRequest): void {
  const list = getLessonRequests();
  const idx = list.findIndex(r => r.id === request.id);
  if (idx !== -1) {
    list[idx] = request;
    setItem(STORAGE_KEYS.LESSON_REQUESTS, list);
  }
}

// Seed instructors
const SEED_INSTRUCTORS: { name: string; instruments: Instrument[] }[] = [
  { name: 'Tim Kloewer', instruments: ['Banjo', 'Cello', 'French Horn', 'Guitar', 'Piano', 'Trombone', 'Trumpet', 'Tuba', 'Ukulele', 'Upright Bass', 'Vocals'] },
  { name: 'Chris Asercion', instruments: ['Clarinet', 'Flute', 'Piano', 'Saxophone'] },
  { name: 'Chad Irish', instruments: ['Drums'] },
  { name: 'Keelan McDorman', instruments: ['Drums', 'Piano'] },
  { name: 'Liam Shea', instruments: ['Drums', 'Guitar', 'Piano', 'Ukulele'] },
  { name: 'Max Turski', instruments: ['Flute'] },
  { name: 'Adam Hernandez', instruments: ['Guitar', 'Ukulele'] },
  { name: 'Brett Kuyper', instruments: ['Guitar', 'Piano', 'Ukulele'] },
  { name: 'Doug Emery', instruments: ['Guitar', 'Piano', 'Ukulele'] },
  { name: 'Elle Reynolds', instruments: ['Guitar', 'Vocals'] },
  { name: 'Elyjah Youngblood', instruments: ['Guitar'] },
  { name: 'Evan Jelley', instruments: ['Guitar', 'Piano', 'Vocals'] },
  { name: 'Gavi Torres-Olivares', instruments: ['Guitar'] },
  { name: 'Ian Cheyne', instruments: ['Guitar'] },
  { name: 'Jordan Cromwell', instruments: ['Guitar', 'Ukulele'] },
  { name: 'Karan Shukla', instruments: ['Guitar'] },
  { name: 'Melissa Getto', instruments: ['Guitar'] },
  { name: 'Stephen Koss', instruments: ['Guitar'] },
  { name: 'Ben Kane', instruments: ['Piano'] },
  { name: 'Leanne Jojola', instruments: ['Piano', 'Ukulele', 'Vocals'] },
  { name: 'Shilpa Ravoory', instruments: ['Piano', 'Viola', 'Violin'] },
  { name: 'Sarah Platt', instruments: ['Viola', 'Violin'] },
  { name: 'Ashleigh Hunniford', instruments: ['Ukulele', 'Vocals'] },
];

export function seedInstructors(): void {
  if (typeof window === 'undefined') return;
  
  // Version the seed so we can re-seed when instructor list changes
  const SEED_VERSION = '2';
  const currentVersion = localStorage.getItem(STORAGE_KEYS.SEEDED);
  if (currentVersion === SEED_VERSION) return;

  const existing = getItem<InstructorProfile[]>(STORAGE_KEYS.INSTRUCTORS, []);
  const existingNames = new Set(existing.map(i => i.name));

  const newInstructors: InstructorProfile[] = SEED_INSTRUCTORS
    .filter(s => !existingNames.has(s.name))
    .map(s => {
      const [first, ...rest] = s.name.split(' ');
      const last = rest.join('.').toLowerCase();
      return {
        id: crypto.randomUUID(),
        name: s.name,
        email: `${first.toLowerCase()}.${last}@elevatedmusic.com`,
        phone: '',
        bio: '',
        instruments: s.instruments,
        customInstruments: [],
        skillLevels: ['Beginner', 'Intermediate', 'Advanced'] as const as any,
        lessonDurations: [30, 60, 90] as const as any,
        availability: [],
      };
    });

  if (newInstructors.length > 0) {
    setInstructors([...existing, ...newInstructors]);
  }

  localStorage.setItem(STORAGE_KEYS.SEEDED, SEED_VERSION);
}
