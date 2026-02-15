'use client';

import { useState } from 'react';
import { TimeSlot, DayOfWeek, DAYS_OF_WEEK } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';

interface TimeSlotEditorProps {
  slots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
}

export function TimeSlotEditor({ slots, onChange }: TimeSlotEditorProps) {
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const addSlot = () => {
    if (startTime >= endTime) return;
    const newSlot: TimeSlot = {
      id: crypto.randomUUID(),
      day,
      startTime,
      endTime,
    };
    onChange([...slots, newSlot]);
  };

  const removeSlot = (id: string) => {
    onChange(slots.filter(s => s.id !== id));
  };

  const slotsByDay = DAYS_OF_WEEK.map(d => ({
    day: d,
    slots: slots.filter(s => s.day === d),
  })).filter(g => g.slots.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label>Day</Label>
          <select
            value={day}
            onChange={e => setDay(e.target.value as DayOfWeek)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            {DAYS_OF_WEEK.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Start</Label>
          <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-32" />
        </div>
        <div>
          <Label>End</Label>
          <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-32" />
        </div>
        <Button type="button" onClick={addSlot} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {slotsByDay.length === 0 && (
        <p className="text-muted-foreground text-sm italic">No time slots added yet.</p>
      )}

      {slotsByDay.map(({ day: d, slots: daySlots }) => (
        <div key={d}>
          <h4 className="font-medium text-sm mb-1">{d}</h4>
          <div className="flex flex-wrap gap-2">
            {daySlots.map(slot => (
              <Badge key={slot.id} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                {slot.startTime} – {slot.endTime}
                <button onClick={() => removeSlot(slot.id)} className="ml-1 hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
