'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getInstructors, addLessonRequest } from '@/lib/store';
import { InstructorProfile, DAYS_OF_WEEK, LessonRequest } from '@/lib/types';
import { UserCheck, GraduationCap, Timer, Clock, Mail, Phone, Send, CheckCircle2 } from 'lucide-react';

const AVATAR_GRADIENTS = [
  'from-amber-500 to-yellow-600',
  'from-yellow-600 to-orange-500',
  'from-orange-400 to-amber-600',
  'from-amber-600 to-yellow-500',
  'from-yellow-500 to-amber-400',
  'from-orange-500 to-yellow-600',
  'from-amber-400 to-orange-500',
  'from-yellow-700 to-amber-500',
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function InstructorAvatar({ instructor, size = 'md' }: { instructor: InstructorProfile; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'h-10 w-10 text-sm', md: 'h-14 w-14 text-lg', lg: 'h-20 w-20 text-2xl' };
  const gradient = AVATAR_GRADIENTS[hashName(instructor.name) % AVATAR_GRADIENTS.length];

  if (instructor.photoUrl) {
    return (
      <img
        src={instructor.photoUrl}
        alt={instructor.name}
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0 ring-2 ring-primary/30`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 font-bold text-white shadow-lg ring-2 ring-primary/20`}>
      {getInitials(instructor.name)}
    </div>
  );
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [bookingInstructor, setBookingInstructor] = useState<InstructorProfile | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedPhone, setSubmittedPhone] = useState('');

  // Form state
  const [instrument, setInstrument] = useState('');
  const [duration, setDuration] = useState(60);
  const [preferredDay, setPreferredDay] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setInstructors(getInstructors());
  }, []);

  function resetForm() {
    setInstrument(''); setDuration(60); setPreferredDay(''); setPreferredTime('');
    setStudentName(''); setStudentEmail(''); setStudentPhone(''); setNotes('');
  }

  function handleSubmit() {
    if (!bookingInstructor || !instrument || !preferredDay || !preferredTime || !studentName || !studentEmail || !studentPhone) return;
    const request: LessonRequest = {
      id: crypto.randomUUID(),
      studentName, studentEmail, studentPhone,
      instructorId: bookingInstructor.id,
      instructorName: bookingInstructor.name,
      instrument, preferredDuration: duration, preferredDay, preferredTime,
      notes, status: 'pending',
      createdAt: new Date().toISOString(),
    };
    addLessonRequest(request);
    setSubmittedPhone(studentPhone);
    setBookingInstructor(null);
    resetForm();
    setShowConfirmation(true);
  }

  const bookingInstruments = bookingInstructor
    ? [...bookingInstructor.instruments.filter(i => i !== 'Other'), ...bookingInstructor.customInstruments]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 page-title">
          <UserCheck className="h-8 w-8 text-primary" />
          Instructor Directory
        </h1>
        <p className="text-muted-foreground mt-1">Connect with our instructors and explore their specialties</p>
      </div>

      {instructors.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No instructors yet</h3>
            <p className="text-muted-foreground">Instructor profiles will appear here once added</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {instructors.map(instructor => {
            const allInstruments = [
              ...instructor.instruments.filter(i => i !== 'Other'),
              ...instructor.customInstruments,
            ];
            return (
              <Card key={instructor.id} className="overflow-hidden interactive-card">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <InstructorAvatar instructor={instructor} />
                    <div className="min-w-0">
                      <CardTitle className="text-xl">{instructor.name}</CardTitle>
                      {instructor.bio && (
                        <CardDescription className="mt-1">{instructor.bio}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {allInstruments.map(i => (
                      <Badge key={i} variant="secondary" className="text-sm">{i}</Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {instructor.skillLevels.length > 0 && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {instructor.skillLevels.join(', ')}
                      </span>
                    )}
                    {instructor.lessonDurations.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" />
                        {instructor.lessonDurations.map(d => `${d}min`).join(', ')}
                      </span>
                    )}
                    {instructor.availability.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {instructor.availability.length} time slot{instructor.availability.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {(instructor.email || instructor.phone) && (
                    <div className="border-t border-border/50 pt-3 flex flex-wrap gap-4 text-sm">
                      {instructor.email && (
                        <a href={`mailto:${instructor.email}`} className="flex items-center gap-1.5 text-primary hover:underline">
                          <Mail className="h-4 w-4" /> {instructor.email}
                        </a>
                      )}
                      {instructor.phone && (
                        <a href={`tel:${instructor.phone}`} className="flex items-center gap-1.5 text-primary hover:underline">
                          <Phone className="h-4 w-4" /> {instructor.phone}
                        </a>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => { setBookingInstructor(instructor); setInstrument(allInstruments[0] || ''); }}
                    className="w-full mt-2"
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-1.5" />
                    Request Lesson
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Booking Request Modal */}
      <Dialog open={!!bookingInstructor} onOpenChange={open => { if (!open) { setBookingInstructor(null); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {bookingInstructor && <InstructorAvatar instructor={bookingInstructor} size="sm" />}
              Request a Lesson with {bookingInstructor?.name}
            </DialogTitle>
            <DialogDescription>
              Fill out the form below and an administrator will contact you to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Instrument</Label>
                <select className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" value={instrument} onChange={e => setInstrument(e.target.value)}>
                  {bookingInstruments.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <Label>Duration</Label>
                <select className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" value={duration} onChange={e => setDuration(Number(e.target.value))}>
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preferred Day</Label>
                <select className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" value={preferredDay} onChange={e => setPreferredDay(e.target.value)}>
                  <option value="">Select day...</option>
                  {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label>Preferred Time</Label>
                <Input type="time" value={preferredTime} onChange={e => setPreferredTime(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Your Name</Label><Input value={studentName} onChange={e => setStudentName(e.target.value)} className="mt-1" placeholder="Full name" /></div>
              <div><Label>Phone Number</Label><Input type="tel" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} className="mt-1" placeholder="(555) 123-4567" /></div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} className="mt-1" placeholder="your@email.com" />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)}
                className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[60px] resize-y"
                placeholder="Experience level, goals, special requests..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBookingInstructor(null); resetForm(); }}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!instrument || !preferredDay || !preferredTime || !studentName || !studentEmail || !studentPhone}
            >
              <Send className="h-4 w-4 mr-1.5" /> Request Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="h-6 w-6" /> Request Submitted!
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2">
                <p>Your lesson request has been submitted! An administrator will review your request and call you at <strong className="text-primary">{submittedPhone}</strong> to confirm the details.</p>
                <p>Please expect a call within <strong>1-2 business days</strong>.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowConfirmation(false)}>Got it!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
