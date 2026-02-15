'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TimeSlotEditor } from '@/components/time-slot-editor';
import { MultiSelect, CheckboxGroup } from '@/components/multi-select';
import { getInstructors, addInstructor, updateInstructor, deleteInstructor } from '@/lib/store';
import { InstructorProfile, ALL_INSTRUMENTS, SKILL_LEVELS, LESSON_DURATIONS, Instrument, SkillLevel, LessonDuration } from '@/lib/types';
import { Clock, Save, User, Music, GraduationCap, Timer, Plus, Pencil, Trash2, Mail, Phone } from 'lucide-react';

function InstructorForm({ instructor, onSave, onCancel }: { instructor?: InstructorProfile; onSave: (p: InstructorProfile) => void; onCancel: () => void }) {
  const [name, setName] = useState(instructor?.name || '');
  const [email, setEmail] = useState(instructor?.email || '');
  const [phone, setPhone] = useState(instructor?.phone || '');
  const [bio, setBio] = useState(instructor?.bio || '');
  const [instruments, setInstruments] = useState<Instrument[]>(instructor?.instruments || []);
  const [customInstruments, setCustomInstruments] = useState<string[]>(instructor?.customInstruments || []);
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>(instructor?.skillLevels || []);
  const [lessonDurations, setLessonDurations] = useState<LessonDuration[]>(instructor?.lessonDurations || []);
  const [availability, setAvailability] = useState(instructor?.availability || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: instructor?.id || crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      instruments,
      customInstruments,
      skillLevels,
      lessonDurations,
      availability,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah Chen" required />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@example.com" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" />
        </div>
        <div className="sm:col-span-2">
          <Label>Bio</Label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Short bio about teaching experience..."
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            maxLength={300}
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold flex items-center gap-1.5 mb-2">
          <Music className="h-4 w-4" /> Instruments You Teach
        </Label>
        <MultiSelect
          options={ALL_INSTRUMENTS}
          selected={instruments}
          onChange={(i) => setInstruments(i as Instrument[])}
          customValues={customInstruments}
          onCustomValuesChange={setCustomInstruments}
        />
      </div>

      <div>
        <Label className="text-base font-semibold flex items-center gap-1.5 mb-2">
          <GraduationCap className="h-4 w-4" /> Skill Levels
        </Label>
        <MultiSelect
          options={SKILL_LEVELS}
          selected={skillLevels}
          onChange={(l) => setSkillLevels(l as SkillLevel[])}
        />
      </div>

      <div>
        <Label className="text-base font-semibold flex items-center gap-1.5 mb-2">
          <Timer className="h-4 w-4" /> Lesson Durations
        </Label>
        <CheckboxGroup
          options={LESSON_DURATIONS}
          selected={lessonDurations}
          onChange={(d) => setLessonDurations(d as LessonDuration[])}
          formatLabel={(v) => `${v} minutes`}
        />
      </div>

      <div>
        <Label className="text-base font-semibold mb-2 block">
          <Clock className="h-4 w-4 inline mr-1.5" /> Weekly Availability
        </Label>
        <TimeSlotEditor slots={availability} onChange={setAvailability} />
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button type="submit">{instructor ? 'Update' : 'Add'} Instructor</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function AvailabilityPage() {
  const [instructors, setInstructorsList] = useState<InstructorProfile[]>([]);
  const [editingInstructor, setEditingInstructor] = useState<InstructorProfile | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setInstructorsList(getInstructors());
  }, []);

  // This page is admin-only (nav handles visibility)

  const refresh = () => setInstructorsList(getInstructors());

  const handleSave = (p: InstructorProfile) => {
    if (editingInstructor) {
      updateInstructor(p);
    } else {
      addInstructor(p);
    }
    refresh();
    setShowForm(false);
    setEditingInstructor(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this instructor?')) {
      deleteInstructor(id);
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8 text-primary" />
            Instructor Profiles
          </h1>
          <p className="text-muted-foreground mt-1">Manage instructor profiles, instruments, and availability</p>
        </div>
        <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingInstructor(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Instructor</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingInstructor ? 'Edit' : 'Add'} Instructor</DialogTitle>
            </DialogHeader>
            <InstructorForm
              instructor={editingInstructor || undefined}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingInstructor(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {instructors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No instructors yet</h3>
            <p className="text-muted-foreground">Add your first instructor profile to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {instructors.map(instructor => {
            const allInstruments = [
              ...instructor.instruments.filter(i => i !== 'Other'),
              ...instructor.customInstruments,
            ];
            return (
              <Card key={instructor.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{instructor.name}</CardTitle>
                      <CardDescription className="space-y-1">
                        {instructor.bio && <p>{instructor.bio}</p>}
                        <div className="flex flex-wrap gap-3 text-xs">
                          {instructor.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{instructor.email}</span>}
                          {instructor.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{instructor.phone}</span>}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingInstructor(instructor); setShowForm(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(instructor.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {allInstruments.map(i => <Badge key={i} variant="secondary">{i}</Badge>)}
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {instructor.skillLevels.length > 0 && (
                      <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{instructor.skillLevels.join(', ')}</span>
                    )}
                    {instructor.lessonDurations.length > 0 && (
                      <span className="flex items-center gap-1"><Timer className="h-3.5 w-3.5" />{instructor.lessonDurations.map(d => `${d}min`).join(', ')}</span>
                    )}
                    {instructor.availability.length > 0 && (
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{instructor.availability.length} time slot{instructor.availability.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
