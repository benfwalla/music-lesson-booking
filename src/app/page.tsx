'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBookings, getStudents, getInstructorAvailability } from '@/lib/store';
import { Booking, Student, TimeSlot, DAYS_OF_WEEK } from '@/lib/types';
import { Users, Calendar, Clock, Music, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [availability, setAvailability] = useState<TimeSlot[]>([]);

  useEffect(() => {
    setBookings(getBookings());
    setStudents(getStudents());
    setAvailability(getInstructorAvailability());
  }, []);

  const todayIndex = new Date().getDay();
  const todayName = DAYS_OF_WEEK[(todayIndex + 6) % 7]; // JS Sunday=0, we want Monday=0
  const todayBookings = bookings.filter(b => b.day === todayName);
  const upcomingBookings = bookings
    .sort((a, b) => {
      const dayDiff = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Music className="h-8 w-8 text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Welcome to MusicBook — your lesson scheduling hub</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Lessons</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Availability Slots</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availability.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/availability">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <h3 className="font-semibold">Set Availability</h3>
                <p className="text-sm text-muted-foreground">Configure your weekly schedule</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/students">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <h3 className="font-semibold">Manage Students</h3>
                <p className="text-sm text-muted-foreground">Add or edit student info</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/schedule">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <h3 className="font-semibold">Book a Lesson</h3>
                <p className="text-sm text-muted-foreground">Find matching slots & book</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Lessons ({todayName})</CardTitle>
        </CardHeader>
        <CardContent>
          {todayBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No lessons scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todayBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div>
                    <span className="font-medium">{booking.studentName}</span>
                    <span className="text-muted-foreground text-sm ml-2">({booking.instrument})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{booking.startTime} – {booking.endTime}</Badge>
                    {booking.recurring && <Badge>Recurring</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Bookings</CardTitle>
          <Link href="/bookings">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm italic">No bookings yet. <Link href="/schedule" className="text-primary underline">Schedule a lesson</Link></p>
          ) : (
            <div className="space-y-2">
              {upcomingBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <span className="font-medium">{booking.studentName}</span>
                    <span className="text-muted-foreground text-sm ml-2">• {booking.instrument}</span>
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
