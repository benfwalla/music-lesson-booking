'use client';

import { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getInstructors, addLessonRequest } from '@/lib/store';
import { InstructorProfile, DAYS_OF_WEEK, DayOfWeek, LessonRequest, PreferredSlot, ALL_INSTRUMENTS, Instrument, SKILL_LEVELS, SkillLevel, LESSON_DURATIONS, LessonDuration } from '@/lib/types';
import { UserCheck, GraduationCap, Timer, Clock, Mail, Phone, Send, CheckCircle2, Plus, X, Filter, ChevronDown, ChevronUp, CalendarDays, Award } from 'lucide-react';

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

type ExperienceRange = 'any' | '1-3' | '3-5' | '5-10' | '10+';

interface Filters {
  instruments: Instrument[];
  skillLevels: SkillLevel[];
  durations: LessonDuration[];
  experience: ExperienceRange;
  studentAge: string;
  days: DayOfWeek[];
}

const EMPTY_FILTERS: Filters = {
  instruments: [],
  skillLevels: [],
  durations: [],
  experience: 'any',
  studentAge: '',
  days: [],
};

function countActiveFilters(f: Filters): number {
  let c = 0;
  if (f.instruments.length) c++;
  if (f.skillLevels.length) c++;
  if (f.durations.length) c++;
  if (f.experience !== 'any') c++;
  if (f.studentAge) c++;
  if (f.days.length) c++;
  return c;
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [bookingInstructor, setBookingInstructor] = useState<InstructorProfile | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  // Form state
  const [instrument, setInstrument] = useState('');
  const [duration, setDuration] = useState(60);
  const [preferredSlots, setPreferredSlots] = useState<PreferredSlot[]>([{ day: '', time: '' }]);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Instrument dropdown
  const [instrumentDropdownOpen, setInstrumentDropdownOpen] = useState(false);

  useEffect(() => { setInstructors(getInstructors()); }, []);

  // Collect all instruments from instructors
  const availableInstruments = useMemo(() => {
    const set = new Set<string>();
    instructors.forEach(i => {
      i.instruments.forEach(inst => { if (inst !== 'Other') set.add(inst); });
      i.customInstruments.forEach(inst => set.add(inst));
    });
    return Array.from(set).sort();
  }, [instructors]);

  // Filter logic
  const filteredInstructors = useMemo(() => {
    return instructors.filter(inst => {
      const allInst = [...inst.instruments.filter(i => i !== 'Other'), ...inst.customInstruments];

      // Instrument filter
      if (filters.instruments.length > 0) {
        if (!filters.instruments.some(fi => allInst.includes(fi))) return false;
      }

      // Skill level filter
      if (filters.skillLevels.length > 0) {
        if (!filters.skillLevels.some(sl => inst.skillLevels.includes(sl))) return false;
      }

      // Duration filter
      if (filters.durations.length > 0) {
        if (!filters.durations.some(d => inst.lessonDurations.includes(d))) return false;
      }

      // Experience filter
      if (filters.experience !== 'any') {
        const yrs = inst.yearsExperience;
        if (yrs === 0) return false; // not set
        switch (filters.experience) {
          case '1-3': if (yrs < 1 || yrs > 3) return false; break;
          case '3-5': if (yrs < 3 || yrs > 5) return false; break;
          case '5-10': if (yrs < 5 || yrs > 10) return false; break;
          case '10+': if (yrs < 10) return false; break;
        }
      }

      // Student age filter
      if (filters.studentAge) {
        const age = parseInt(filters.studentAge, 10);
        if (!isNaN(age)) {
          if (age < inst.ageRangeMin || age > inst.ageRangeMax) return false;
        }
      }

      // Day-of-week filter
      if (filters.days.length > 0) {
        const instDays = new Set(inst.availability.map(s => s.day));
        if (!filters.days.some(d => instDays.has(d))) return false;
      }

      return true;
    });
  }, [instructors, filters]);

  const activeCount = countActiveFilters(filters);

  function toggleInstrumentFilter(inst: Instrument) {
    setFilters(f => ({
      ...f,
      instruments: f.instruments.includes(inst)
        ? f.instruments.filter(i => i !== inst)
        : [...f.instruments, inst],
    }));
  }

  function toggleSkillLevel(sl: SkillLevel) {
    setFilters(f => ({
      ...f,
      skillLevels: f.skillLevels.includes(sl)
        ? f.skillLevels.filter(s => s !== sl)
        : [...f.skillLevels, sl],
    }));
  }

  function toggleDuration(d: LessonDuration) {
    setFilters(f => ({
      ...f,
      durations: f.durations.includes(d)
        ? f.durations.filter(x => x !== d)
        : [...f.durations, d],
    }));
  }

  function toggleDay(day: DayOfWeek) {
    setFilters(f => ({
      ...f,
      days: f.days.includes(day)
        ? f.days.filter(d => d !== day)
        : [...f.days, day],
    }));
  }

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

  const SHORT_DAYS: Record<DayOfWeek, string> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu',
    Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
  };

  const filterContent = (
    <div className="space-y-4">
      {/* Row 1: Instrument multi-select */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Instrument</Label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setInstrumentDropdownOpen(!instrumentDropdownOpen)}
            className="w-full flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <span className={filters.instruments.length ? 'text-foreground' : 'text-muted-foreground'}>
              {filters.instruments.length ? `${filters.instruments.length} selected` : 'All instruments'}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {instrumentDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-border bg-background shadow-lg">
              {availableInstruments.map(inst => (
                <label key={inst} className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/50 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={filters.instruments.includes(inst as Instrument)}
                    onChange={() => toggleInstrumentFilter(inst as Instrument)}
                    className="rounded border-border"
                  />
                  {inst}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Skill Level toggles */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Skill Level</Label>
        <div className="flex flex-wrap gap-2">
          {SKILL_LEVELS.map(sl => (
            <ToggleButton key={sl} active={filters.skillLevels.includes(sl)} onClick={() => toggleSkillLevel(sl)}>
              {sl}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Row 3: Duration toggles */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Lesson Duration</Label>
        <div className="flex flex-wrap gap-2">
          {LESSON_DURATIONS.map(d => (
            <ToggleButton key={d} active={filters.durations.includes(d)} onClick={() => toggleDuration(d)}>
              {d} min
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Row 4: Experience + Age */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Years of Experience</Label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={filters.experience}
            onChange={e => setFilters(f => ({ ...f, experience: e.target.value as ExperienceRange }))}
          >
            <option value="any">Any</option>
            <option value="1-3">1–3 years</option>
            <option value="3-5">3–5 years</option>
            <option value="5-10">5–10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Student Age</Label>
          <Input
            type="number"
            min={3}
            max={99}
            placeholder="I am ___ years old"
            value={filters.studentAge}
            onChange={e => setFilters(f => ({ ...f, studentAge: e.target.value }))}
          />
        </div>
      </div>

      {/* Row 5: Day-of-week */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Availability</Label>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map(day => (
            <ToggleButton key={day} active={filters.days.includes(day)} onClick={() => toggleDay(day)}>
              {SHORT_DAYS[day]}
            </ToggleButton>
          ))}
        </div>
      </div>

      {/* Clear all */}
      {activeCount > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="text-xs text-primary hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 page-title">
          <UserCheck className="h-8 w-8 text-primary" />
          Instructor Directory
        </h1>
        <p className="text-muted-foreground mt-1">Connect with our instructors and explore their specialties</p>
      </div>

      {/* Filter bar */}
      {instructors.length > 0 && (
        <>
          {/* Mobile toggle */}
          <div className="md:hidden">
            <Button
              variant="outline"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeCount > 0 && (
                  <Badge variant="secondary" className="ml-1">{activeCount}</Badge>
                )}
              </span>
              {mobileFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {mobileFiltersOpen && (
              <div className="mt-2 rounded-xl border border-border bg-card p-4">
                {filterContent}
              </div>
            )}
          </div>

          {/* Desktop filter bar */}
          <div className="hidden md:block rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" /> Filters
              </span>
              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {filtersOpen ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {filtersOpen && filterContent}
          </div>

          {/* Result count */}
          <div className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-semibold">{filteredInstructors.length}</span> of{' '}
            <span className="text-foreground font-semibold">{instructors.length}</span> instructors
          </div>
        </>
      )}

      {instructors.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No instructors yet</h3>
            <p className="text-muted-foreground">Instructor profiles will appear here once added</p>
          </CardContent>
        </Card>
      ) : filteredInstructors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold">No matching instructors</h3>
            <p className="text-muted-foreground mb-3">Try adjusting your filters</p>
            <Button variant="outline" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>Clear All Filters</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {filteredInstructors.map((instructor, idx) => {
            const allInstruments = [
              ...instructor.instruments.filter(i => i !== 'Other'),
              ...instructor.customInstruments,
            ];
            const instDays = [...new Set(instructor.availability.map(s => s.day))];
            return (
              <div key={instructor.id}
                className={`flex items-start md:items-center gap-4 px-4 py-3 hover:bg-[#1a1708] transition-colors ${idx < filteredInstructors.length - 1 ? 'border-b border-border' : ''}`}>
                <InstructorAvatar instructor={instructor} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="font-semibold text-sm">{instructor.name}</div>
                  {instructor.bio && <div className="text-xs text-muted-foreground truncate">{instructor.bio}</div>}
                  {/* Mobile: show details inline */}
                  <div className="flex flex-wrap gap-1 md:hidden">
                    {allInstruments.map(i => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">{i}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground md:hidden">
                    {instructor.skillLevels.length > 0 && (
                      <span>{instructor.skillLevels.join(', ')}</span>
                    )}
                    {instructor.yearsExperience > 0 && (
                      <span>{instructor.yearsExperience}yr exp</span>
                    )}
                    {instDays.length > 0 && (
                      <span>{instDays.map(d => SHORT_DAYS[d]).join(', ')}</span>
                    )}
                  </div>
                </div>
                {/* Desktop columns */}
                <div className="hidden md:flex flex-wrap gap-1 max-w-[240px]">
                  {allInstruments.map(i => (
                    <Badge key={i} variant="secondary" className="text-[11px] px-1.5 py-0">{i}</Badge>
                  ))}
                </div>
                <div className="hidden lg:flex items-center gap-3 text-xs text-muted-foreground shrink-0 min-w-[180px]">
                  {instructor.skillLevels.length > 0 && (
                    <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{instructor.skillLevels.join(', ')}</span>
                  )}
                </div>
                <div className="hidden xl:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  {instructor.yearsExperience > 0 && (
                    <span className="flex items-center gap-1"><Award className="h-3 w-3" />{instructor.yearsExperience}yr</span>
                  )}
                  {instructor.lessonDurations.length > 0 && (
                    <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{instructor.lessonDurations.join('/')}m</span>
                  )}
                  {instDays.length > 0 && (
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{instDays.map(d => SHORT_DAYS[d]).join(', ')}</span>
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
