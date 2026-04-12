# Event Calendar Enhancement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat events list with a timeline/agenda view + mini-calendar sidebar, enhance the admin form with richer fields, and add an Admin link to the Interact dropdown.

**Architecture:** Extends three existing files (admin-data.ts, events.tsx, admin.tsx) and creates two new components (MiniCalendar.tsx, EventCard.tsx). One header nav item addition. All data stays in localStorage.

**Tech Stack:** React 18, React Router 7, Tailwind CSS 3, TypeScript

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `app/lib/admin-data.ts` | Modify | Extended AdminEvent interface, new helper functions, migration logic |
| `app/components/MiniCalendar.tsx` | Create | Self-contained mini calendar with event dots and month navigation |
| `app/components/EventCard.tsx` | Create | Presentational event card with date badge, type badge, details |
| `app/routes/events.tsx` | Modify | Timeline layout with month groups, mini-calendar sidebar |
| `app/routes/admin.tsx` | Modify | Enhanced event form with new fields (type, dates, times, URLs) |
| `app/components/Header.tsx` | Modify | Add "Admin" to Interact dropdown children |

---

### Task 1: Extend AdminEvent Data Model and Helpers

**Files:**
- Modify: `app/lib/admin-data.ts`

- [ ] **Step 1: Update the AdminEvent interface and DEFAULT_EVENTS**

Replace the `AdminEvent` interface and `DEFAULT_EVENTS` in `app/lib/admin-data.ts`. Keep everything else in the file unchanged.

Replace lines 8–63 with:

```typescript
export type EventType = 'trade-show' | 'workshop' | 'webinar' | 'other';

export interface AdminEvent {
  id: string;
  name: string;
  date: string;           // ISO date "2026-06-22"
  endDate?: string;       // ISO date for multi-day events
  startTime?: string;     // "09:00" 24h format
  endTime?: string;       // "17:00"
  location: string;
  description: string;
  imageUrl?: string;
  registrationUrl?: string;
  eventType: EventType;
}

const DEFAULT_EVENTS: AdminEvent[] = [
  {
    id: 'e1',
    name: 'ASD Market Week',
    date: '2026-06-22',
    endDate: '2026-06-25',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Las Vegas Convention Center, Las Vegas, NV',
    description: 'The largest consumer merchandise trade show in the US. Visit us at our booth to see the latest scooters, toys, and home products.',
    eventType: 'trade-show',
  },
  {
    id: 'e2',
    name: 'NY NOW Summer Market',
    date: '2026-08-09',
    endDate: '2026-08-12',
    startTime: '09:00',
    endTime: '18:00',
    location: 'Javits Center, New York, NY',
    description: 'Discover our newest product lines and meet the team at one of the premier wholesale gift and home shows on the East Coast.',
    eventType: 'trade-show',
  },
  {
    id: 'e3',
    name: 'Minneapolis Gift Show',
    date: '2026-09-18',
    endDate: '2026-09-19',
    startTime: '10:00',
    endTime: '17:00',
    location: 'Minneapolis Convention Center, Minneapolis, MN',
    description: 'A regional favorite — stop by to explore our full catalog and take advantage of show-exclusive pricing.',
    eventType: 'trade-show',
  },
  {
    id: 'e4',
    name: 'Holiday Buying Market',
    date: '2026-10-14',
    endDate: '2026-10-16',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Dallas Market Center, Dallas, TX',
    description: "Get ahead on holiday inventory. We'll be showcasing our best-selling gift items and seasonal specials.",
    eventType: 'trade-show',
  },
];
```

- [ ] **Step 2: Add helper functions**

Add these functions before the `adminLogin` function (before line 110 in the original file):

```typescript
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatEventDate(date: string, endDate?: string): string {
  const d = new Date(date + 'T00:00:00');
  const month = MONTH_NAMES[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  if (!endDate) return `${month} ${day}, ${year}`;

  const ed = new Date(endDate + 'T00:00:00');
  if (d.getMonth() === ed.getMonth() && d.getFullYear() === ed.getFullYear()) {
    return `${month} ${day}–${ed.getDate()}, ${year}`;
  }
  const endMonth = MONTH_NAMES[ed.getMonth()];
  return `${month} ${day} – ${endMonth} ${ed.getDate()}, ${year}`;
}

export function formatEventTime(startTime?: string, endTime?: string): string | null {
  if (!startTime) return null;
  const format12 = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  if (!endTime) return format12(startTime);
  return `${format12(startTime)} – ${format12(endTime)}`;
}

export function getEventMonthYear(date: string): string {
  const d = new Date(date + 'T00:00:00');
  return `${MONTH_NAMES_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

export function getEventTypeLabel(type: EventType): string {
  const labels: Record<EventType, string> = {
    'trade-show': 'Trade Show',
    workshop: 'Workshop',
    webinar: 'Webinar',
    other: 'Event',
  };
  return labels[type];
}

export function getEventTypeColor(type: EventType): {bg: string; text: string} {
  const colors: Record<EventType, {bg: string; text: string}> = {
    'trade-show': {bg: 'bg-pop-cyan/10', text: 'text-pop-cyan'},
    workshop: {bg: 'bg-pop-green/10', text: 'text-pop-green'},
    webinar: {bg: 'bg-pop-purple/10', text: 'text-pop-purple'},
    other: {bg: 'bg-gray-100', text: 'text-gray-600'},
  };
  return colors[type];
}
```

- [ ] **Step 3: Add migration logic to getEvents()**

Replace the `getEvents` function with this version that detects old-format events and resets:

```typescript
export function getEvents(): AdminEvent[] {
  if (!isBrowser()) return DEFAULT_EVENTS;
  const stored = localStorage.getItem(STORAGE_KEYS.events);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Migration: if first event lacks eventType, it's old format — reset
      if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].eventType) {
        localStorage.removeItem(STORAGE_KEYS.events);
        return DEFAULT_EVENTS;
      }
      return parsed;
    } catch {
      return DEFAULT_EVENTS;
    }
  }
  return DEFAULT_EVENTS;
}
```

- [ ] **Step 4: Verify the dev server still loads without errors**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/`
Expected: `200`

- [ ] **Step 5: Commit**

```bash
git add app/lib/admin-data.ts
git commit -m "feat: extend AdminEvent data model with type, dates, times, URLs"
```

---

### Task 2: Create EventCard Component

**Files:**
- Create: `app/components/EventCard.tsx`

- [ ] **Step 1: Create the EventCard component**

Create `app/components/EventCard.tsx`:

```tsx
import {
  type AdminEvent,
  formatEventDate,
  formatEventTime,
  getEventTypeLabel,
  getEventTypeColor,
} from '~/lib/admin-data';

export function EventCard({event}: {event: AdminEvent}) {
  const typeColor = getEventTypeColor(event.eventType);
  const dateDisplay = formatEventDate(event.date, event.endDate);
  const timeDisplay = formatEventTime(event.startTime, event.endTime);
  const startDate = new Date(event.date + 'T00:00:00');
  const monthAbbr = startDate.toLocaleString('en-US', {month: 'short'}).toUpperCase();
  const dayNum = startDate.getDate();

  return (
    <div className="rounded-xl border border-gray-200 p-5 transition hover:shadow-md">
      <div className="flex gap-4">
        {/* Date badge */}
        <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-brand-red text-white">
          <span className="text-[10px] font-bold uppercase leading-none tracking-wider">
            {monthAbbr}
          </span>
          <span className="text-2xl font-extrabold leading-none">{dayNum}</span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-brand-gray">{event.name}</h3>
            <span
              className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${typeColor.bg} ${typeColor.text}`}
            >
              {getEventTypeLabel(event.eventType)}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            {/* Date range */}
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {dateDisplay}
            </span>

            {/* Time */}
            {timeDisplay && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {timeDisplay}
              </span>
            )}

            {/* Location */}
            {event.location && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.location}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{event.description}</p>

          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.name}
              className="mt-3 h-40 w-full rounded-lg object-cover"
            />
          )}

          {event.registrationUrl && (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red-dark"
            >
              Register
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/EventCard.tsx
git commit -m "feat: add EventCard component with date badge and type badge"
```

---

### Task 3: Create MiniCalendar Component

**Files:**
- Create: `app/components/MiniCalendar.tsx`

- [ ] **Step 1: Create the MiniCalendar component**

Create `app/components/MiniCalendar.tsx`:

```tsx
import {useState} from 'react';
import {type AdminEvent, getEventTypeColor} from '~/lib/admin-data';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getMonthLabel(year: number, month: number): string {
  return new Date(year, month).toLocaleString('en-US', {month: 'long', year: 'numeric'});
}

/** Build a Set of ISO date strings that fall within any event's date range */
function buildEventDateSet(events: AdminEvent[]): Map<string, AdminEvent['eventType']> {
  const map = new Map<string, AdminEvent['eventType']>();
  for (const ev of events) {
    const start = new Date(ev.date + 'T00:00:00');
    const end = ev.endDate ? new Date(ev.endDate + 'T00:00:00') : start;
    const cursor = new Date(start);
    while (cursor <= end) {
      const iso = cursor.toISOString().slice(0, 10);
      if (!map.has(iso)) map.set(iso, ev.eventType);
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return map;
}

export function MiniCalendar({
  events,
  onDateClick,
}: {
  events: AdminEvent[];
  onDateClick: (date: string) => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const eventDates = buildEventDateSet(events);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="w-64 rounded-xl border border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-brand-gray"
          aria-label="Previous month"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-bold text-brand-gray">{getMonthLabel(year, month)}</span>
        <button
          onClick={nextMonth}
          className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-brand-gray"
          aria-label="Next month"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="mt-3 grid grid-cols-7 text-center">
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-[10px] font-semibold uppercase text-gray-400">
            {d}
          </span>
        ))}
      </div>

      {/* Date grid */}
      <div className="mt-1 grid grid-cols-7 text-center">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-8" />;
          }

          const iso = toISO(year, month, day);
          const eventType = eventDates.get(iso);
          const hasEvent = !!eventType;
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          const typeColor = hasEvent ? getEventTypeColor(eventType!) : null;

          return (
            <button
              key={day}
              onClick={() => hasEvent && onDateClick(iso)}
              disabled={!hasEvent}
              className={`relative flex h-8 w-full items-center justify-center text-xs transition ${
                isToday
                  ? 'font-bold text-brand-red'
                  : hasEvent
                    ? 'font-semibold text-brand-gray hover:bg-gray-50 cursor-pointer'
                    : 'text-gray-400'
              }`}
            >
              {day}
              {hasEvent && (
                <span
                  className={`absolute bottom-0.5 h-1 w-1 rounded-full ${typeColor!.text.replace('text-', 'bg-')}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/MiniCalendar.tsx
git commit -m "feat: add MiniCalendar component with event dots and navigation"
```

---

### Task 4: Rebuild Events Page with Timeline Layout

**Files:**
- Modify: `app/routes/events.tsx`

- [ ] **Step 1: Replace the entire events.tsx file**

Replace all contents of `app/routes/events.tsx` with:

```tsx
import {useState, useEffect, useRef, useCallback} from 'react';
import {getEvents, getEventMonthYear, type AdminEvent} from '~/lib/admin-data';
import {MiniCalendar} from '~/components/MiniCalendar';
import {EventCard} from '~/components/EventCard';

/** Group events by month/year and sort chronologically */
function groupByMonth(events: AdminEvent[]): {label: string; events: AdminEvent[]}[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const groups: Map<string, AdminEvent[]> = new Map();
  for (const ev of sorted) {
    const key = getEventMonthYear(ev.date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ev);
  }

  return Array.from(groups.entries()).map(([label, events]) => ({label, events}));
}

export default function EventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const groups = groupByMonth(events);

  const scrollToMonth = useCallback(
    (isoDate: string) => {
      const monthYear = getEventMonthYear(isoDate);
      const el = monthRefs.current.get(monthYear);
      if (el) {
        el.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    },
    [],
  );

  const setMonthRef = useCallback(
    (label: string) => (el: HTMLDivElement | null) => {
      if (el) {
        monthRefs.current.set(label, el);
      } else {
        monthRefs.current.delete(label);
      }
    },
    [],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-brand-gray">Upcoming Events</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-500">
          Come see us in person! We attend trade shows and markets throughout the year. Stop by our
          booth to check out new products and meet the team.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="mt-16 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-4 text-gray-400">No upcoming events scheduled. Check back soon!</p>
        </div>
      ) : (
        <div className="mt-10 flex gap-8">
          {/* Mini calendar sidebar — desktop only */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <MiniCalendar events={events} onDateClick={scrollToMonth} />
            </div>
          </div>

          {/* Mobile month strip */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {groups.map((g) => (
              <button
                key={g.label}
                onClick={() => {
                  const el = monthRefs.current.get(g.label);
                  el?.scrollIntoView({behavior: 'smooth', block: 'start'});
                }}
                className="flex-shrink-0 rounded-full border border-gray-200 px-4 py-1.5 text-xs font-bold text-brand-gray transition hover:border-brand-red hover:text-brand-red"
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="min-w-0 flex-1 space-y-10">
            {groups.map((group) => (
              <div key={group.label} ref={setMonthRef(group.label)}>
                <h2 className="border-b border-gray-200 pb-2 text-xl font-bold text-brand-gray">
                  {group.label}
                </h2>
                <div className="mt-4 space-y-4">
                  {group.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <h3 className="font-bold text-brand-gray">Want to meet us at a show?</h3>
        <p className="mt-2 text-sm text-gray-500">
          Reach out ahead of time and we can schedule a meeting at any upcoming event.
        </p>
        <a
          href="/contact"
          className="mt-4 inline-block rounded-lg bg-brand-red px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-red-dark"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the events page loads**

Open `http://localhost:3100/events` in a browser. Verify:
- Timeline groups events by month (June, August, September, October 2026)
- Mini calendar appears on the left on desktop
- Event cards show date badge, type badge, location, time
- Clicking a date dot in mini calendar scrolls to that month

- [ ] **Step 3: Commit**

```bash
git add app/routes/events.tsx
git commit -m "feat: rebuild events page with timeline layout and mini-calendar sidebar"
```

---

### Task 5: Update Admin Events Manager Form

**Files:**
- Modify: `app/routes/admin.tsx`

- [ ] **Step 1: Replace the EventsManager component**

In `app/routes/admin.tsx`, replace the entire `EventsManager` function (lines 67–188) with:

```tsx
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

      {/* List */}
      <div className="mt-4 space-y-2">
        {events.map((event) => {
          const typeColor = getEventTypeColor(event.eventType);
          return (
            <div key={event.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${typeColor.bg} ${typeColor.text}`}>
                  {getEventTypeLabel(event.eventType)}
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-gray">{event.name}</p>
                  <p className="text-xs text-gray-500">{formatEventDate(event.date, event.endDate)} — {event.location}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(event)} className="text-xs font-semibold text-brand-red hover:underline">Edit</button>
                <button onClick={() => handleDelete(event.id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update the imports at the top of admin.tsx**

Replace the existing import from `admin-data`:

```typescript
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
  type AdminVideo,
  type AdminEvent,
} from '../lib/admin-data';
```

- [ ] **Step 3: Verify the admin page works**

Open `http://localhost:3100/admin`, log in with `globalshowproducts` / `password1723`. Verify:
- Events tab shows type badges and formatted dates
- Form has date pickers, time pickers, type dropdown, URL fields
- Can add, edit, delete events
- New events appear on `/events` timeline

- [ ] **Step 4: Commit**

```bash
git add app/routes/admin.tsx
git commit -m "feat: enhance admin Events Manager with type, dates, times, URLs"
```

---

### Task 6: Add Admin Link to Interact Dropdown

**Files:**
- Modify: `app/components/Header.tsx`

- [ ] **Step 1: Add Admin to the Interact dropdown children**

In `app/components/Header.tsx`, find the Interact nav item (lines 31–37) and add the Admin child:

Replace:
```typescript
  {
    label: 'Interact',
    to: '/events',
    children: [
      {label: 'Upcoming Events', to: '/events'},
      {label: 'Videos', to: '/videos'},
    ],
  },
```

With:
```typescript
  {
    label: 'Interact',
    to: '/events',
    children: [
      {label: 'Upcoming Events', to: '/events'},
      {label: 'Videos', to: '/videos'},
      {label: 'Admin', to: '/admin'},
    ],
  },
```

- [ ] **Step 2: Verify the dropdown shows Admin**

Open `http://localhost:3100/` and hover over the Interact menu. Verify "Admin" appears as the third item. Click it and verify it navigates to `/admin`.

- [ ] **Step 3: Commit**

```bash
git add app/components/Header.tsx
git commit -m "feat: add Admin link to Interact dropdown menu"
```
