'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TimeSlotEditor } from '@/components/time-slot-editor';
import { MultiSelect, CheckboxGroup } from '@/components/multi-select';
import { getInstructorProfile, setInstructorProfile } from '@/lib/store';
import { InstructorProfile, ALL_INSTRUMENTS, SKILL_LEVELS, LESSON_DURATIONS, Instrument, SkillLevel, LessonDuration } from '@/lib/types';
import { Clock, Save, User, Music, GraduationCap, Timer } from 'lucide-react';

export default function AvailabilityPage() {
  const [profile, setProfile] = useState<InstructorProfile>({
    name: '',
    instruments: [],
    skillLevels: [],
    lessonDurations: [],
    availability: [],
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(getInstructorProfile());
  }, []);

  const handleSave = () => {
    setInstructorProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (partial: Partial<InstructorProfile>) => {
    setProfile(prev => ({ ...prev, ...partial }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8 text-primary" />
          Instructor Profile
        </h1>
        <p className="text-muted-foreground mt-1">Set up your teaching profile and weekly availability</p>
      </div>

      {/* Profile Card Preview */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Music className="h-8 w-8 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold">{profile.name || 'Your Name'}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profile.instruments.length > 0 ? (
                  profile.instruments.map(i => <Badge key={i} variant="secondary">{i}</Badge>)
                ) : (
                  <span className="text-sm text-muted-foreground italic">No instruments selected</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                {profile.skillLevels.length > 0 && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {profile.skillLevels.join(', ')}
                  </span>
                )}
                {profile.lessonDurations.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Timer className="h-3.5 w-3.5" />
                    {profile.lessonDurations.map(d => `${d}min`).join(', ')}
                  </span>
                )}
                {profile.availability.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {profile.availability.length} time slot{profile.availability.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Basic Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
            <Label>Instructor Name</Label>
            <Input
              value={profile.name}
              onChange={e => update({ name: e.target.value })}
              placeholder="e.g. Sarah Chen"
            />
          </div>
        </CardContent>
      </Card>

      {/* Instruments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Music className="h-5 w-5" /> Instruments You Teach</CardTitle>
          <CardDescription>Select all instruments you offer lessons for</CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelect
            options={ALL_INSTRUMENTS}
            selected={profile.instruments}
            onChange={(instruments) => update({ instruments: instruments as Instrument[] })}
          />
        </CardContent>
      </Card>

      {/* Skill Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Skill Levels You Teach</CardTitle>
          <CardDescription>Which student levels do you accept?</CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelect
            options={SKILL_LEVELS}
            selected={profile.skillLevels}
            onChange={(levels) => update({ skillLevels: levels as SkillLevel[] })}
          />
        </CardContent>
      </Card>

      {/* Lesson Durations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Timer className="h-5 w-5" /> Lesson Durations Offered</CardTitle>
          <CardDescription>What lesson lengths do you offer?</CardDescription>
        </CardHeader>
        <CardContent>
          <CheckboxGroup
            options={LESSON_DURATIONS}
            selected={profile.lessonDurations}
            onChange={(durations) => update({ lessonDurations: durations as LessonDuration[] })}
            formatLabel={(v) => `${v} minutes`}
          />
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Weekly Availability</CardTitle>
          <CardDescription>Add time slots for each day you&apos;re available to teach</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeSlotEditor
            slots={profile.availability}
            onChange={(availability) => update({ availability })}
          />
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3 sticky bottom-4 z-10">
        <Button size="lg" onClick={handleSave} className="shadow-lg">
          <Save className="h-4 w-4 mr-2" /> Save Profile
        </Button>
        {saved && <span className="text-sm text-green-600 font-medium bg-background px-3 py-1 rounded-full shadow">✓ Saved!</span>}
      </div>
    </div>
  );
}
