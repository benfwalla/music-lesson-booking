'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRole } from '@/lib/role-context';
import { getAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/lib/store';
import { Announcement } from '@/lib/types';
import { Megaphone, Plus, Pencil, Trash2, CalendarDays, PartyPopper } from 'lucide-react';

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(i); }, []);
  const target = new Date(targetDate + 'T00:00:00');
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return <span className="text-muted-foreground text-sm">Event has passed</span>;
  if (diffDays === 0) return <span className="text-lg font-bold text-primary animate-pulse">🎉 Today is the day!</span>;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm">
      <PartyPopper className="h-4 w-4" />{diffDays} day{diffDays !== 1 ? 's' : ''} to go!
    </span>
  );
}

function AnnouncementForm({ announcement, onSave, onCancel }: { announcement?: Announcement; onSave: (a: Announcement) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(announcement?.title || '');
  const [body, setBody] = useState(announcement?.body || '');
  const [type, setType] = useState<'general' | 'recital'>(announcement?.type || 'general');
  const [recitalDate, setRecitalDate] = useState(announcement?.recitalDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onSave({
      id: announcement?.id || crypto.randomUUID(),
      title: title.trim(), body: body.trim(), type,
      recitalDate: type === 'recital' ? recitalDate : undefined,
      createdAt: announcement?.createdAt || now, updatedAt: now,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label>Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
      <div>
        <Label>Body</Label>
        <textarea value={body} onChange={e => setBody(e.target.value)}
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>
      <div>
        <Label>Type</Label>
        <div className="flex gap-2 mt-1">
          {(['general', 'recital'] as const).map(t => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors capitalize ${type === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
              {t === 'recital' ? '🎵 Recital' : '📢 General'}
            </button>
          ))}
        </div>
      </div>
      {type === 'recital' && (
        <div><Label>Recital Date *</Label><Input type="date" value={recitalDate} onChange={e => setRecitalDate(e.target.value)} required /></div>
      )}
      <div className="flex gap-2 pt-4 border-t">
        <Button type="submit">{announcement ? 'Update' : 'Post'} Announcement</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function AnnouncementsPage() {
  const { role } = useRole();
  const isAdmin = role === 'admin';
  const [announcements, setAnnouncementsList] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  useEffect(() => {
    setAnnouncementsList(getAnnouncements().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const refresh = () => setAnnouncementsList(getAnnouncements().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

  const handleSave = (a: Announcement) => {
    if (editing) updateAnnouncement(a); else addAnnouncement(a);
    refresh(); setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => { if (confirm('Delete this announcement?')) { deleteAnnouncement(id); refresh(); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Megaphone className="h-8 w-8 text-primary" /> Announcements</h1>
          <p className="text-muted-foreground mt-1">News, events, and recital updates</p>
        </div>
        {isAdmin && (
          <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditing(null); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> New Announcement</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? 'Edit' : 'New'} Announcement</DialogTitle></DialogHeader>
              <AnnouncementForm announcement={editing || undefined} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {announcements.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No announcements yet</h3>
          <p className="text-muted-foreground">{isAdmin ? 'Post your first announcement' : 'Check back later for updates'}</p>
        </CardContent></Card>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {announcements.map((a, idx) => (
            <div key={a.id} className={`px-4 py-3 hover:bg-[#1a1708] transition-colors ${idx < announcements.length - 1 ? 'border-b border-border' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.type === 'recital' ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px]">🎵 Recital</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[11px]">📢 General</Badge>
                    )}
                    <span className="font-semibold text-sm">{a.title}</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(a.createdAt).toLocaleDateString()}
                      {a.updatedAt !== a.createdAt && ` · Updated ${new Date(a.updatedAt).toLocaleDateString()}`}
                    </span>
                  </div>
                  {a.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</p>}
                  {a.type === 'recital' && a.recitalDate && <div className="mt-1"><CountdownTimer targetDate={a.recitalDate} /></div>}
                </div>
                {isAdmin && (
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(a); setShowForm(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(a.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
