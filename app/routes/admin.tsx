import {useState, useMemo, useEffect} from 'react';
import {
  adminLogin,
  isAdminLoggedIn,
  setAdminLoggedIn,
  getVideos,
  saveVideos,
  getEvents,
  saveEvents,
  getEventTypeLabel,
  getEventTypeColor,
  formatEventDate,
  getAttendees,
  getAttendeesByEvent,
  type AdminVideo,
  type AdminEvent,
  type EventAttendee,
  type EventType,
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
  const [form, setForm] = useState({
    name: '',
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    imageUrl: '',
    registrationUrl: '',
    eventType: 'trade-show' as AdminEvent['eventType'],
  });

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const [expandedAttendees, setExpandedAttendees] = useState<Record<string, boolean>>({});
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');

  const filteredEvents = typeFilter === 'all' ? events : events.filter((e) => e.eventType === typeFilter);

  function toggleAttendees(eventId: string) {
    setExpandedAttendees((prev) => ({...prev, [eventId]: !prev[eventId]}));
  }

  function resetForm() {
    setForm({
      name: '',
      date: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      description: '',
      imageUrl: '',
      registrationUrl: '',
      eventType: 'trade-show',
    });
    setEditing(null);
  }

  function openNew() {
    resetForm();
  }

  function openEdit(event: AdminEvent) {
    setEditing(event);
    setForm({
      name: event.name,
      date: event.date,
      endDate: event.endDate ?? '',
      startTime: event.startTime ?? '',
      endTime: event.endTime ?? '',
      location: event.location,
      description: event.description,
      imageUrl: event.imageUrl ?? '',
      registrationUrl: event.registrationUrl ?? '',
      eventType: event.eventType,
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.date.trim()) return;

    const eventData = {
      name: form.name,
      date: form.date,
      endDate: form.endDate || undefined,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      location: form.location,
      description: form.description,
      imageUrl: form.imageUrl || undefined,
      registrationUrl: form.registrationUrl || undefined,
      eventType: form.eventType,
    };

    let updated: AdminEvent[];
    if (editing) {
      updated = events.map((ev) =>
        ev.id === editing.id ? {...ev, ...eventData} : ev,
      );
    } else {
      updated = [...events, {id: `e_${Date.now()}`, ...eventData}];
    }
    setEvents(updated);
    saveEvents(updated);
    resetForm();
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
      <form onSubmit={handleSave} className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
        <p className="text-sm font-semibold text-brand-gray">{editing ? 'Edit Event' : 'New Event'}</p>

        {/* Row 1: Name + Type */}
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Event Name *"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            required
          />
          <select
            value={form.eventType}
            onChange={(e) => setForm({...form, eventType: e.target.value as AdminEvent['eventType']})}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          >
            <option value="trade-show">Trade Show</option>
            <option value="workshop">Workshop</option>
            <option value="webinar">Webinar</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Row 2: Dates + Times */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Start Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({...form, date: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({...form, endDate: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Start Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({...form, startTime: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">End Time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({...form, endTime: e.target.value})}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>
        </div>

        {/* Row 3: Location */}
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({...form, location: e.target.value})}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />

        {/* Row 4: Description */}
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
          rows={2}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />

        {/* Row 5: URLs */}
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm({...form, imageUrl: e.target.value})}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
          <input
            placeholder="Registration URL (optional)"
            value={form.registrationUrl}
            onChange={(e) => setForm({...form, registrationUrl: e.target.value})}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red-dark">
            {editing ? 'Update' : 'Add'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Type Filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(['all', 'trade-show', 'workshop', 'webinar', 'other'] as const).map((type) => {
          const isActive = typeFilter === type;
          const label = type === 'all' ? 'All' : getEventTypeLabel(type);
          const color = type === 'all' ? null : getEventTypeColor(type);
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                isActive
                  ? type === 'all'
                    ? 'bg-brand-gray text-white'
                    : `${color!.bg} ${color!.text} ring-1 ring-current`
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="mt-4 space-y-2">
        {filteredEvents.map((event) => {
          const typeColor = getEventTypeColor(event.eventType);
          const attendees = getAttendeesByEvent(event.id);
          const isExpanded = expandedAttendees[event.id] ?? false;
          return (
            <div key={event.id} className="rounded-lg border border-gray-200">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${typeColor.bg} ${typeColor.text}`}>
                    {getEventTypeLabel(event.eventType)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-brand-gray">{event.name}</p>
                    <p className="text-xs text-gray-500">{formatEventDate(event.date, event.endDate)} — {event.location}</p>
                    <button
                      onClick={() => toggleAttendees(event.id)}
                      className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 hover:text-brand-gray transition"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {attendees.length > 0 ? `${attendees.length} attendee${attendees.length !== 1 ? 's' : ''}` : 'No registrations yet'}
                      <svg className={`h-3 w-3 transition ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(event)} className="text-xs font-semibold text-brand-red hover:underline">Edit</button>
                  <button onClick={() => handleDelete(event.id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  {attendees.length === 0 ? (
                    <p className="text-center text-sm italic text-gray-400">No registrations yet</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs font-semibold uppercase text-gray-400">
                          <th className="pb-2">Name</th>
                          <th className="pb-2">Email</th>
                          <th className="pb-2">Company</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendees.map((att) => (
                          <tr key={att.id} className="border-t border-gray-100">
                            <td className="py-1.5 text-brand-gray">{att.name}</td>
                            <td className="py-1.5 text-gray-600">{att.email}</td>
                            <td className="py-1.5 text-gray-600">{att.company}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
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

/* ─── Contacts Manager ─── */
function ContactsManager() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [search, setSearch] = useState('');
  const [contactTypeFilter, setContactTypeFilter] = useState<EventType | 'all'>('all');

  useEffect(() => {
    setEvents(getEvents());
    setAttendees(getAttendees());
  }, []);

  const eventsById = useMemo(() => {
    const map = new Map<string, AdminEvent>();
    for (const ev of events) map.set(ev.id, ev);
    return map;
  }, [events]);

  // Deduplicate by email, aggregate event data
  const contacts = useMemo(() => {
    const map = new Map<string, {
      name: string;
      email: string;
      company: string;
      eventNames: string[];
      eventTypes: Set<string>;
      lastRegistered: string;
    }>();

    for (const att of attendees) {
      const key = att.email.toLowerCase();
      const ev = eventsById.get(att.eventId);
      const eventName = ev?.name ?? 'Unknown Event';
      const eventType = ev ? getEventTypeLabel(ev.eventType) : 'Unknown';

      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.eventNames.push(eventName);
        existing.eventTypes.add(eventType);
        if (att.registeredAt > existing.lastRegistered) {
          existing.lastRegistered = att.registeredAt;
        }
      } else {
        map.set(key, {
          name: att.name,
          email: att.email,
          company: att.company,
          eventNames: [eventName],
          eventTypes: new Set([eventType]),
          lastRegistered: att.registeredAt,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.lastRegistered.localeCompare(a.lastRegistered));
  }, [attendees, eventsById]);

  const filtered = contacts.filter((c) => {
    if (contactTypeFilter !== 'all') {
      const label = getEventTypeLabel(contactTypeFilter);
      if (!c.eventTypes.has(label)) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q) && !c.company.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-gray">
          Contacts
          <span className="ml-2 text-sm font-normal text-gray-400">({contacts.length} total)</span>
        </h2>
        <input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />
      </div>

      {/* Type Filter */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(['all', 'trade-show', 'workshop', 'webinar', 'other'] as const).map((type) => {
          const isActive = contactTypeFilter === type;
          const label = type === 'all' ? 'All' : getEventTypeLabel(type);
          const color = type === 'all' ? null : getEventTypeColor(type);
          return (
            <button
              key={type}
              onClick={() => setContactTypeFilter(type)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                isActive
                  ? type === 'all'
                    ? 'bg-brand-gray text-white'
                    : `${color!.bg} ${color!.text} ring-1 ring-current`
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm italic text-gray-400">
          {search || contactTypeFilter !== 'all' ? 'No contacts match your filters.' : 'No contacts yet. Attendees will appear here when they register for events.'}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase text-gray-400 border-b border-gray-200">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Company</th>
                <th className="pb-3 pr-4">Event Types</th>
                <th className="pb-3 pr-4">Events Registered</th>
                <th className="pb-3">Last Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <tr key={contact.email} className="border-t border-gray-100">
                  <td className="py-2.5 pr-4 font-medium text-brand-gray">{contact.name}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{contact.email}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{contact.company}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.from(contact.eventTypes).map((type) => (
                        <span key={type} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex flex-col gap-0.5">
                      {contact.eventNames.map((name, i) => (
                        <span key={i} className="text-xs text-gray-500">{name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 text-xs text-gray-400">
                    {new Date(contact.lastRegistered).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Admin Page ─── */
export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState<'events' | 'videos' | 'contacts'>('events');

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
        <button
          onClick={() => setTab('contacts')}
          className={`px-4 py-2 text-sm font-semibold transition ${
            tab === 'contacts'
              ? 'border-b-2 border-brand-red text-brand-red'
              : 'text-gray-500 hover:text-brand-gray'
          }`}
        >
          Contacts
        </button>
      </div>

      <div className="mt-6">
        {tab === 'events' && <EventsManager />}
        {tab === 'videos' && <VideosManager />}
        {tab === 'contacts' && <ContactsManager />}
      </div>
    </div>
  );
}
