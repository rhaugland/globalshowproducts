# Event Attendee Registration & Tracking — Design Spec

## Goal

Allow visitors to RSVP to events directly on the public events page (when no external registration URL exists), store attendee data in localStorage, and display attendee lists under each event in the admin panel.

## Architecture

This feature extends three existing touchpoints — no new pages or routes required:

1. **Data model** (`app/lib/admin-data.ts`) — add `EventAttendee` interface and localStorage helpers
2. **Public page** (`app/components/EventCard.tsx`) — add inline RSVP form for events without external registration URLs
3. **Admin page** (`app/routes/admin.tsx`) — add expandable attendee list under each event in the Events tab

Storage remains localStorage via the existing `admin-data.ts` pattern.

## Data Model Changes

Add to `app/lib/admin-data.ts`:

```typescript
export interface EventAttendee {
  id: string;
  eventId: string;
  name: string;
  email: string;
  company: string;
  registeredAt: string; // ISO timestamp e.g. "2026-04-12T14:30:00.000Z"
}
```

**Storage key:** `gsp_admin_attendees`

**Helper functions to add:**

- `getAttendees(): EventAttendee[]` — returns all attendees from localStorage (or empty array)
- `saveAttendees(attendees: EventAttendee[]): void` — persists full attendee array
- `getAttendeesByEvent(eventId: string): EventAttendee[]` — filters attendees for a specific event
- `addAttendee(attendee: Omit<EventAttendee, 'id' | 'registeredAt'>): EventAttendee` — generates id + timestamp, appends to stored array, returns the new attendee
- `isAlreadyRegistered(eventId: string, email: string): boolean` — checks if an email is already registered for an event (case-insensitive comparison)

**Default data:** Seed `DEFAULT_ATTENDEES` with a few dummy attendees spread across events so the admin has something to see immediately:

| Name | Email | Company | Event |
|------|-------|---------|-------|
| Sarah Chen | sarah.chen@retailplus.com | RetailPlus Inc. | ASD Market Week (e1) |
| Marcus Johnson | marcus@giftshopcentral.com | Gift Shop Central | ASD Market Week (e1) |
| Lisa Park | lisa.park@homegoods.co | HomeGoods Wholesale | NY NOW Summer Market (e2) |
| David Torres | david@midwestretail.com | Midwest Retail Group | Minneapolis Gift Show (e3) |
| Amy Williams | amy.w@noveltyworld.com | Novelty World | Wholesale Product Sourcing 101 (e5) |
| James Lee | james.lee@parkavegifts.com | Park Ave Gifts | Summer Toy Trends Webinar (e6) |
| Rachel Morgan | rachel@shoplocalmn.com | Shop Local MN | Global Show Products Open House (e10) |

The `getAttendees()` function should use the same migration pattern as `getEvents()` — if localStorage is empty, return `DEFAULT_ATTENDEES`.

## Public Events Page — EventCard Changes

### Registration Logic Per Event Card

```
Has registrationUrl?
  → YES: Show existing external "Register →" link button (no change)
  → NO:  Show "RSVP" button that toggles an inline registration form
```

### RSVP Button

- Same visual style as the existing Register button: `bg-brand-red text-white` pill
- Label: "RSVP →"
- Clicking toggles the inline form open/closed

### Inline RSVP Form

Renders below the event description (above any image), inside the card:

```
┌─────────────────────────────────────────────┐
│  ... existing card content ...              │
│                                             │
│  ┌─ RSVP Form ───────────────────────────┐  │
│  │ [Name          ] [Email             ] │  │
│  │ [Company/Business Name              ] │  │
│  │                        [Register ✓]   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ... image if present ...                   │
└─────────────────────────────────────────────┘
```

- Name and email fields on one row (two-column grid on desktop, stacked on mobile)
- Company field full-width below
- "Register" submit button right-aligned, `bg-brand-red text-white`
- All three fields required
- Basic email validation (HTML `type="email"`)

### After Registration

The form is replaced with a confirmation message:

```
┌─────────────────────────────────────────────┐
│  ✓ You're registered! See you there.        │
└─────────────────────────────────────────────┘
```

- Green checkmark, `text-pop-green` colored
- This state persists on page refresh — check `isAlreadyRegistered(eventId, email)` on mount
- Since we don't have the user's email on mount (no auth), store registered event IDs in a separate localStorage key `gsp_user_rsvps` as a simple string array of event IDs. On mount, check this array to determine if the confirmation should show.

### Duplicate Prevention

- Before submitting, call `isAlreadyRegistered(eventId, email)`
- If already registered, show the form with a message: "This email is already registered for this event." (no duplicate entry created)

## Admin Events Manager Changes

### Attendee Count

In the existing event list items, add a small attendee count below the date/location line:

```
┌─────────────────────────────────────────────┐
│  [Trade Show]  ASD Market Week        Edit Delete │
│               Jun 22–25, 2026 — Las Vegas    │
│               👤 2 attendees  ▾              │
└─────────────────────────────────────────────┘
```

- Format: person icon + "N attendees" or "No registrations yet"
- The count + text is clickable to expand/collapse the attendee table

### Expanded Attendee Table

When expanded, renders a simple table below the event row:

```
┌──────────────────────────────────────────────────────────┐
│  Name             Email                    Company       │
│  Sarah Chen       sarah.chen@retailplus.com RetailPlus   │
│  Marcus Johnson   marcus@giftshopcentral.com Gift Shop C │
└──────────────────────────────────────────────────────────┘
```

- Three columns: Name, Email, Company
- `text-sm` sizing, `bg-gray-50` background to visually nest under the event
- If no attendees: centered italic text "No registrations yet"
- Registered date not shown in the table (not needed for the demo)

## Component Changes Summary

### `app/lib/admin-data.ts`
- Add `EventAttendee` interface
- Add `DEFAULT_ATTENDEES` array
- Add `gsp_admin_attendees` to `STORAGE_KEYS`
- Add `getAttendees()`, `saveAttendees()`, `getAttendeesByEvent()`, `addAttendee()`, `isAlreadyRegistered()`

### `app/components/EventCard.tsx`
- Add internal state for RSVP form visibility, form fields, submission status
- Add RSVP form UI (conditionally rendered when no `registrationUrl`)
- Add localStorage check for `gsp_user_rsvps` on mount
- Component goes from stateless to stateful (adds `useState`, `useEffect`)

### `app/routes/admin.tsx`
- Import new attendee helpers
- Add expandable attendee section to each event list item
- Track which event's attendee list is expanded via state

## What This Does NOT Include

- No email confirmations or notifications
- No attendee editing or deletion (view-only in admin)
- No capacity limits per event
- No authentication required to RSVP
- No server-side persistence (stays on localStorage)
- No export to CSV
