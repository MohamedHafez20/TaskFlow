import { useEffect, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import usePageTitle from '../hooks/usePageTitle';
import { useToast } from '../components/Ui/ToastProvider';
import api from '../api/axios';

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const isoToLocalDatetime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const NOTES_FALLBACK_KEY = 'taskflow-notes-fallback';

const readFallbackNotes = () => {
  try {
    const raw = localStorage.getItem(NOTES_FALLBACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeFallbackNotes = (notes) => {
  try {
    localStorage.setItem(NOTES_FALLBACK_KEY, JSON.stringify(notes));
  } catch {
    // ignore storage errors
  }
};

// Map a note document from the API to the shape this page renders.
const mapNote = (n) => ({
  id: n._id,
  title: n.title,
  content: n.content,
  tags: n.tags || [],
  noteDate: n.noteDate || null,
  createdAt: n.createdAt,
  lastEdited: n.updatedAt || n.createdAt,
});

export default function BrainDump() {
  usePageTitle('Notes');
  const { showToast } = useToast();

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [noteDate, setNoteDate] = useState('');

  // load notes
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get('/notes');
        if (active && Array.isArray(data)) {
          const nextNotes = data.map(mapNote);
          setNotes(nextNotes);
          writeFallbackNotes(nextNotes);
        }
      } catch (err) {
        console.error('Failed to load notes', err);
        const fallbackNotes = readFallbackNotes();
        if (active && fallbackNotes.length > 0) {
          setNotes(fallbackNotes);
        } else {
          showToast(err.response?.data?.message || 'Failed to load notes', 'error');
        }
      }
    })();
    return () => { active = false; };
  }, [showToast]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTagsText('');
    setEditingId(null);
    setNoteDate('');
  };

  const handleSave = async () => {
    const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean);
    if (!title.trim() && !content.trim()) {
      showToast('Please add a title or content', 'error');
      return;
    }
    const scheduled = noteDate ? new Date(noteDate).toISOString() : null;
    const payload = { title: title.trim() || 'Untitled', content: content.trim(), tags, noteDate: scheduled };

    try {
      if (editingId) {
        const { data } = await api.put(`/notes/${editingId}`, payload);
        const mapped = mapNote(data);
        const nextNotes = notes.map((n) => (n.id === editingId ? mapped : n));
        setNotes(nextNotes);
        writeFallbackNotes(nextNotes);
        showToast('Note updated', 'success');
      } else {
        const { data } = await api.post('/notes', payload);
        const nextNotes = [mapNote(data), ...notes];
        setNotes(nextNotes);
        writeFallbackNotes(nextNotes);
        showToast('Note created', 'success');
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save note', err);
      const fallbackNotes = editingId
        ? notes.map((n) => (n.id === editingId ? { ...n, title: payload.title, content: payload.content, tags: payload.tags, noteDate: payload.noteDate, lastEdited: new Date().toISOString() } : n))
        : [{ id: `local-${Date.now()}`, title: payload.title, content: payload.content, tags: payload.tags, noteDate: payload.noteDate, createdAt: new Date().toISOString(), lastEdited: new Date().toISOString() }, ...notes];
      setNotes(fallbackNotes);
      writeFallbackNotes(fallbackNotes);
      showToast(err.response?.data?.message || 'Saved locally for now', 'error');
    }
  };

  const handleOpenForm = () => {
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTagsText(note.tags?.join(', ') || '');
    setNoteDate(note.noteDate ? isoToLocalDatetime(note.noteDate) : '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    // perform deletion (called after inline confirm)
    try {
      await api.delete(`/notes/${id}`);
      const nextNotes = notes.filter((n) => n.id !== id);
      setNotes(nextNotes);
      writeFallbackNotes(nextNotes);
      showToast('Note deleted', 'success');
      if (editingId === id) resetForm();
    } catch (err) {
      console.error('Failed to delete note', err);
      const nextNotes = notes.filter((n) => n.id !== id);
      setNotes(nextNotes);
      writeFallbackNotes(nextNotes);
      showToast(err.response?.data?.message || 'Deleted locally for now', 'error');
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-lg border border-white/10 bg-card/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Notes</h1>
              <p className="text-sm text-muted">A simple place to capture and revisit your notes.</p>
            </div>
            <div className="text-sm text-muted">{notes.length} notes</div>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted">{notes.length} notes</div>
          <button
            onClick={handleOpenForm}
            className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white"
          >
            <FaPlus /> Create note
          </button>
        </div>

        {showForm && (
          <section className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-md border border-white/10 bg-card/95 px-3 py-2 text-sm outline-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="datetime-local"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-card/95 px-3 py-2 text-sm outline-none"
                  placeholder="Optional date"
                />
                <input
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="Tags (comma separated)"
                  className="w-full rounded-md border border-white/10 bg-card/95 px-3 py-2 text-sm outline-none"
                />
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note..."
                rows={6}
                className="w-full rounded-md border border-white/10 bg-card/95 px-3 py-2 text-sm outline-none resize-none"
              />

              <div className="flex items-center gap-2">
                <button onClick={() => { handleSave(); }} className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white">
                  <FaPlus /> {editingId ? 'Update note' : 'Create note'}
                </button>
                <button onClick={() => { resetForm(); setShowForm(false); }} className="rounded-md bg-white/5 px-3 py-2 text-sm">Cancel</button>
              </div>
            </div>
          </section>
        )}

        <section>
          {notes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-muted">No notes yet — click Create note to start.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {notes.map((note) => (
                <article key={note.id} className="rounded-lg border border-white/10 bg-white/5 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-ink truncate">{note.title}</h3>
                        <p className="mt-2 text-sm text-muted line-clamp-3">{note.content || '—'}</p>
                        {note.noteDate && (
                          <div className="mt-2 text-xs text-purple-300">Scheduled: {formatDate(note.noteDate)}</div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2 text-xs text-muted">
                      <span>{formatDate(note.lastEdited)}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(note)} className="text-sm text-ink hover:underline">Edit</button>
                        {pendingDeleteId === note.id ? (
                          <div className="inline-flex items-center gap-2 bg-white/5 rounded-md px-2 py-1">
                            <button onClick={() => handleDelete(note.id)} className="text-sm text-rose-400 font-semibold">Confirm</button>
                            <button onClick={() => setPendingDeleteId(null)} className="text-sm text-muted">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => { setPendingDeleteId(note.id); setTimeout(() => { if (pendingDeleteId === note.id) setPendingDeleteId(null); }, 4000); }} className="text-sm text-rose-400 hover:underline flex items-center gap-2"><FaTrash /> Delete</button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(note.tags || []).slice(0, 5).map((t) => (
                      <span key={t} className="rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-300">#{t}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
