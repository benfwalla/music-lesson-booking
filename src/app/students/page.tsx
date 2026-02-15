'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TimeSlotEditor } from '@/components/time-slot-editor';
import { getStudents, addStudent, updateStudent, deleteStudent } from '@/lib/store';
import { Student, TimeSlot, DAYS_OF_WEEK } from '@/lib/types';
import { Users, Plus, Pencil, Trash2, Music } from 'lucide-react';

function StudentForm({ student, onSave, onCancel }: { student?: Student; onSave: (s: Student) => void; onCancel: () => void }) {
  const [name, setName] = useState(student?.name || '');
  const [email, setEmail] = useState(student?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [instrument, setInstrument] = useState(student?.instrument || '');
  const [availability, setAvailability] = useState<TimeSlot[]>(student?.availability || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: student?.id || crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      instrument: instrument.trim(),
      availability,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
        </div>
        <div>
          <Label>Instrument</Label>
          <Input value={instrument} onChange={e => setInstrument(e.target.value)} placeholder="Piano" />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" />
        </div>
      </div>
      
      <div>
        <Label className="text-base font-semibold">Student&apos;s Availability</Label>
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

export default function StudentsPage() {
  const [students, setStudentsList] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setStudentsList(getStudents());
  }, []);

  const refresh = () => setStudentsList(getStudents());

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
          <p className="text-muted-foreground mt-1">Manage your students and their availability</p>
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
            <Card key={student.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {student.name}
                    {student.instrument && (
                      <Badge variant="secondary" className="font-normal">
                        <Music className="h-3 w-3 mr-1" />{student.instrument}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {[student.email, student.phone].filter(Boolean).join(' • ') || 'No contact info'}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
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
              {student.availability.length > 0 && (
                <CardContent>
                  <p className="text-sm font-medium mb-2">Availability:</p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => {
                      const daySlots = student.availability.filter(s => s.day === day);
                      if (daySlots.length === 0) return null;
                      return daySlots.map(slot => (
                        <Badge key={slot.id} variant="outline">
                          {day.slice(0, 3)} {slot.startTime}–{slot.endTime}
                        </Badge>
                      ));
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
