'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getInstructorProfile, getBookings, addBooking, computeAllMatches } from '@/lib/store';
import { MatchResult, Booking, DAYS_OF_WEEK, InstructorProfile } from '@/lib/types';
import { Calendar, Check, AlertCircle, TrendingUp, Music, GraduationCap, Timer, Clock, ChevronDown, ChevronUp } from 'lucide-react';

function ScoreBar({ score, max, label }: { score: number; max: number; label: string }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : pct > 0 ? 'bg-orange-500' : 'bg-muted'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right font-medium">{score}/{max}</span>
    </div>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 75 ? 'text-green-400 border-green-700 bg-green-900/30'
    : score >= 50 ? 'text-yellow-400 border-yellow-700 bg-yellow-900/30'
    : score >= 25 ? 'text-orange-400 border-orange-700 bg-orange-900/30'
    : 'text-red-400 border-red-700 bg-red-900/30';

  return (
    <div className={`h-16 w-16 rounded-full border-2 flex flex-col items-center justify-center shrink-0 ${color}`}>
      <span className="text-lg font-bold leading-none">{score}</span>
      <span className="text-[10px] leading-none mt-0.5">/ 100</span>
    </div>
  );
}

function MatchCard({ match, onBook, instructor }: { match: MatchResult; onBook: (match: MatchResult, slotId: string, notes: string, recurring: boolean) => void; instructor: InstructorProfile }) {
  const [expanded, setExpanded] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');
  const [recurring, setRecurring] = useState(true);
  const [booked, setBooked] = useState<string | null>(null);

  const handleBook = (slotId: string) => {
    onBook(match, slotId, bookingNotes, recurring);
    setBooked(slotId);
    setBookingNotes('');
    setTimeout(() => setBooked(null), 2000);
  };

  // Filter out already-booked time slots
  const bookings = getBookings();
  const availableSlots = match.timeOverlap.filter(slot =>
    !bookings.some(b =>
      b.day === slot.day &&
      b.startTime < slot.endTime &&
      b.endTime > slot.startTime
    )
  );

  return (
    <Card className={`overflow-hidden transition-shadow ${match.score >= 50 ? 'border-primary/20' : ''}`}>
      <CardContent className="pt-5">
        <div className="flex items-start gap-4">
          <ScoreCircle score={match.score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{match.student.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {/* Quick compatibility summary */}
            <div className="flex flex-wrap gap-2 mt-2">
              {match.instrumentOverlap.length > 0 ? (
                match.instrumentOverlap.map(i => (
                  <Badge key={i} className="bg-green-900/30 text-green-400 border-green-700">
                    <Music className="h-3 w-3 mr-1" />{i}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <Music className="h-3 w-3 mr-1" />No instrument match
                </Badge>
              )}
              <Badge variant={match.skillLevelMatch ? 'default' : 'outline'} className={match.skillLevelMatch ? 'bg-green-900/30 text-green-400 border-green-700' : 'text-muted-foreground'}>
                <GraduationCap className="h-3 w-3 mr-1" />{match.student.skillLevel}
              </Badge>
              <Badge variant={match.durationMatch ? 'default' : 'outline'} className={match.durationMatch ? 'bg-green-900/30 text-green-400 border-green-700' : 'text-muted-foreground'}>
                <Timer className="h-3 w-3 mr-1" />{match.student.preferredDuration}min
              </Badge>
              <Badge variant={match.timeOverlap.length > 0 ? 'default' : 'outline'} className={match.timeOverlap.length > 0 ? 'bg-green-900/30 text-green-400 border-green-700' : 'text-muted-foreground'}>
                <Clock className="h-3 w-3 mr-1" />{match.timeOverlap.length} slot{match.timeOverlap.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Expanded details */}
            {expanded && (
              <div className="mt-4 space-y-4">
                {/* Score breakdown */}
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-medium text-sm mb-2">Match Breakdown</h4>
                  <ScoreBar score={match.breakdown.instrumentScore} max={30} label="Instruments" />
                  <ScoreBar score={match.breakdown.skillScore} max={25} label="Skill Level" />
                  <ScoreBar score={match.breakdown.durationScore} max={20} label="Duration" />
                  <ScoreBar score={match.breakdown.timeScore} max={25} label="Time Slots" />
                </div>

                {/* Why they match / don't */}
                <div className="space-y-1.5 text-sm">
                  {match.instrumentOverlap.length > 0 ? (
                    <p className="text-green-400">✓ Both interested in: {match.instrumentOverlap.join(', ')}</p>
                  ) : (
                    <p className="text-muted-foreground">✗ No shared instruments — student wants {match.student.instruments.join(', ') || 'none set'}, you teach {instructor.instruments.join(', ') || 'none set'}</p>
                  )}
                  {match.skillLevelMatch ? (
                    <p className="text-green-400">✓ You teach {match.student.skillLevel} students</p>
                  ) : (
                    <p className="text-muted-foreground">✗ Student is {match.student.skillLevel}, you teach {instructor.skillLevels.join(', ') || 'none set'}</p>
                  )}
                  {match.durationMatch ? (
                    <p className="text-green-400">✓ {match.student.preferredDuration}min lessons available</p>
                  ) : (
                    <p className="text-muted-foreground">✗ Student wants {match.student.preferredDuration}min, you offer {instructor.lessonDurations.map(d => `${d}min`).join(', ') || 'none set'}</p>
                  )}
                </div>

                {/* Available time slots for booking */}
                {availableSlots.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Available Slots</h4>
                    <div className="flex items-center gap-4 mb-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={recurring}
                          onChange={e => setRecurring(e.target.checked)}
                          className="rounded"
                        />
                        Recurring weekly
                      </label>
                      <Input
                        placeholder="Notes (optional)"
                        value={bookingNotes}
                        onChange={e => setBookingNotes(e.target.value)}
                        className="flex-1 max-w-xs h-8 text-sm"
                      />
                    </div>
                    {DAYS_OF_WEEK.map(day => {
                      const daySlots = availableSlots.filter(s => s.day === day);
                      if (daySlots.length === 0) return null;
                      return (
                        <div key={day}>
                          <p className="text-xs font-medium text-muted-foreground mb-1">{day}</p>
                          <div className="grid gap-1.5">
                            {daySlots.map(slot => (
                              <div key={slot.id} className="flex items-center justify-between p-2 rounded border hover:border-primary transition-colors">
                                <Badge variant="secondary">{slot.startTime} – {slot.endTime}</Badge>
                                {booked === slot.id ? (
                                  <Badge className="bg-green-600"><Check className="h-3 w-3 mr-1" />Booked!</Badge>
                                ) : (
                                  <Button size="sm" variant="outline" onClick={() => handleBook(slot.id)}>Book</Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SchedulePage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [filter, setFilter] = useState<'all' | 'good' | 'bookable'>('all');

  useEffect(() => {
    setMatches(computeAllMatches());
    setInstructor(getInstructorProfile());
  }, []);

  // Admin-only page (nav handles visibility)

  const refresh = () => {
    setMatches(computeAllMatches());
  };

  const handleBook = (match: MatchResult, slotId: string, notes: string, recurring: boolean) => {
    const slot = match.timeOverlap.find(s => s.id === slotId);
    if (!slot) return;
    const booking: Booking = {
      id: crypto.randomUUID(),
      studentId: match.student.id,
      studentName: match.student.name,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      instrument: match.instrumentOverlap[0] || match.student.instruments[0] || '',
      recurring,
      notes,
      createdAt: new Date().toISOString(),
    };
    addBooking(booking);
    refresh();
  };

  const filteredMatches = matches.filter(m => {
    if (filter === 'good') return m.score >= 50;
    if (filter === 'bookable') return m.timeOverlap.length > 0 && m.score >= 25;
    return true;
  });

  const hasProfile = instructor && (instructor.instruments.length > 0 || instructor.availability.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          Schedule & Match
        </h1>
        <p className="text-muted-foreground mt-1">Students ranked by compatibility — expand to see details and book</p>
      </div>

      {!hasProfile && (
        <Card className="border-amber-700 bg-amber-900/30">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">
              Set up your <a href="/availability" className="underline font-medium">instructor profile</a> first to get accurate match scores.
            </p>
          </CardContent>
        </Card>
      )}

      {matches.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          {(['all', 'good', 'bookable'] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `All (${matches.length})` : f === 'good' ? `Good Match 50%+` : `Bookable`}
            </Button>
          ))}
        </div>
      )}

      {filteredMatches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No matches found</h3>
            <p className="text-muted-foreground">
              {matches.length === 0
                ? <>Add <a href="/students" className="text-primary underline">students</a> to see compatibility matches.</>
                : 'No students match the current filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMatches.map(match => (
            <MatchCard
              key={match.student.id}
              match={match}
              onBook={handleBook}
              instructor={instructor!}
            />
          ))}
        </div>
      )}
    </div>
  );
}
