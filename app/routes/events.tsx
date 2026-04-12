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
