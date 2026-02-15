'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TimeSlotEditor } from '@/components/time-slot-editor';
import { MultiSelect } from '@/components/multi-select';
import { getStudents, addStudent, updateStudent, deleteStudent, getInstructorProfile, computeMatch } from '@/lib/store';
import { Student, ALL_INSTRUMENTS, SKILL_LEVELS, LESSON_DURATIONS, Instrument, SkillLevel, LessonDuration, DAYS_OF_WEEK, TimeSlot } from '@/lib/types';
import { Users, Plus, Pencil, Trash2, Music, GraduationCap, Timer, TrendingUp } from 'lucide-react';

function StudentForm({ student, onSave, onCancel }: { student?: Student; onSave: (s: Student) => void; onCancel: () => void }) {
  const [name, setName] = useState(student?.name || '');
  const [email, setEmail] = useState(student?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [instruments, setInstruments] = useState<Instrument[]>(student?.instruments || []);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(student?.skillLevel || 'Beginner');
  const [preferredDuration, setPreferredDuration] = useState<LessonDuration>(student?.preferredDuration || 60);
  const [availability, setAvailability] = useState<TimeSlot[]>(student?.availability || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: student?.id || crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      instruments,
      skillLevel,
      preferredDuration,
      availability,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
        </div>
        <div className="sm:col-span-2">
          <Label>Phone</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" />
        </div>
      </div>

      {/* Instruments */}
      <div>
        <Label className="text-base font-semibold flex items-center gap-1.5 mb-2">
          <Music className="h-4 w-4" /> Instruments to Learn
        </Label>
        <MultiSelect
          options={ALL_INSTRUMENTS}
          selected={instruments}
          onChange={(i) => setInstruments(i as Instrument[])}
        />
      </div>

      {/* Skill Level */}
      <div>
        <Label className="text-base font-semibold flex items-center gap-1.5 mb-2">
          <GraduationCap className="h-4 w-4" /> Current Skill Level
        </Label>
        <div className="flex gap-2">
          {SKILL_LEVELS.map(level => (
            <button
              key={level}
              type="button"
              onClick={() => setSkillLevel(level)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                skillLevel === level
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Duration */}
      <div>
        <Label className="text-base font-semibold flex items-center gap-1.5 mb-2">
          <Timer className="h-4 w-4" /> Preferred Lesson Duration
        </Label>
        <div className="flex gap-2">
          {LESSON_DURATIONS.map(dur => (
            <button
              key={dur}
              type="button"
              onClick={() => setPreferredDuration(dur)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                preferredDuration === dur
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {dur} min
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <Label className="text-base font-semibold mb-2 block">Availability</Label>
        <p className="text-sm text-muted-foreground mb-2">When can this student take lessons?</p>
        <TimeSlotEditor slots={availability} onChange={setAvailability} />
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button type="submit">{student ? 'Update' : 'Add'} Student</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'bg-green-100 text-green-700 border-green-200'
    : score >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
    : score >= 25 ? 'bg-orange-100 text-orange-700 border-orange-200'
    : 'bg-red-100 text-red-700 border-red-200';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      <TrendingUp className="h-3 w-3" />
      {score}% match
    </span>
  );
}

export default function StudentsPage() {
  const [students, setStudentsList] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const s = getStudents();
    setStudentsList(s);
    const instructor = getInstructorProfile();
    const scores: Record<string, number> = {};
    s.forEach(student => {
      scores[student.id] = computeMatch(instructor, student).score;
    });
    setMatchScores(scores);
  }, []);

  const refresh = () => {
    const s = getStudents();
    setStudentsList(s);
    const instructor = getInstructorProfile();
    const scores: Record<string, number> = {};
    s.forEach(student => {
      scores[student.id] = computeMatch(instructor, student).score;
    });
    setMatchScores(scores);
  };

  const handleSave = (student: Student) => {
    if (editingStudent) {
      updateStudent(student);
    } else {
      addStudent(student);
    }
    refresh();
    setShowForm(false);
    setEditingStudent(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this student and their bookings?')) {
      deleteStudent(id);
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Students
          </h1>
          <p className="text-muted-foreground mt-1">Manage students and see compatibility scores</p>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingStudent(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Student</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudent ? 'Edit' : 'Add'} Student</DialogTitle>
            </DialogHeader>
            <StudentForm
              student={editingStudent || undefined}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingStudent(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No students yet</h3>
            <p className="text-muted-foreground">Add your first student to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {students.map(student => (
            <Card key={student.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      {student.name}
                      <ScoreBadge score={matchScores[student.id] || 0} />
                    </CardTitle>
                    <CardDescription>
                      {[student.email, student.phone].filter(Boolean).join(' • ') || 'No contact info'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditingStudent(student); setShowForm(true); }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Profile details */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {student.instruments.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Music className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{student.instruments.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{student.skillLevel}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{student.preferredDuration} min lessons</span>
                  </div>
                </div>

                {student.availability.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map(day => {
                      const daySlots = student.availability.filter(s => s.day === day);
                      if (daySlots.length === 0) return null;
                      return daySlots.map(slot => (
                        <Badge key={slot.id} variant="outline" className="text-xs">
                          {day.slice(0, 3)} {slot.startTime}–{slot.endTime}
                        </Badge>
                      ));
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
