# Event Attendee Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public RSVP forms to events without external registration URLs, store attendees in localStorage, and display attendee lists in the admin panel.

**Architecture:** Extends the existing localStorage-based admin-data pattern with a new `EventAttendee` interface and storage key. EventCard becomes stateful to manage RSVP form. Admin EventsManager gets expandable attendee rows. No new routes or pages.

**Tech Stack:** React, TypeScript, Tailwind CSS, localStorage

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `app/lib/admin-data.ts` | Modify (lines 157-277) | Add `EventAttendee` interface, `DEFAULT_ATTENDEES`, storage helpers |
| `app/components/EventCard.tsx` | Modify (full file) | Add RSVP form for events without `registrationUrl` |
| `app/routes/admin.tsx` | Modify (lines 287-308) | Add expandable attendee list under each event |

---

### Task 1: Add EventAttendee data model and helpers

**Files:**
- Modify: `app/lib/admin-data.ts`

- [ ] **Step 1: Add the EventAttendee interface after the AdminEvent interface (after line 22)**

Add this code after the closing `}` of `AdminEvent` (after line 22):

```typescript
export interface EventAttendee {
  id: string;
  eventId: string;
  name: string;
  email: string;
  company: string;
  registeredAt: string;
}
```

- [ ] **Step 2: Add DEFAULT_ATTENDEES after the DEFAULT_EVENTS array (after line 155)**

Add this code after the closing `];` of `DEFAULT_EVENTS`:

```typescript
const DEFAULT_ATTENDEES: EventAttendee[] = [
  {id: 'a1', eventId: 'e1', name: 'Sarah Chen', email: 'sarah.chen@retailplus.com', company: 'RetailPlus Inc.', registeredAt: '2026-03-15T10:30:00.000Z'},
  {id: 'a2', eventId: 'e1', name: 'Marcus Johnson', email: 'marcus@giftshopcentral.com', company: 'Gift Shop Central', registeredAt: '2026-03-18T14:22:00.000Z'},
  {id: 'a3', eventId: 'e2', name: 'Lisa Park', email: 'lisa.park@homegoods.co', company: 'HomeGoods Wholesale', registeredAt: '2026-04-01T09:15:00.000Z'},
  {id: 'a4', eventId: 'e3', name: 'David Torres', email: 'david@midwestretail.com', company: 'Midwest Retail Group', registeredAt: '2026-04-05T16:45:00.000Z'},
  {id: 'a5', eventId: 'e10', name: 'Amy Williams', email: 'amy.w@noveltyworld.com', company: 'Novelty World', registeredAt: '2026-04-08T11:00:00.000Z'},
  {id: 'a6', eventId: 'e10', name: 'James Lee', email: 'james.lee@parkavegifts.com', company: 'Park Ave Gifts', registeredAt: '2026-04-09T13:30:00.000Z'},
  {id: 'a7', eventId: 'e10', name: 'Rachel Morgan', email: 'rachel@shoplocalmn.com', company: 'Shop Local MN', registeredAt: '2026-04-10T08:20:00.000Z'},
];
```

Note: Attendees are assigned to events WITHOUT `registrationUrl` (e1, e2, e3, e10) since those are the events that use the built-in RSVP system.

- [ ] **Step 3: Add `attendees` to STORAGE_KEYS (line 157-160)**

Change the `STORAGE_KEYS` object from:

```typescript
const STORAGE_KEYS = {
  videos: 'gsp_admin_videos',
  events: 'gsp_admin_events',
};
```

to:

```typescript
const STORAGE_KEYS = {
  videos: 'gsp_admin_videos',
  events: 'gsp_admin_events',
  attendees: 'gsp_admin_attendees',
  userRsvps: 'gsp_user_rsvps',
};
```

- [ ] **Step 4: Add attendee helper functions before the adminLogin function**

Add these functions just before the `export function adminLogin` line:

```typescript
export function getAttendees(): EventAttendee[] {
  if (!isBrowser()) return DEFAULT_ATTENDEES;
  const stored = localStorage.getItem(STORAGE_KEYS.attendees);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_ATTENDEES;
    }
  }
  return DEFAULT_ATTENDEES;
}

export function saveAttendees(attendees: EventAttendee[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.attendees, JSON.stringify(attendees));
}

export function getAttendeesByEvent(eventId: string): EventAttendee[] {
  return getAttendees().filter((a) => a.eventId === eventId);
}

export function addAttendee(data: {eventId: string; name: string; email: string; company: string}): EventAttendee {
  const attendees = getAttendees();
  const newAttendee: EventAttendee = {
    id: `a_${Date.now()}`,
    eventId: data.eventId,
    name: data.name,
    email: data.email,
    company: data.company,
    registeredAt: new Date().toISOString(),
  };
  attendees.push(newAttendee);
  saveAttendees(attendees);
  return newAttendee;
}

export function isAlreadyRegistered(eventId: string, email: string): boolean {
  return getAttendees().some(
    (a) => a.eventId === eventId && a.email.toLowerCase() === email.toLowerCase(),
  );
}

export function getUserRsvps(): string[] {
  if (!isBrowser()) return [];
  const stored = localStorage.getItem(STORAGE_KEYS.userRsvps);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function addUserRsvp(eventId: string): void {
  if (!isBrowser()) return;
  const rsvps = getUserRsvps();
  if (!rsvps.includes(eventId)) {
    rsvps.push(eventId);
    localStorage.setItem(STORAGE_KEYS.userRsvps, JSON.stringify(rsvps));
  }
}
```

- [ ] **Step 5: Verify the dev server has no errors**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/events`
Expected: `200`

- [ ] **Step 6: Commit**

```bash
git add app/lib/admin-data.ts
git commit -m "feat: add EventAttendee data model, defaults, and helpers"
```

---

### Task 2: Add RSVP form to EventCard

**Files:**
- Modify: `app/components/EventCard.tsx`

- [ ] **Step 1: Replace the entire EventCard.tsx with the stateful version**

Replace the full contents of `app/components/EventCard.tsx` with:

```typescript
import {useState, useEffect} from 'react';
import {
  type AdminEvent,
  formatEventDate,
  formatEventTime,
  getEventTypeLabel,
  getEventTypeColor,
  addAttendee,
  isAlreadyRegistered,
  getUserRsvps,
  addUserRsvp,
} from '~/lib/admin-data';

export function EventCard({event}: {event: AdminEvent}) {
  const typeColor = getEventTypeColor(event.eventType);
  const dateDisplay = formatEventDate(event.date, event.endDate);
  const timeDisplay = formatEventTime(event.startTime, event.endTime);
  const startDate = new Date(event.date + 'T00:00:00');
  const monthAbbr = startDate.toLocaleString('en-US', {month: 'short'}).toUpperCase();
  const dayNum = startDate.getDate();

  const showRsvpForm = !event.registrationUrl;
  const [formOpen, setFormOpen] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [dupError, setDupError] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => {
    if (showRsvpForm) {
      const rsvps = getUserRsvps();
      if (rsvps.includes(event.id)) {
        setRegistered(true);
      }
    }
  }, [event.id, showRsvpForm]);

  function handleRsvpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !company.trim()) return;

    if (isAlreadyRegistered(event.id, email)) {
      setDupError(true);
      return;
    }

    addAttendee({eventId: event.id, name: name.trim(), email: email.trim(), company: company.trim()});
    addUserRsvp(event.id);
    setRegistered(true);
    setFormOpen(false);
  }

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
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {dateDisplay}
            </span>

            {timeDisplay && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {timeDisplay}
              </span>
            )}

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

          {/* External registration link */}
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

          {/* Built-in RSVP */}
          {showRsvpForm && !registered && !formOpen && (
            <button
              onClick={() => setFormOpen(true)}
              className="mt-3 inline-flex items-center gap-1 rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red-dark"
            >
              RSVP
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}

          {showRsvpForm && formOpen && !registered && (
            <form onSubmit={handleRsvpSubmit} className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  placeholder="Your Name *"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setDupError(false); }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setDupError(false); }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                  required
                />
              </div>
              <input
                placeholder="Company / Business Name *"
                value={company}
                onChange={(e) => { setCompany(e.target.value); setDupError(false); }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                required
              />
              {dupError && (
                <p className="text-xs text-red-600">This email is already registered for this event.</p>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red-dark"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => { setFormOpen(false); setDupError(false); }}
                  className="text-sm text-gray-500 hover:text-brand-gray"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {showRsvpForm && registered && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-pop-green/10 px-4 py-2.5">
              <svg className="h-4 w-4 text-pop-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-semibold text-pop-green">You're registered! See you there.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the events page loads without errors**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/events`
Expected: `200`

- [ ] **Step 3: Commit**

```bash
git add app/components/EventCard.tsx
git commit -m "feat: add inline RSVP form to EventCard for events without external registration"
```

---

### Task 3: Add attendee list to admin Events Manager

**Files:**
- Modify: `app/routes/admin.tsx`

- [ ] **Step 1: Add the attendee import to the existing import block (line 1-15)**

Change the import from `'../lib/admin-data'` to also include `getAttendeesByEvent` and `type EventAttendee`:

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
  getAttendeesByEvent,
  type AdminVideo,
  type AdminEvent,
  type EventAttendee,
} from '../lib/admin-data';
```

- [ ] **Step 2: Add expanded attendee state to EventsManager (after line 72)**

Inside `EventsManager`, after the existing `useState` declarations (after line 84), add:

```typescript
  const [expandedAttendees, setExpandedAttendees] = useState<Record<string, boolean>>({});

  function toggleAttendees(eventId: string) {
    setExpandedAttendees((prev) => ({...prev, [eventId]: !prev[eventId]}));
  }
```

- [ ] **Step 3: Replace the event list section (lines 287-308) with attendee-aware version**

Replace the event list `<div>` (from `{/* List */}` comment through to the closing `</div>` of the list) with:

```typescript
      {/* List */}
      <div className="mt-4 space-y-2">
        {events.map((event) => {
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
```

- [ ] **Step 4: Verify the admin page loads without errors**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/admin`
Expected: `200`

- [ ] **Step 5: Commit**

```bash
git add app/routes/admin.tsx
git commit -m "feat: add expandable attendee list to admin Events Manager"
```

---

### Task 4: End-to-end verification

**Files:** None (testing only)

- [ ] **Step 1: Verify the events page renders RSVP buttons on events without external URLs**

Write a Playwright script to check the events page:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('https://globalshowproducts.ngrok.dev/events')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Check RSVP buttons exist (events without registrationUrl)
    rsvp_buttons = page.locator('button:has-text("RSVP")').count()
    print(f"RSVP buttons found: {rsvp_buttons}")

    # Check Register links exist (events with registrationUrl)
    register_links = page.locator('a:has-text("Register")').count()
    print(f"Register links found: {register_links}")

    page.screenshot(path='/tmp/events_rsvp.png', full_page=True)
    browser.close()
```

Expected: RSVP buttons on e1-e4 and e10 (5 buttons), Register links on e5-e9 (5 links).

- [ ] **Step 2: Test RSVP form submission**

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('https://globalshowproducts.ngrok.dev/events')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)

    # Click first RSVP button
    page.locator('button:has-text("RSVP")').first.click()
    page.wait_for_timeout(500)

    # Fill in the form
    page.locator('input[placeholder="Your Name *"]').first.fill('Test User')
    page.locator('input[placeholder="Email Address *"]').first.fill('test@example.com')
    page.locator('input[placeholder="Company / Business Name *"]').first.fill('Test Corp')

    # Submit
    page.locator('button:has-text("Register")').first.click()
    page.wait_for_timeout(1000)

    # Check confirmation message
    confirmed = page.locator("text=You're registered").count()
    print(f"Confirmation shown: {confirmed > 0}")

    page.screenshot(path='/tmp/events_after_rsvp.png', full_page=True)
    browser.close()
```

Expected: Confirmation message appears after submit.

- [ ] **Step 3: Test admin attendee list**

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('https://globalshowproducts.ngrok.dev/admin')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    # Login
    page.fill('#username', 'globalshowproducts')
    page.fill('#password', 'password1723')
    page.click('button[type="submit"]')
    page.wait_for_timeout(2000)

    # Click on attendees count for first event
    page.locator('text=attendee').first.click()
    page.wait_for_timeout(500)

    page.screenshot(path='/tmp/admin_attendees.png', full_page=True)

    # Check attendee table is visible
    table_visible = page.locator('table').count()
    print(f"Attendee table visible: {table_visible > 0}")

    browser.close()
```

Expected: Attendee table expands showing names, emails, companies.

- [ ] **Step 4: Push to GitHub**

```bash
git push origin main
```
