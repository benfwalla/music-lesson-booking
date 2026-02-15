'use client';

import { useEffect, useState } from 'react';
import { getLessonRequests, updateLessonRequest } from '@/lib/store';
import { LessonRequest } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ClipboardList, Phone, Mail, User, Music, Clock, Calendar, MessageSquare } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
  approved: 'bg-green-600/20 text-green-400 border-green-600/30',
  denied: 'bg-red-600/20 text-red-400 border-red-600/30',
};

export default function LessonRequestsPage() {
  const [requests, setRequests] = useState<LessonRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');
  const [adminNotesMap, setAdminNotesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setRequests(getLessonRequests());
  }, []);

  const refresh = () => setRequests(getLessonRequests());

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  function handleAction(id: string, status: 'approved' | 'denied') {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    updateLessonRequest({ ...req, status, adminNotes: adminNotesMap[id] || req.adminNotes });
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 page-title">
          <ClipboardList className="h-8 w-8 text-primary" />
          Lesson Requests
          {pendingCount > 0 && (
            <Badge className="bg-yellow-600/20 text-yellow-400 ml-2">{pendingCount} pending</Badge>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">Review and manage student lesson booking requests</p>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'denied'] as const).map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No {filter !== 'all' ? filter : ''} lesson requests</h3>
            <p className="text-muted-foreground mt-1">
              {filter === 'all' ? 'When students request lessons from the instructor directory, they\'ll appear here.' : `No ${filter} requests to show.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(req => (
            <Card key={req.id} className="interactive-card">
              <CardContent className="py-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{req.studentName}</h3>
                      <Badge className={STATUS_STYLES[req.status]}>{req.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <a href={`tel:${req.studentPhone}`} className="flex items-center gap-1.5 text-primary hover:underline font-semibold">
                        <Phone className="h-4 w-4" /> {req.studentPhone}
                      </a>
                      <a href={`mailto:${req.studentEmail}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
                        <Mail className="h-4 w-4" /> {req.studentEmail}
                      </a>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Instructor:</span>
                    <span className="font-medium">{req.instructorName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Music className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{req.instrument}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{req.preferredDuration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{req.preferredDay} {req.preferredTime}</span>
                  </div>
                </div>

                {req.notes && (
                  <div className="flex items-start gap-1.5 text-sm bg-muted/50 rounded-lg p-2">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{req.notes}</span>
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      placeholder="Admin notes (optional)..."
                      value={adminNotesMap[req.id] || ''}
                      onChange={e => setAdminNotesMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                      className="flex-1 h-9 text-sm"
                    />
                    <Button size="sm" onClick={() => handleAction(req.id, 'approved')} className="bg-green-700 hover:bg-green-600">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(req.id, 'denied')} className="text-red-400 border-red-600/50 hover:bg-red-600/10">
                      Deny
                    </Button>
                  </div>
                )}

                {req.adminNotes && req.status !== 'pending' && (
                  <p className="text-xs text-muted-foreground italic">Admin: {req.adminNotes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
