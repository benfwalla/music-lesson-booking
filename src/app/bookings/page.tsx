'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBookings, deleteBooking } from '@/lib/store';
import { exportBookingsToExcel } from '@/lib/excel';
import { Booking, DAYS_OF_WEEK } from '@/lib/types';
import { BookOpen, Download, Trash2, Music, RefreshCw } from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookingsList] = useState<Booking[]>([]);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    setBookingsList(getBookings());
  }, []);

  const refresh = () => setBookingsList(getBookings());

  const handleDelete = (id: string) => {
    if (confirm('Delete this booking?')) {
      deleteBooking(id);
      refresh();
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    const dayDiff = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });

  const calendarData = DAYS_OF_WEEK.map(day => ({
    day,
    bookings: sortedBookings.filter(b => b.day === day),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Bookings
          </h1>
          <p className="text-muted-foreground mt-1">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            List
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('calendar')}
          >
            Calendar
          </Button>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => exportBookingsToExcel(bookings)}
            disabled={bookings.length === 0}
          >
            <Download className="h-4 w-4 mr-2" /> Export Excel
          </Button>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No bookings yet</h3>
            <p className="text-muted-foreground">Go to <a href="/schedule" className="text-primary underline">Schedule</a> to book lessons</p>
          </CardContent>
        </Card>
      ) : view === 'list' ? (
        <div className="grid gap-3">
          {sortedBookings.map(booking => (
            <Card key={booking.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{booking.studentName}</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.instrument && <>{booking.instrument} • </>}
                      {booking.notes && <>{booking.notes} • </>}
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{booking.day}</Badge>
                  <Badge variant="secondary">{booking.startTime} – {booking.endTime}</Badge>
                  {booking.recurring && <Badge>Weekly</Badge>}
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(booking.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {calendarData.map(({ day, bookings: dayBookings }) => (
            <Card key={day} className="min-h-[150px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{day.slice(0, 3)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {dayBookings.map(booking => (
                  <div key={booking.id} className="p-2 rounded bg-primary/10 text-xs space-y-0.5">
                    <div className="font-medium truncate">{booking.studentName}</div>
                    <div className="text-muted-foreground">{booking.startTime}–{booking.endTime}</div>
                  </div>
                ))}
                {dayBookings.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Free</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
