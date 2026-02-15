'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getInstructors, addLessonRequest } from '@/lib/store';
import { InstructorProfile, DAYS_OF_WEEK, LessonRequest, PreferredSlot } from '@/lib/types';
import { UserCheck, GraduationCap, Timer, Clock, Mail, Phone, Send, CheckCircle2, Plus, X } from 'lucide-react';

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
  const sizeClasses = { sm: 'h-10 w-10 text-sm', md: 'h-11 w-11 text-base', lg: 'h-20 w-20 text-2xl' };
  const gradient = AVATAR_GRADIENTS[hashName(instructor.name) % AVATAR_GRADIENTS.length];

  if (instructor.photoUrl) {
    return (
      <img src={instructor.photoUrl} alt={instructor.name}
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0 ring-2 ring-primary/30`} />
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
  const [preferredSlots, setPreferredSlots] = useState<PreferredSlot[]>([{ day: '', time: '' }]);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { setInstructors(getInstructors()); }, []);

  function resetForm() {
    setInstrument(''); setDuration(60); setPreferredSlots([{ day: '', time: '' }]);
    setStudentName(''); setStudentEmail(''); setStudentPhone(''); setNotes('');
  }

  function addSlot() {
    setPreferredSlots(prev => [...prev, { day: '', time: '' }]);
  }

  function removeSlot(index: number) {
    if (preferredSlots.length <= 1) return;
    setPreferredSlots(prev => prev.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, field: 'day' | 'time', value: string) {
    setPreferredSlots(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }

  const allSlotsValid = preferredSlots.length > 0 && preferredSlots.every(s => s.day && s.time);

  function handleSubmit() {
    if (!bookingInstructor || !instrument || !allSlotsValid || !studentName || !studentEmail || !studentPhone) return;
    const request: LessonRequest = {
      id: crypto.randomUUID(),
      studentName, studentEmail, studentPhone,
      instructorId: bookingInstructor.id,
      instructorName: bookingInstructor.name,
      instrument, preferredDuration: duration,
      preferredSlots,
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
        <div className="rounded-xl border border-border overflow-hidden">
          {instructors.map((instructor, idx) => {
            const allInstruments = [
              ...instructor.instruments.filter(i => i !== 'Other'),
              ...instructor.customInstruments,
            ];
            return (
              <div key={instructor.id}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-[#1a1708] transition-colors ${idx < instructors.length - 1 ? 'border-b border-border' : ''}`}>
                <InstructorAvatar instructor={instructor} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm">{instructor.name}</div>
                  {instructor.bio && <div className="text-xs text-muted-foreground truncate">{instructor.bio}</div>}
                </div>
                <div className="hidden md:flex flex-wrap gap-1 max-w-[280px]">
                  {allInstruments.map(i => (
                    <Badge key={i} variant="secondary" className="text-[11px] px-1.5 py-0">{i}</Badge>
                  ))}
                </div>
                <div className="hidden lg:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  {instructor.skillLevels.length > 0 && (
                    <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{instructor.skillLevels.join(', ')}</span>
                  )}
                </div>
                <div className="hidden lg:flex items-center gap-2 shrink-0">
                  {instructor.email && (
                    <a href={`mailto:${instructor.email}`} className="text-primary hover:underline"><Mail className="h-4 w-4" /></a>
                  )}
                  {instructor.phone && (
                    <a href={`tel:${instructor.phone}`} className="text-primary hover:underline"><Phone className="h-4 w-4" /></a>
                  )}
                </div>
                <Button
                  onClick={() => { setBookingInstructor(instructor); setInstrument(allInstruments[0] || ''); }}
                  size="sm" className="shrink-0"
                >
                  <Send className="h-3.5 w-3.5 mr-1" /> Request
                </Button>
              </div>
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

            {/* Preferred Time Slots */}
            <div>
              <Label className="mb-2 block">Preferred Times</Label>
              <div className="space-y-2">
                {preferredSlots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                      value={slot.day} onChange={e => updateSlot(idx, 'day', e.target.value)}
                    >
                      <option value="">Day...</option>
                      {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <Input type="time" value={slot.time} onChange={e => updateSlot(idx, 'time', e.target.value)} className="flex-1" />
                    {preferredSlots.length > 1 && (
                      <button type="button" onClick={() => removeSlot(idx)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addSlot}
                className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Add Another Time
              </button>
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
            <Button onClick={handleSubmit} disabled={!instrument || !allSlotsValid || !studentName || !studentEmail || !studentPhone}>
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
