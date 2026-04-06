import {useState, useEffect} from 'react';
import {
  adminLogin,
  isAdminLoggedIn,
  setAdminLoggedIn,
  getVideos,
  saveVideos,
  getEvents,
  saveEvents,
  type AdminVideo,
  type AdminEvent,
} from '../lib/admin-data';

/* ─── Login form ─── */
function LoginForm({onLogin}: {onLogin: () => void}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (adminLogin(username, password)) {
      setAdminLoggedIn(true);
      onLogin();
    } else {
      setError('Invalid credentials');
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-2xl font-extrabold text-brand-gray text-center">Admin Login</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium text-brand-gray">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-brand-gray">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-red px-6 py-2.5 font-bold text-white transition hover:bg-brand-red-dark"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

/* ─── Events Manager ─── */
function EventsManager() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [form, setForm] = useState({name: '', date: '', location: '', description: ''});

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  function openNew() {
    setEditing(null);
    setForm({name: '', date: '', location: '', description: ''});
  }

  function openEdit(event: AdminEvent) {
    setEditing(event);
    setForm({name: event.name, date: event.date, location: event.location, description: event.description});
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.date.trim()) return;

    let updated: AdminEvent[];
    if (editing) {
      updated = events.map((ev) =>
        ev.id === editing.id ? {...ev, ...form} : ev,
      );
    } else {
      const newEvent: AdminEvent = {
        id: `e_${Date.now()}`,
        ...form,
      };
      updated = [...events, newEvent];
    }
    setEvents(updated);
    saveEvents(updated);
    setForm({name: '', date: '', location: '', description: ''});
    setEditing(null);
  }

  function handleDelete(id: string) {
    const updated = events.filter((ev) => ev.id !== id);
    setEvents(updated);
    saveEvents(updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-gray">Events</h2>
        <button
          onClick={openNew}
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red-dark"
        >
          + Add Event
        </button>
      </div>

      {/* Form */}
      {(editing !== null || form.name !== '' || form.date !== '' || form.location !== '' || form.description !== '') ? null : null}
      <form onSubmit={handleSave} className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-brand-gray">{editing ? 'Edit Event' : 'New Event'}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Event Name *"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            required
          />
          <input
            placeholder="Date (e.g. June 22–25, 2026) *"
            value={form.date}
            onChange={(e) => setForm({...form, date: e.target.value})}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            required
          />
        </div>
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({...form, location: e.target.value})}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
          rows={2}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red-dark">
            {editing ? 'Update' : 'Add'}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm({name: '', date: '', location: '', description: ''}); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="mt-4 space-y-2">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-brand-gray">{event.name}</p>
              <p className="text-xs text-gray-500">{event.date} — {event.location}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(event)} className="text-xs font-semibold text-brand-red hover:underline">Edit</button>
              <button onClick={() => handleDelete(event.id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Videos Manager ─── */
function VideosManager() {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [editing, setEditing] = useState<AdminVideo | null>(null);
  const [form, setForm] = useState({title: '', youtubeId: ''});

  useEffect(() => {
    setVideos(getVideos());
  }, []);

  function extractYoutubeId(input: string): string {
    // Accept full YouTube URLs or just the ID
    const match = input.match(/(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : input.trim();
  }

  function openNew() {
    setEditing(null);
    setForm({title: '', youtubeId: ''});
  }

  function openEdit(video: AdminVideo) {
    setEditing(video);
    setForm({title: video.title, youtubeId: video.youtubeId});
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.youtubeId.trim()) return;

    const ytId = extractYoutubeId(form.youtubeId);

    let updated: AdminVideo[];
    if (editing) {
      updated = videos.map((v) =>
        v.id === editing.id
          ? {...v, title: form.title, youtubeId: ytId, thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
          : v,
      );
    } else {
      const newVideo: AdminVideo = {
        id: `v_${Date.now()}`,
        title: form.title,
        youtubeId: ytId,
        thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
      };
      updated = [...videos, newVideo];
    }
    setVideos(updated);
    saveVideos(updated);
    setForm({title: '', youtubeId: ''});
    setEditing(null);
  }

  function handleDelete(id: string) {
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    saveVideos(updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-gray">Videos</h2>
        <button
          onClick={openNew}
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red-dark"
        >
          + Add Video
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-brand-gray">{editing ? 'Edit Video' : 'New Video'}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Video Title *"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            required
          />
          <input
            placeholder="YouTube URL or Video ID *"
            value={form.youtubeId}
            onChange={(e) => setForm({...form, youtubeId: e.target.value})}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            required
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red-dark">
            {editing ? 'Update' : 'Add'}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm({title: '', youtubeId: ''}); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {videos.map((video) => (
          <div key={video.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
            <img src={video.thumbnail} alt={video.title} className="h-16 w-24 rounded object-cover flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-brand-gray">{video.title}</p>
              <p className="text-xs text-gray-400">{video.youtubeId}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => openEdit(video)} className="text-xs font-semibold text-brand-red hover:underline">Edit</button>
              <button onClick={() => handleDelete(video.id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Admin Page ─── */
export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState<'events' | 'videos'>('events');

  useEffect(() => {
    setLoggedIn(isAdminLoggedIn());
  }, []);

  if (!loggedIn) {
    return <LoginForm onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-gray">Admin Dashboard</h1>
        <button
          onClick={() => {
            setAdminLoggedIn(false);
            setLoggedIn(false);
          }}
          className="text-sm font-semibold text-gray-500 hover:text-brand-red"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setTab('events')}
          className={`px-4 py-2 text-sm font-semibold transition ${
            tab === 'events'
              ? 'border-b-2 border-brand-red text-brand-red'
              : 'text-gray-500 hover:text-brand-gray'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setTab('videos')}
          className={`px-4 py-2 text-sm font-semibold transition ${
            tab === 'videos'
              ? 'border-b-2 border-brand-red text-brand-red'
              : 'text-gray-500 hover:text-brand-gray'
          }`}
        >
          Videos
        </button>
      </div>

      <div className="mt-6">
        {tab === 'events' ? <EventsManager /> : <VideosManager />}
      </div>
    </div>
  );
}
