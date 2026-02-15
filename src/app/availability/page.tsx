'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimeSlotEditor } from '@/components/time-slot-editor';
import { getInstructorAvailability, setInstructorAvailability } from '@/lib/store';
import { TimeSlot } from '@/lib/types';
import { Clock, Save } from 'lucide-react';

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSlots(getInstructorAvailability());
  }, []);

  const handleSave = () => {
    setInstructorAvailability(slots);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8 text-primary" />
          Instructor Availability
        </h1>
        <p className="text-muted-foreground mt-1">Set your weekly teaching schedule</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Add time slots for each day you&apos;re available to teach</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TimeSlotEditor slots={slots} onChange={setSlots} />
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> Save Availability
            </Button>
            {saved && <span className="text-sm text-green-600 font-medium">✓ Saved!</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
