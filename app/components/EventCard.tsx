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
