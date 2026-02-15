'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getStudents, getInstructorAvailability, getBookings, addBooking, findMatchingSlots } from '@/lib/store';
import { Student, TimeSlot, Booking, DAYS_OF_WEEK } from '@/lib/types';
import { Calendar, Check, AlertCircle } from 'lucide-react';

export default function SchedulePage() {
  const [students, setStudentsList] = useState<Student[]>([]);
  const [instructorSlots, setInstructorSlots] = useState<TimeSlot[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [matchedSlots, setMatchedSlots] = useState<TimeSlot[]>([]);
  const [bookingNotes, setBookingNotes] = useState('');
  const [recurring, setRecurring] = useState(true);
  const [booked, setBooked] = useState<string | null>(null);

  useEffect(() => {
    setStudentsList(getStudents());
    setInstructorSlots(getInstructorAvailability());
  }, []);

  useEffect(() => {
    if (!selectedStudentId) {
      setMatchedSlots([]);
      return;
    }
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;
    const matches = findMatchingSlots(instructorSlots, student.availability);
    
    // Filter out already booked slots
    const bookings = getBookings();
    const available = matches.filter(match => {
      return !bookings.some(b =>
        b.day === match.day &&
        b.startTime < match.endTime &&
        b.endTime > match.startTime
      );
    });
    setMatchedSlots(available);
  }, [selectedStudentId, students, instructorSlots]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleBook = (slot: TimeSlot) => {
    if (!selectedStudent) return;
    const booking: Booking = {
      id: crypto.randomUUID(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      instrument: selectedStudent.instrument,
      recurring,
      notes: bookingNotes,
      createdAt: new Date().toISOString(),
    };
    addBooking(booking);
    setBooked(slot.id);
    setBookingNotes('');
    setTimeout(() => setBooked(null), 2000);
    
    // Refresh matched slots
    const matches = findMatchingSlots(instructorSlots, selectedStudent.availability);
    const bookings = getBookings();
    setMatchedSlots(matches.filter(match =>
      !bookings.some(b =>
        b.day === match.day &&
        b.startTime < match.endTime &&
        b.endTime > match.startTime
      )
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          Schedule
        </h1>
        <p className="text-muted-foreground mt-1">Find matching availability and book lessons</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Student</CardTitle>
          <CardDescription>Choose a student to see matching time slots</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-muted-foreground text-sm">No students added yet. <a href="/students" className="text-primary underline">Add students first</a>.</p>
          ) : (
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="flex h-10 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            >
              <option value="">Choose a student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} {s.instrument ? `(${s.instrument})` : ''}</option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Matching Slots for {selectedStudent.name}</CardTitle>
            <CardDescription>
              Overlapping availability between you and the student
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instructorSlots.length === 0 ? (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Set your <a href="/availability" className="underline">availability</a> first.</span>
              </div>
            ) : selectedStudent.availability.length === 0 ? (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">This student has no availability set. <a href="/students" className="underline">Edit their profile</a>.</span>
              </div>
            ) : matchedSlots.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">No matching time slots found.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={recurring}
                      onChange={e => setRecurring(e.target.checked)}
                      className="rounded"
                    />
                    Recurring weekly
                  </label>
                  <div className="flex-1 max-w-sm">
                    <Input
                      placeholder="Notes (optional)"
                      value={bookingNotes}
                      onChange={e => setBookingNotes(e.target.value)}
                    />
                  </div>
                </div>

                {DAYS_OF_WEEK.map(day => {
                  const daySlots = matchedSlots.filter(s => s.day === day);
                  if (daySlots.length === 0) return null;
                  return (
                    <div key={day}>
                      <h4 className="font-medium text-sm mb-2">{day}</h4>
                      <div className="grid gap-2">
                        {daySlots.map(slot => (
                          <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg border hover:border-primary transition-colors">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{slot.startTime} – {slot.endTime}</Badge>
                            </div>
                            {booked === slot.id ? (
                              <Badge className="bg-green-600"><Check className="h-3 w-3 mr-1" /> Booked!</Badge>
                            ) : (
                              <Button size="sm" onClick={() => handleBook(slot)}>Book</Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
