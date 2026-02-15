'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TimeSlotEditor } from '@/components/time-slot-editor';
import { MultiSelect, CheckboxGroup } from '@/components/multi-select';
import { useRole } from '@/lib/role-context';
import {
  getInstructors, updateInstructor, addInstructor,
  getStudents, updateStudent, addStudent,
} from '@/lib/store';
import {
  InstructorProfile, Student,
  ALL_INSTRUMENTS, SKILL_LEVELS, LESSON_DURATIONS,
  Instrument, SkillLevel, LessonDuration, TimeSlot,
} from '@/lib/types';
import { Save, User, Music, GraduationCap, Timer, Clock, ShieldAlert } from 'lucide-react';

function InstructorSelfEdit({ profileId }: { profileId: string | null }) {
  const { setRole } = useRole();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [customInstruments, setCustomInstruments] = useState<string[]>([]);
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>([]);
  const [lessonDurations, setLessonDurations] = useState<LessonDuration[]>([]);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [saved, setSaved] = useState(false);
  const [id, setId] = useState(profileId || '');

  useEffect(() => {
    if (profileId) {
      const inst = getInstructors().find(i => i.id === profileId);
      if (inst) {
        setName(inst.name); setEmail(inst.email); setPhone(inst.phone);
        setBio(inst.bio); setInstruments(inst.instruments);
        setCustomInstruments(inst.customInstruments); setSkillLevels(inst.skillLevels);
        setLessonDurations(inst.lessonDurations); setAvailability(inst.availability);
        setId(inst.id);
      }
    }
  }, [profileId]);

  const handleSave = () => {
    const profile: InstructorProfile = {
      id: id || crypto.randomUUID(),
      name: name.trim(), email: email.trim(), phone: phone.trim(), bio: bio.trim(),
      instruments, customInstruments, skillLevels, lessonDurations, availability,
    };
    if (profileId) {
      updateInstructor(profile);
    } else {
      addInstructor(profile);
      setRole('instructor', profile.id);
    }
    setId(profile.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8 text-primary" /> My Profile
        </h1>
        <p className="text-muted-foreground mt-1">Edit your instructor profile</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div className="sm:col-span-2">
              <Label>Bio</Label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={300}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold flex items-center gap-1.5 mb-2"><Music className="h-4 w-4" /> Instruments</Label>
            <MultiSelect options={ALL_INSTRUMENTS} selected={instruments} onChange={i => setInstruments(i as Instrument[])} customValues={customInstruments} onCustomValuesChange={setCustomInstruments} />
          </div>

          <div>
            <Label className="text-base font-semibold flex items-center gap-1.5 mb-2"><GraduationCap className="h-4 w-4" /> Skill Levels</Label>
            <MultiSelect options={SKILL_LEVELS} selected={skillLevels} onChange={l => setSkillLevels(l as SkillLevel[])} />
          </div>

          <div>
            <Label className="text-base font-semibold flex items-center gap-1.5 mb-2"><Timer className="h-4 w-4" /> Lesson Durations</Label>
            <CheckboxGroup options={LESSON_DURATIONS} selected={lessonDurations} onChange={d => setLessonDurations(d as LessonDuration[])} formatLabel={v => `${v} minutes`} />
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block"><Clock className="h-4 w-4 inline mr-1.5" /> Availability</Label>
            <TimeSlotEditor slots={availability} onChange={setAvailability} />
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> {saved ? 'Saved!' : 'Save Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentSelfEdit({ profileId }: { profileId: string | null }) {
  const { setRole } = useRole();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [customInstruments, setCustomInstruments] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Beginner');
  const [preferredDuration, setPreferredDuration] = useState<LessonDuration>(60);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [emergencyContactName, setEcName] = useState('');
  const [emergencyContactPhone, setEcPhone] = useState('');
  const [emergencyContactRelationship, setEcRel] = useState('');
  const [saved, setSaved] = useState(false);
  const [id, setId] = useState(profileId || '');

  useEffect(() => {
    if (profileId) {
      const stu = getStudents().find(s => s.id === profileId);
      if (stu) {
        setName(stu.name); setEmail(stu.email); setPhone(stu.phone);
        setInstruments(stu.instruments); setCustomInstruments(stu.customInstruments || []);
        setSkillLevel(stu.skillLevel); setPreferredDuration(stu.preferredDuration);
        setAvailability(stu.availability);
        setEcName(stu.emergencyContactName); setEcPhone(stu.emergencyContactPhone);
        setEcRel(stu.emergencyContactRelationship);
        setId(stu.id);
      }
    }
  }, [profileId]);

  const handleSave = () => {
    const student: Student = {
      id: id || crypto.randomUUID(),
      name: name.trim(), email: email.trim(), phone: phone.trim(),
      instruments, customInstruments, skillLevel, preferredDuration,
      availability,
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      emergencyContactRelationship: emergencyContactRelationship.trim(),
    };
    if (profileId) {
      updateStudent(student);
    } else {
      addStudent(student);
      setRole('student', student.id);
    }
    setId(student.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8 text-primary" /> My Profile
        </h1>
        <p className="text-muted-foreground mt-1">Edit your student profile</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
          </div>

          <div>
            <Label className="text-base font-semibold flex items-center gap-1.5 mb-2"><Music className="h-4 w-4" /> Instruments to Learn</Label>
            <MultiSelect options={ALL_INSTRUMENTS} selected={instruments} onChange={i => setInstruments(i as Instrument[])} customValues={customInstruments} onCustomValuesChange={setCustomInstruments} />
          </div>

          <div>
            <Label className="text-base font-semibold flex items-center gap-1.5 mb-2"><GraduationCap className="h-4 w-4" /> Skill Level</Label>
            <div className="flex gap-2">
              {SKILL_LEVELS.map(level => (
                <button key={level} type="button" onClick={() => setSkillLevel(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${skillLevel === level ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold flex items-center gap-1.5 mb-2"><Timer className="h-4 w-4" /> Preferred Duration</Label>
            <div className="flex gap-2">
              {LESSON_DURATIONS.map(dur => (
                <button key={dur} type="button" onClick={() => setPreferredDuration(dur)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${preferredDuration === dur ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
                  {dur} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold flex items-center gap-1.5 mb-2"><ShieldAlert className="h-4 w-4" /> Emergency Contact</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><Label className="text-sm">Name</Label><Input value={emergencyContactName} onChange={e => setEcName(e.target.value)} /></div>
              <div><Label className="text-sm">Phone</Label><Input value={emergencyContactPhone} onChange={e => setEcPhone(e.target.value)} /></div>
              <div>
                <Label className="text-sm">Relationship</Label>
                <select value={emergencyContactRelationship} onChange={e => setEcRel(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select...</option>
                  <option value="Parent">Parent</option><option value="Guardian">Guardian</option>
                  <option value="Spouse">Spouse</option><option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option><option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-2 block">Availability</Label>
            <TimeSlotEditor slots={availability} onChange={setAvailability} />
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> {saved ? 'Saved!' : 'Save Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MyProfilePage() {
  const { role, profileId } = useRole();

  if (role === 'instructor') return <InstructorSelfEdit profileId={profileId} />;
  if (role === 'student') return <StudentSelfEdit profileId={profileId} />;

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-muted-foreground">Profile editing is available for instructor and student roles.</p>
      </CardContent>
    </Card>
  );
}
