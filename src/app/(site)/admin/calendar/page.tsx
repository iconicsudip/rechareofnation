"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, RefreshCw, CalendarRange, MapPin } from "lucide-react";
import { ApiClient, Event } from "@/lib/api-client";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const S = {
  card: { background: "rgba(23,13,8,0.6)", border: "1px solid rgba(217, 119, 6,0.12)", borderRadius: "16px" },
  input: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(217, 119, 6,0.2)",
    borderRadius: "10px", color: "#F5EEE2", outline: "none", padding: "10px 12px",
    fontSize: "13px", width: "100%",
  },
  btn: {
    display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px",
    borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none",
  },
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function todayKey() {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
}

interface CalendarCell {
  key: string;
  day: number;
  inMonth: boolean;
}

function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    cells.push({ key: dateKey(prevYear, prevMonth, d), day: d, inMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ key: dateKey(year, month, d), day: d, inMonth: true });
  }

  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1];
    const [y, m, d] = last.key.split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    cells.push({ key: dateKey(next.getFullYear(), next.getMonth(), next.getDate()), day: next.getDate(), inMonth: false });
    if (cells.length >= 42) break;
  }

  return cells;
}

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return { year: t.getFullYear(), month: t.getMonth() };
  });
  const [selectedKey, setSelectedKey] = useState<string>(todayKey());
  const [jumpEventId, setJumpEventId] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const all = await ApiClient.getEvents();
      setEvents(all);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const evt of events) {
      const key = (evt.date || "").slice(0, 10);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(evt);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [events]);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => (a.date || "").localeCompare(b.date || "")),
    [events]
  );

  const cells = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor]);
  const selectedEvents = eventsByDate.get(selectedKey) ?? [];

  const goToMonth = (delta: number) => {
    setCursor((prev) => {
      let month = prev.month + delta;
      let year = prev.year;
      if (month < 0) { month = 11; year -= 1; }
      if (month > 11) { month = 0; year += 1; }
      return { year, month };
    });
  };

  const openEvent = (slug: string) => {
    window.open(`/events/${slug}`, "_blank", "noopener,noreferrer");
  };

  const formatSelectedLabel = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#F5EEE2" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CalendarRange size={22} style={{ color: "#E4C465" }} />
            Event Calendar
          </h1>
          <p className="text-xs mt-1" style={{ color: "rgba(203,185,160,0.6)" }}>
            {events.length} events scheduled &bull; date-wise overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} style={{ ...S.btn, background: "rgba(217, 119, 6,0.1)", color: "#fbbf24", border: "1px solid rgba(217, 119, 6,0.2)" }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Jump to event dropdown */}
      <div style={S.card} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-xs font-bold uppercase tracking-wider shrink-0" style={{ color: "rgba(203,185,160,0.6)" }}>
          Jump to Event
        </label>
        <select
          style={S.input}
          value={jumpEventId}
          onChange={(e) => {
            const id = e.target.value;
            setJumpEventId(id);
            const evt = events.find((ev) => ev.id === id);
            if (evt) {
              const [y, m, d] = (evt.date || "").slice(0, 10).split("-").map(Number);
              if (y) setCursor({ year: y, month: m - 1 });
              setSelectedKey((evt.date || "").slice(0, 10));
              openEvent(evt.slug);
            }
          }}
        >
          <option value="">Select an event to open its details page&hellip;</option>
          {sortedEvents.map((evt) => (
            <option key={evt.id} value={evt.id}>
              {(evt.date || "").slice(0, 10)} &mdash; {evt.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar Grid */}
        <div style={S.card} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => goToMonth(-1)} className="p-2 rounded-lg" style={{ background: "rgba(217, 119, 6,0.1)", color: "#fbbf24" }}>
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-lg font-extrabold text-white">
              {MONTH_NAMES[cursor.month]} {cursor.year}
            </h2>
            <button onClick={() => goToMonth(1)} className="p-2 rounded-lg" style={{ background: "rgba(217, 119, 6,0.1)", color: "#fbbf24" }}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-center text-[10px] font-bold uppercase tracking-wider py-1" style={{ color: "rgba(203,185,160,0.5)" }}>
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((cell) => {
              const dayEvents = eventsByDate.get(cell.key) ?? [];
              const isSelected = cell.key === selectedKey;
              const isToday = cell.key === todayKey();
              return (
                <button
                  key={cell.key}
                  onClick={() => setSelectedKey(cell.key)}
                  className="relative flex flex-col items-start gap-1 rounded-xl p-2 min-h-[68px] text-left transition-all cursor-pointer"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(156,122,29,0.3), rgba(201,162,39,0.15))"
                      : "rgba(255,255,255,0.02)",
                    border: isSelected
                      ? "1px solid rgba(201,162,39,0.5)"
                      : isToday
                      ? "1px solid rgba(201,162,39,0.3)"
                      : "1px solid rgba(255,255,255,0.05)",
                    opacity: cell.inMonth ? 1 : 0.35,
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: isToday ? "#E4C465" : "#F5EEE2" }}
                  >
                    {cell.day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(245,158,11,0.2)", color: "#fbbf24" }}
                    >
                      {dayEvents.length} event{dayEvents.length > 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Panel */}
        <div style={S.card} className="p-5 flex flex-col gap-4 h-fit lg:sticky lg:top-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(203,185,160,0.5)" }}>
              Selected Date
            </span>
            <h3 className="text-sm font-extrabold text-white mt-0.5">{formatSelectedLabel(selectedKey)}</h3>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="text-xs" style={{ color: "rgba(203,185,160,0.5)" }}>
              No events scheduled on this date.
            </p>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(203,185,160,0.5)" }}>
                  Open Event Details Page
                </label>
                <select
                  style={S.input}
                  defaultValue=""
                  onChange={(e) => {
                    const evt = selectedEvents.find((ev) => ev.id === e.target.value);
                    if (evt) openEvent(evt.slug);
                    e.target.value = "";
                  }}
                >
                  <option value="" disabled>
                    Choose an event&hellip;
                  </option>
                  {selectedEvents.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                {selectedEvents.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => openEvent(evt.slug)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer group"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(217, 119, 6,0.12)" }}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/40">
                      {evt.bannerUrl && (
                        <img src={evt.bannerUrl} alt={evt.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{evt.name}</div>
                      <div className="text-[10px] flex items-center gap-1 truncate" style={{ color: "rgba(203,185,160,0.5)" }}>
                        <MapPin size={10} className="shrink-0" /> {evt.venue}, {evt.city}
                      </div>
                    </div>
                    <ExternalLink size={13} style={{ color: "#E4C465" }} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
