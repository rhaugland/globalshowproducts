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

/** Build a Map of ISO date strings to event types for dates within any event's range */
function buildEventDateSet(events: AdminEvent[]): Map<string, AdminEvent['eventType']> {
  const map = new Map<string, AdminEvent['eventType']>();
  for (const ev of events) {
    const start = new Date(ev.date + 'T00:00:00');
    const end = ev.endDate ? new Date(ev.endDate + 'T00:00:00') : start;
    const cursor = new Date(start);
    while (cursor <= end) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
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
                  className={`absolute bottom-0.5 h-1 w-1 rounded-full ${typeColor!.dot}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
