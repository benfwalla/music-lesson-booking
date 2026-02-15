'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getInstructors } from '@/lib/store';
import { InstructorProfile } from '@/lib/types';
import { UserCheck, Music, GraduationCap, Timer, Clock, Mail, Phone } from 'lucide-react';

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);

  useEffect(() => {
    setInstructors(getInstructors());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <UserCheck className="h-8 w-8 text-primary" />
          Instructor Directory
        </h1>
        <p className="text-muted-foreground mt-1">Connect with our instructors and explore their specialties</p>
      </div>

      {instructors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No instructors yet</h3>
            <p className="text-muted-foreground">Instructor profiles will appear here once added</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {instructors.map(instructor => {
            const allInstruments = [
              ...instructor.instruments.filter(i => i !== 'Other'),
              ...instructor.customInstruments,
            ];
            return (
              <Card key={instructor.id} className="overflow-hidden border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Music className="h-7 w-7 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-xl">{instructor.name}</CardTitle>
                      {instructor.bio && (
                        <CardDescription className="mt-1">{instructor.bio}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Instruments */}
                  <div className="flex flex-wrap gap-1.5">
                    {allInstruments.map(i => (
                      <Badge key={i} variant="secondary" className="text-sm">{i}</Badge>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {instructor.skillLevels.length > 0 && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {instructor.skillLevels.join(', ')}
                      </span>
                    )}
                    {instructor.lessonDurations.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5" />
                        {instructor.lessonDurations.map(d => `${d}min`).join(', ')}
                      </span>
                    )}
                    {instructor.availability.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {instructor.availability.length} time slot{instructor.availability.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Contact */}
                  {(instructor.email || instructor.phone) && (
                    <div className="border-t pt-3 flex flex-wrap gap-4 text-sm">
                      {instructor.email && (
                        <a href={`mailto:${instructor.email}`} className="flex items-center gap-1.5 text-primary hover:underline">
                          <Mail className="h-4 w-4" /> {instructor.email}
                        </a>
                      )}
                      {instructor.phone && (
                        <a href={`tel:${instructor.phone}`} className="flex items-center gap-1.5 text-primary hover:underline">
                          <Phone className="h-4 w-4" /> {instructor.phone}
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
