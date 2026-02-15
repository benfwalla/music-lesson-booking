export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface TimeSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  instrument: string;
  availability: TimeSlot[];
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

export interface InstructorAvailability {
  slots: TimeSlot[];
}
