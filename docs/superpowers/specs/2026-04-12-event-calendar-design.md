# Event Calendar Enhancement — Design Spec

## Goal

Replace the plain event list at `/events` with a timeline/agenda view featuring a mini-calendar sidebar, enhance the admin Events Manager with richer fields (time, image, registration link, event type), and add an "Admin" link to the Interact dropdown for quick access.

## Architecture

This feature extends three existing touchpoints — no new data layer or backend required:

1. **Data model** (`app/lib/admin-data.ts`) — extend `AdminEvent` interface with new fields
2. **Public page** (`app/routes/events.tsx`) — replace flat list with timeline + mini-calendar layout
3. **Admin page** (`app/routes/admin.tsx`) — add new form fields to the Events Manager
4. **Header** (`app/components/Header.tsx`) — add "Admin" to the Interact dropdown

Storage remains localStorage via the existing `admin-data.ts` pattern.

## Data Model Changes

Extend `AdminEvent` in `app/lib/admin-data.ts`:

```typescript
export interface AdminEvent {
  id: string;
  name: string;
  date: string;           // ISO date string "2026-06-22" (changing from freeform text)
  endDate?: string;       // ISO date string for multi-day events "2026-06-25"
  startTime?: string;     // "09:00" (24h format)
  endTime?: string;       // "17:00"
  location: string;
  description: string;
  imageUrl?: string;      // Optional event/venue image URL
  registrationUrl?: string; // Optional external registration link
  eventType: 'trade-show' | 'workshop' | 'webinar' | 'other';
}
```

Update `DEFAULT_EVENTS` to use ISO dates and the new fields. The existing 4 events become:
- ASD Market Week: `date: "2026-06-22"`, `endDate: "2026-06-25"`, `eventType: "trade-show"`
- NY NOW Summer Market: `date: "2026-08-09"`, `endDate: "2026-08-12"`, `eventType: "trade-show"`
- Minneapolis Gift Show: `date: "2026-09-18"`, `endDate: "2026-09-19"`, `eventType: "trade-show"`
- Holiday Buying Market: `date: "2026-10-14"`, `endDate: "2026-10-16"`, `eventType: "trade-show"`

## Public Events Page (`/events`)

### Layout (Desktop)

Two-column layout inside `max-w-6xl`:

```
┌──────────────────────────────────────────────────┐
│  Upcoming Events                         subtitle │
├────────────┬─────────────────────────────────────┤
│            │  ┌─ JUNE 2026 ──────────────────┐   │
│  Mini      │  │ [Event Card]                  │   │
│  Calendar  │  │ [Event Card]                  │   │
│            │  └───────────────────────────────┘   │
│  (sticky)  │  ┌─ AUGUST 2026 ────────────────┐   │
│            │  │ [Event Card]                  │   │
│            │  └───────────────────────────────┘   │
│            │                                      │
├────────────┴─────────────────────────────────────┤
│  "Want to meet us?" CTA (existing)               │
└──────────────────────────────────────────────────┘
```

### Layout (Mobile)

Single column. Mini-calendar renders above the timeline as a horizontal scrollable month strip (not a full grid — too cramped on mobile). Tapping a month scrolls to that section.

### Mini-Calendar Sidebar

- Compact monthly grid (Su–Sa headers, date numbers)
- Dates with events get a colored dot beneath them (color matches event type)
- Prev/next month arrows
- Clicking a date with an event scrolls the timeline to that event's month group
- Sticky positioning (`sticky top-24`) so it stays visible while scrolling
- Width: `w-64`

### Event Cards

Each card in the timeline:

```
┌─────────────────────────────────────────────┐
│  [Type Badge]                               │
│  ┌────────┐  Event Name                     │
│  │  DATE  │  Location (with pin icon)       │
│  │  BADGE │  Time: 9:00 AM – 5:00 PM       │
│  └────────┘  Description text...            │
│              [Register →] (if URL exists)   │
│              [Optional image below]         │
└─────────────────────────────────────────────┘
```

- **Date badge**: Left-aligned square with month abbreviation on top, day number large below. Brand-red background, white text.
- **Multi-day events**: Date badge shows "Jun 22–25" format.
- **Type badge**: Small pill in top-right. Colors:
  - Trade Show: `bg-pop-cyan/10 text-pop-cyan`
  - Workshop: `bg-pop-green/10 text-pop-green`
  - Webinar: `bg-pop-purple/10 text-pop-purple`
  - Other: `bg-gray-100 text-gray-600`
- **Register button**: `bg-brand-red text-white` pill, only shown when `registrationUrl` is set. Opens in new tab.
- **Image**: If `imageUrl` is set, renders below the description as a rounded thumbnail.

### Month Group Headers

Full-width text: "June 2026", "August 2026", etc. Styled as `text-xl font-bold text-brand-gray` with a subtle bottom border. Only months with events are rendered.

### Empty State

If no events exist: centered message "No upcoming events scheduled. Check back soon!" with a calendar icon.

## Admin Events Manager Changes

The existing admin at `/admin` has a tabbed interface. The Events tab form currently has: name, date (text), location, description.

### Updated Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Event Name | text input | Yes | Existing |
| Event Type | select dropdown | Yes | New — trade-show/workshop/webinar/other |
| Start Date | date input (`type="date"`) | Yes | Replaces freeform text |
| End Date | date input | No | New — for multi-day events |
| Start Time | time input (`type="time"`) | No | New |
| End Time | time input (`type="time"`) | No | New |
| Location | text input | Yes | Existing |
| Description | textarea | Yes | Existing |
| Image URL | text input | No | New |
| Registration URL | text input | No | New |

### Form Layout

Two-column grid for date/time fields to save vertical space:
```
[Event Name          ] [Event Type ▼       ]
[Start Date] [End Date] [Start Time] [End Time]
[Location                                     ]
[Description                                  ]
[Image URL                                    ]
[Registration URL                             ]
                              [Add Event]
```

### Event List in Admin

The admin event list table adds a colored type badge and shows dates in human-readable format (e.g., "Jun 22–25, 2026"). Edit and delete buttons remain as-is.

## Header Change

In `app/components/Header.tsx`, add a third child to the Interact dropdown:

```typescript
{
  label: 'Interact',
  to: '/events',
  children: [
    {label: 'Upcoming Events', to: '/events'},
    {label: 'Videos', to: '/videos'},
    {label: 'Admin', to: '/admin'},        // NEW
  ],
},
```

Applies to both desktop dropdown and mobile accordion (no code change needed — the nav items array drives both).

## New Components

### `app/components/MiniCalendar.tsx`

Self-contained mini-calendar component. Props:
- `events: AdminEvent[]` — to mark dates with dots
- `onDateClick: (date: string) => void` — callback when a date with an event is clicked

Internal state: current displayed month/year. Renders a 7-column grid. No external dependencies.

### `app/components/EventCard.tsx`

Presentational component for a single event card. Props:
- `event: AdminEvent`

Renders the card layout described above. Pure component, no state.

## Helper Utilities

Add to `app/lib/admin-data.ts`:

- `formatEventDate(date: string, endDate?: string): string` — formats ISO dates to display strings like "Jun 22–25, 2026" or "Sep 18, 2026"
- `formatEventTime(startTime?: string, endTime?: string): string | null` — formats 24h times to "9:00 AM – 5:00 PM" or null if no times set
- `getEventTypeLabel(type: AdminEvent['eventType']): string` — returns human-readable label
- `getEventTypeColor(type: AdminEvent['eventType']): {bg: string; text: string}` — returns Tailwind classes for type badge

## Migration

When the page loads, `getEvents()` may return old-format events from localStorage (freeform date strings, no eventType). The function should detect this (check if `eventType` field exists) and return `DEFAULT_EVENTS` instead, effectively resetting to the new format. This is acceptable for a demo — no real user data to preserve.

## What This Does NOT Include

- No server-side persistence (stays on localStorage)
- No iCal/Google Calendar export
- No recurring events
- No event RSVP or attendee tracking
- No drag-and-drop in admin
