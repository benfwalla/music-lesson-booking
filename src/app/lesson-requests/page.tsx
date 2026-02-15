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

  useEffect(() => { setRequests(getLessonRequests()); }, []);

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
          {pendingCount > 0 && <Badge className="bg-yellow-600/20 text-yellow-400 ml-2">{pendingCount} pending</Badge>}
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
        <div className="rounded-xl border border-border overflow-hidden">
          {filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((req, idx) => {
            const slots = req.preferredSlots || [];
            return (
              <div key={req.id}
                className={`px-4 py-4 hover:bg-[#1a1708] transition-colors space-y-3 ${idx < filtered.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{req.studentName}</span>
                      <Badge className={`${STATUS_STYLES[req.status]} text-[11px]`}>{req.status}</Badge>
                      <a href={`tel:${req.studentPhone}`} className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold">
                        <Phone className="h-3 w-3" /> {req.studentPhone}
                      </a>
                      <a href={`mailto:${req.studentEmail}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                        <Mail className="h-3 w-3" /> {req.studentEmail}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 flex-wrap">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{req.instructorName}</span>
                    <span className="flex items-center gap-1"><Music className="h-3 w-3" />{req.instrument}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{req.preferredDuration}min</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Calendar className="h-3 w-3" />
                      {slots.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">{s.day.slice(0, 3)} {s.time}</Badge>
                      ))}
                    </div>
                    <span className="text-[11px]">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {req.notes && (
                  <div className="flex items-start gap-1.5 text-xs bg-muted/50 rounded-lg px-2 py-1.5">
                    <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{req.notes}</span>
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Admin notes (optional)..."
                      value={adminNotesMap[req.id] || ''}
                      onChange={e => setAdminNotesMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                      className="flex-1 h-8 text-sm"
                    />
                    <Button size="sm" onClick={() => handleAction(req.id, 'approved')} className="bg-green-700 hover:bg-green-600 h-8 text-xs">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(req.id, 'denied')} className="text-red-400 border-red-600/50 hover:bg-red-600/10 h-8 text-xs">
                      Deny
                    </Button>
                  </div>
                )}

                {req.adminNotes && req.status !== 'pending' && (
                  <p className="text-xs text-muted-foreground italic">Admin: {req.adminNotes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
