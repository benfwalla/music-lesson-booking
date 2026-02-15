export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ALL_INSTRUMENTS = [
  'Piano', 'Guitar', 'Drums', 'Violin', 'Viola', 'Cello', 'Bass', 'Vocals',
  'Saxophone', 'Trumpet', 'Flute', 'Clarinet', 'Ukulele', 'Banjo',
  'French Horn', 'Trombone', 'Tuba', 'Upright Bass', 'Mandolin',
  'Oboe', 'Bassoon', 'Harp', 'Piccolo', 'Euphonium', 'Other',
] as const;

export type Instrument = typeof ALL_INSTRUMENTS[number];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type SkillLevel = typeof SKILL_LEVELS[number];

export const LESSON_DURATIONS = [30, 60, 90] as const;
export type LessonDuration = typeof LESSON_DURATIONS[number];

export interface TimeSlot {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface InstructorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  instruments: Instrument[];
  customInstruments: string[];
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
  customInstruments?: string[];
  skillLevel: SkillLevel;
  preferredDuration: LessonDuration;
  availability: TimeSlot[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
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

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: 'general' | 'recital';
  recitalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  student: Student;
  score: number;
  instrumentOverlap: Instrument[];
  skillLevelMatch: boolean;
  durationMatch: boolean;
  timeOverlap: TimeSlot[];
  breakdown: {
    instrumentScore: number;
    skillScore: number;
    durationScore: number;
    timeScore: number;
  };
}

// Rental types
export type RentalDuration = 'daily' | 'weekly' | 'monthly' | 'semester';

export type RentalStatus = 'pending' | 'picked_up' | 'returned' | 'cancelled';

export type PickupLocation = 'centennial' | 'golden';

export const PICKUP_LOCATIONS: Record<PickupLocation, string> = {
  centennial: '6955 S York St #418, Centennial, CO',
  golden: '15750 S Golden Rd, Unit G, Golden, CO',
};

export interface RentalCategory {
  name: string;
  instruments: string[];
}

export const RENTAL_CATEGORIES: RentalCategory[] = [
  { name: 'Strings', instruments: ['Guitar', 'Bass', 'Violin', 'Viola', 'Cello', 'Ukulele', 'Mandolin', 'Banjo', 'Harp'] },
  { name: 'Brass', instruments: ['Trumpet', 'Trombone', 'French Horn', 'Tuba', 'Euphonium'] },
  { name: 'Woodwind', instruments: ['Flute', 'Clarinet', 'Saxophone', 'Oboe', 'Bassoon', 'Piccolo'] },
  { name: 'Drums & Percussion', instruments: ['Drum Set', 'Timpani', 'Hand Drums', 'Xylophone', 'Marimba'] },
  { name: 'Keyboards', instruments: ['Piano/Keyboard', 'Synthesizer'] },
  { name: 'Accessories', instruments: ['Amps', 'Effects Pedals', 'Stands', 'Cases'] },
];

export interface RentalPricing {
  daily: number;
  weekly: number;
  monthly: number;
  semester: number;
}

export const RENTAL_PRICING: Record<string, RentalPricing> = {
  // Strings
  'Guitar': { daily: 15, weekly: 50, monthly: 120, semester: 400 },
  'Bass': { daily: 20, weekly: 65, monthly: 160, semester: 500 },
  'Violin': { daily: 15, weekly: 50, monthly: 120, semester: 400 },
  'Viola': { daily: 15, weekly: 50, monthly: 120, semester: 400 },
  'Cello': { daily: 25, weekly: 75, monthly: 200, semester: 600 },
  'Ukulele': { daily: 10, weekly: 35, monthly: 75, semester: 250 },
  'Mandolin': { daily: 12, weekly: 40, monthly: 100, semester: 330 },
  'Banjo': { daily: 15, weekly: 50, monthly: 120, semester: 400 },
  'Harp': { daily: 25, weekly: 75, monthly: 200, semester: 600 },
  // Brass
  'Trumpet': { daily: 15, weekly: 50, monthly: 120, semester: 400 },
  'Trombone': { daily: 15, weekly: 50, monthly: 130, semester: 420 },
  'French Horn': { daily: 20, weekly: 65, monthly: 160, semester: 500 },
  'Tuba': { daily: 25, weekly: 75, monthly: 200, semester: 600 },
  'Euphonium': { daily: 20, weekly: 65, monthly: 160, semester: 500 },
  // Woodwind
  'Flute': { daily: 12, weekly: 40, monthly: 100, semester: 330 },
  'Clarinet': { daily: 12, weekly: 40, monthly: 100, semester: 330 },
  'Saxophone': { daily: 18, weekly: 60, monthly: 150, semester: 480 },
  'Oboe': { daily: 20, weekly: 65, monthly: 170, semester: 540 },
  'Bassoon': { daily: 25, weekly: 75, monthly: 200, semester: 600 },
  'Piccolo': { daily: 12, weekly: 40, monthly: 100, semester: 330 },
  // Drums & Percussion
  'Drum Set': { daily: 25, weekly: 75, monthly: 200, semester: 600 },
  'Timpani': { daily: 25, weekly: 75, monthly: 200, semester: 600 },
  'Hand Drums': { daily: 10, weekly: 35, monthly: 75, semester: 250 },
  'Xylophone': { daily: 20, weekly: 60, monthly: 150, semester: 480 },
  'Marimba': { daily: 25, weekly: 75, monthly: 200, semester: 600 },
  // Keyboards
  'Piano/Keyboard': { daily: 20, weekly: 65, monthly: 160, semester: 500 },
  'Synthesizer': { daily: 20, weekly: 65, monthly: 160, semester: 500 },
  // Accessories
  'Amps': { daily: 15, weekly: 45, monthly: 100, semester: 300 },
  'Effects Pedals': { daily: 10, weekly: 35, monthly: 75, semester: 250 },
  'Stands': { daily: 10, weekly: 35, monthly: 75, semester: 250 },
  'Cases': { daily: 10, weekly: 35, monthly: 75, semester: 250 },
};

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'image' | 'text';
  data: string;
  fileName?: string;
  mimeType?: string;
  uploadedBy: string;
  uploadedByName: string;
  assignedTo: string[];
  instrument?: string;
  createdAt: string;
}

export interface RentalBooking {
  id: string;
  confirmationCode: string;
  instrument: string;
  category: string;
  duration: RentalDuration;
  startDate: string;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  isStudent: boolean;
  pickupLocation: PickupLocation;
  price: number;
  status: RentalStatus;
  createdAt: string;
}
