import {useState, useEffect} from 'react';
import {getEvents, type AdminEvent} from '../lib/admin-data';

export default function EventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-brand-gray">Upcoming Events</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-500">
          Come see us in person! We attend trade shows and markets throughout the year. Stop by our
          booth to check out new products and meet the team.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-xl border border-gray-200 p-6 transition hover:shadow-md"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-brand-gray">{event.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{event.description}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="inline-block rounded-full bg-brand-red/10 px-3 py-1 text-xs font-bold text-brand-red">
                  {event.date}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {event.location}
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <p className="mt-10 text-center text-gray-400">No upcoming events. Check back soon!</p>
      )}

      <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
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
