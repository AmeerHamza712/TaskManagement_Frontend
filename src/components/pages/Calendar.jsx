import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaVideo } from "react-icons/fa";
import api from "../services/api";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export default function Calendar() {
  const [date, setDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [eventsData, setEventsData] = useState({});
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const days = buildMonthGrid(viewDate);
  const currentMonth = viewDate.getMonth();

  useEffect(() => {
    const getEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get("/events");
        // Backend may return either a keyed object ({ "2026-08-25": [...] })
        // or a flat array of { date, title, time } records — normalize both.
        const raw = res.data?.events || res.data || {};
        if (Array.isArray(raw)) {
          const grouped = {};
          raw.forEach((evt) => {
            const key = evt.date || formatDateKey(new Date(evt.startTime));
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(evt);
          });
          setEventsData(grouped);
        } else {
          setEventsData(raw);
        }
      } catch (error) {
        console.error("Error fetching calendar events:", error);
        setEventsData({});
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, []);

  const goToMonth = (delta) => {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1),
    );
  };

  const jumpToToday = () => {
    const now = new Date();
    setDate(now);
    setViewDate(now);
  };

  const selectedKey = formatDateKey(date);
  const selectedEvents = eventsData[selectedKey] || [];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch bg-stone-50 p-4 rounded-2xl max-w-xl mx-auto shadow-sm">
      {/* Calendar Widget */}
      <div className="flex min-h-[220px] w-full sm:w-[220px] flex-col rounded-xl border border-stone-200 bg-white p-3 shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-1 pb-2">
          <button
            onClick={jumpToToday}
            className="text-[13px] font-semibold text-stone-900 hover:text-teal-700 transition-colors text-left"
            title="Click to jump to today"
          >
            {MONTHS[currentMonth]} {viewDate.getFullYear()}
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToMonth(-1)}
              aria-label="Previous month"
              className="flex h-6 w-6 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition"
            >
              <ChevronLeft size={14} strokeWidth={2.25} />
            </button>
            <button
              onClick={() => goToMonth(1)}
              aria-label="Next month"
              className="flex h-6 w-6 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition"
            >
              <ChevronRight size={14} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((day, i) => (
            <div
              key={i}
              className="flex h-5 items-center justify-center text-[10px] font-semibold text-stone-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-y-1">
          {days.map((d) => {
            const inMonth = d.getMonth() === currentMonth;
            const isToday = isSameDay(d, today);
            const isSelected = isSameDay(d, date);
            const dateKey = formatDateKey(d);
            const hasEvents = Boolean(eventsData[dateKey]?.length);

            return (
              <div key={dateKey} className="flex items-center justify-center">
                <button
                  onClick={() => setDate(d)}
                  aria-label={d.toDateString()}
                  className={[
                    "relative flex h-6 w-6 items-center justify-center rounded-full text-[11px] leading-none transition-all",
                    isSelected
                      ? "bg-teal-700 font-medium text-white shadow-xs"
                      : inMonth
                        ? "text-stone-800 hover:bg-stone-100"
                        : "text-stone-300 hover:bg-stone-50",
                  ].join(" ")}
                >
                  {d.getDate()}

                  {isToday && !isSelected && (
                    <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-teal-600" />
                  )}

                  {hasEvents && !isToday && !isSelected && (
                    <span className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-amber-500" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Up Next / Event Preview Panel */}
      <div className="bg-white w-full min-h-[220px] flex-1 rounded-xl p-3.5 flex flex-col justify-between border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-xs text-stone-800">
              {isSameDay(date, today)
                ? "Up Next Today"
                : `Events for ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
            </h2>
            <span className="text-[10px] font-medium text-stone-400">
              {selectedEvents.length} Event
              {selectedEvents.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="space-y-2">
              <div className="h-10 rounded-lg bg-stone-100 animate-pulse" />
              <div className="h-10 rounded-lg bg-stone-100 animate-pulse" />
            </div>
          ) : selectedEvents.length > 0 ? (
            <div className="space-y-2">
              {selectedEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="bg-emerald-50/80 rounded-lg p-2.5 border-l-4 border-emerald-600"
                >
                  <p className="text-emerald-950 font-semibold text-xs">
                    {evt.title}
                  </p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">
                    Time: {evt.time}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-xs text-stone-400">No scheduled meetings</p>
            </div>
          )}
        </div>

        {selectedEvents.length > 0 && (
          <button className="w-full mt-2 flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-emerald-700 active:scale-[0.99] transition">
            <FaVideo className="text-xs" /> Join Meeting
          </button>
        )}
      </div>
    </div>
  );
}
