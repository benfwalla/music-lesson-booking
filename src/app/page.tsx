'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/lib/role-context';
import { getBookings, getStudents, getInstructorProfile, getInstructors, computeAllMatches } from '@/lib/store';
import { Booking, Student, InstructorProfile, MatchResult, DAYS_OF_WEEK } from '@/lib/types';
import { Users, Calendar, Clock, Music, ArrowRight, TrendingUp, Sparkles, UserCheck } from 'lucide-react';

export default function Dashboard() {
  const { role } = useRole();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [topMatches, setTopMatches] = useState<MatchResult[]>([]);
  const [instructorCount, setInstructorCount] = useState(0);

  useEffect(() => {
    if (role !== 'admin') {
      if (role === 'instructor') router.replace('/my-profile');
      else if (role === 'student') router.replace('/announcements');
      return;
    }
    setBookings(getBookings());
    setStudents(getStudents());
    setInstructor(getInstructorProfile());
    setTopMatches(computeAllMatches().slice(0, 3));
    setInstructorCount(getInstructors().length);
  }, [role, router]);

  if (role !== 'admin') return null;

  const todayIndex = new Date().getDay();
  const todayName = DAYS_OF_WEEK[(todayIndex + 6) % 7];
  const todayBookings = bookings.filter(b => b.day === todayName);
  const upcomingBookings = [...bookings]
    .sort((a, b) => {
      const dayDiff = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, 5);
  const goodMatches = topMatches.filter(m => m.score >= 50).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Music className="h-8 w-8 text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Welcome to MusicBook — your lesson scheduling hub</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Instructors', value: instructorCount, icon: UserCheck },
          { label: 'Students', value: students.length, icon: Users },
          { label: 'Bookings', value: bookings.length, icon: Calendar },
          { label: 'Today', value: todayBookings.length, icon: Clock },
          { label: 'Good Matches', value: goodMatches, icon: Sparkles },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/availability', title: 'Manage Instructors', desc: 'Profiles, instruments & availability' },
          { href: '/students', title: 'Manage Students', desc: 'Profiles & match scores' },
          { href: '/schedule', title: 'Schedule & Match', desc: 'View compatibility & book lessons' },
        ].map(({ href, title, desc }) => (
          <Link key={href} href={href}>
            <Card className="hover:border-primary/40 hover:shadow-[0_0_15px_rgba(245,197,24,0.1)] transition-all cursor-pointer h-full">
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {topMatches.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Top Matches</CardTitle>
            <Link href="/schedule"><Button variant="outline" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMatches.map(match => (
                <div key={match.student.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${match.score >= 75 ? 'text-green-500' : match.score >= 50 ? 'text-primary' : 'text-orange-500'}`}>{match.score}%</span>
                    <div>
                      <span className="font-medium">{match.student.name}</span>
                      <div className="flex gap-1 mt-0.5">
                        {match.instrumentOverlap.map(i => (
                          <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Today&apos;s Lessons ({todayName})</CardTitle></CardHeader>
        <CardContent>
          {todayBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No lessons scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todayBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div>
                    <span className="font-medium">{booking.studentName}</span>
                    {booking.instrument && <span className="text-muted-foreground text-sm ml-2">({booking.instrument})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{booking.startTime} – {booking.endTime}</Badge>
                    {booking.recurring && <Badge>Weekly</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Bookings</CardTitle>
          <Link href="/bookings"><Button variant="outline" size="sm">View All</Button></Link>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No bookings yet.</p>
          ) : (
            <div className="space-y-2">
              {upcomingBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <span className="font-medium">{booking.studentName}</span>
                    {booking.instrument && <span className="text-muted-foreground text-sm ml-2">• {booking.instrument}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{booking.day}</Badge>
                    <span>{booking.startTime} – {booking.endTime}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
