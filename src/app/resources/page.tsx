'use client';

import { useState, useEffect, useRef } from 'react';
import { useRole } from '@/lib/role-context';
import { getResources, addResource, deleteResource, getStudents, getInstructors } from '@/lib/store';
import { Resource, ALL_INSTRUMENTS } from '@/lib/types';
import { FileText, Image as ImageIcon, FileType, Plus, Trash2, Download, X, Eye, AlertTriangle } from 'lucide-react';

const TYPE_BADGE: Record<Resource['type'], { label: string; cls: string }> = {
  pdf: { label: 'PDF', cls: 'bg-red-600/20 text-red-400' },
  image: { label: 'Image', cls: 'bg-blue-600/20 text-blue-400' },
  text: { label: 'Text', cls: 'bg-green-600/20 text-green-400' },
};

export default function ResourcesPage() {
  const { role, profileId } = useRole();
  const [resources, setResources] = useState<Resource[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [viewResource, setViewResource] = useState<Resource | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setResources(getResources());
  }, [refresh]);

  const students = getStudents();
  const instructors = getInstructors();

  // Filter resources based on role
  const visible = resources.filter(r => {
    if (role === 'admin') return true;
    if (role === 'instructor') return r.uploadedBy === profileId;
    // student
    return r.assignedTo.length === 0 || r.assignedTo.includes(profileId || '');
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = (id: string) => {
    if (!confirm('Delete this resource?')) return;
    deleteResource(id);
    setRefresh(r => r + 1);
  };

  const canDelete = (r: Resource) => role === 'admin' || (role === 'instructor' && r.uploadedBy === profileId);

  const handleView = (r: Resource) => {
    if (r.type === 'pdf') {
      // Convert base64 data URL to blob and open
      const byteString = atob(r.data.split(',')[1]);
      const mimeString = r.data.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: mimeString });
      window.open(URL.createObjectURL(blob), '_blank');
    } else {
      setViewResource(r);
    }
  };

  const handleDownload = (r: Resource) => {
    const a = document.createElement('a');
    a.href = r.data;
    a.download = r.fileName || r.title;
    a.click();
  };

  const studentName = (id: string) => students.find(s => s.id === id)?.name || id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Resources</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === 'student' ? 'Materials shared by your instructors' : 'Share materials with students'}
          </p>
        </div>
        {(role === 'instructor' || role === 'admin') && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Upload Resource
          </button>
        )}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No resources yet</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(r => {
          const badge = TYPE_BADGE[r.type];
          return (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{r.title}</h3>
                  {r.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>}
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badge.cls}`}>{badge.label}</span>
              </div>
              {role !== 'student' && (
                <p className="text-xs text-muted-foreground">
                  By: {r.uploadedByName} · {r.assignedTo.length === 0 ? 'All Students' : r.assignedTo.map(studentName).join(', ')}
                </p>
              )}
              {role === 'student' && (
                <p className="text-xs text-muted-foreground">From: {r.uploadedByName}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {r.instrument && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">{r.instrument}</span>}
                <span className="ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 pt-1 border-t border-border">
                <button onClick={() => handleView(r)} className="flex items-center gap-1 text-xs text-primary hover:underline"><Eye className="h-3 w-3" /> View</button>
                {r.type !== 'text' && (
                  <button onClick={() => handleDownload(r)} className="flex items-center gap-1 text-xs text-primary hover:underline"><Download className="h-3 w-3" /> Download</button>
                )}
                {canDelete(r) && (
                  <button onClick={() => handleDelete(r.id)} className="flex items-center gap-1 text-xs text-red-400 hover:underline ml-auto"><Trash2 className="h-3 w-3" /> Delete</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <UploadModal
          profileId={profileId}
          instructors={instructors}
          students={students}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); setRefresh(r => r + 1); }}
        />
      )}

      {/* View Modal (image/text) */}
      {viewResource && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setViewResource(null)}>
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewResource(null)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            <h2 className="text-lg font-bold mb-4">{viewResource.title}</h2>
            {viewResource.type === 'image' && (
              <img src={viewResource.data} alt={viewResource.title} className="max-w-full rounded-lg" />
            )}
            {viewResource.type === 'text' && (
              <div className="whitespace-pre-wrap text-sm bg-muted/30 rounded-lg p-4">{viewResource.data}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UploadModal({ profileId, instructors, students, onClose, onSaved }: {
  profileId: string | null;
  instructors: { id: string; name: string }[];
  students: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Resource['type']>('pdf');
  const [textContent, setTextContent] = useState('');
  const [fileData, setFileData] = useState('');
  const [fileName, setFileName] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [instrument, setInstrument] = useState('');
  const [sizeWarning, setSizeWarning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const instructor = instructors.find(i => i.id === profileId);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSizeWarning(file.size > 4 * 1024 * 1024);
    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result as string);
      setFileName(file.name);
      setMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (type !== 'text' && !fileData) return;
    if (type === 'text' && !textContent.trim()) return;

    const resource: Resource = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      type,
      data: type === 'text' ? textContent : fileData,
      fileName: type !== 'text' ? fileName : undefined,
      mimeType: type !== 'text' ? mimeType : undefined,
      uploadedBy: profileId || '',
      uploadedByName: instructor?.name || 'Unknown',
      assignedTo,
      instrument: instrument || undefined,
      createdAt: new Date().toISOString(),
    };
    addResource(resource);
    onSaved();
  };

  const toggleStudent = (id: string) => {
    setAssignedTo(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl max-w-lg w-full max-h-[85vh] overflow-auto p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        <h2 className="text-lg font-bold mb-4">Upload Resource</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <div className="flex gap-2 mt-1">
              {(['pdf', 'image', 'text'] as const).map(t => (
                <button key={t} onClick={() => { setType(t); setFileData(''); setFileName(''); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${type === t ? 'border-primary bg-primary/20 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                  {t === 'pdf' ? 'PDF' : t === 'image' ? 'Image' : 'Text Note'}
                </button>
              ))}
            </div>
          </div>

          {type !== 'text' ? (
            <div>
              <label className="text-xs font-medium text-muted-foreground">{type === 'pdf' ? 'PDF File' : 'Image File'}</label>
              <input ref={fileRef} type="file" accept={type === 'pdf' ? '.pdf' : '.jpg,.jpeg,.png,.gif,.webp'} onChange={handleFile} className="w-full mt-1 text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary/20 file:text-primary file:text-xs file:font-semibold" />
              {fileName && <p className="text-xs text-muted-foreground mt-1">{fileName}</p>}
              {sizeWarning && (
                <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> File exceeds 4MB — may cause localStorage issues</p>
              )}
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Content *</label>
              <textarea value={textContent} onChange={e => setTextContent(e.target.value)} rows={5} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm focus:outline-none focus:border-primary resize-y" />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground">Assign To</label>
            <div className="mt-1 max-h-32 overflow-auto border border-border rounded-lg p-2 space-y-1">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={assignedTo.length === 0} onChange={() => setAssignedTo([])} className="rounded" />
                <span className="font-medium">All Students</span>
              </label>
              {students.map(s => (
                <label key={s.id} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={assignedTo.includes(s.id)} onChange={() => toggleStudent(s.id)} className="rounded" />
                  {s.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Instrument (optional)</label>
            <select value={instrument} onChange={e => setInstrument(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm focus:outline-none focus:border-primary">
              <option value="">None</option>
              {ALL_INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <button onClick={handleSubmit} disabled={!title.trim() || (type !== 'text' && !fileData) || (type === 'text' && !textContent.trim())} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Upload Resource
          </button>
        </div>
      </div>
    </div>
  );
}
