import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useTapStore } from "../../store/useTapStore.js";

const today = new Date();

const layerOptions = [
  {
    id: "kr",
    label: "한국 주요 증시 일정",
  },
  {
    id: "us",
    label: "미국 주요 증시 일정",
  },
  {
    id: "art",
    label: "국내 미술 전시회 일정",
  },
  {
    id: "hack",
    label: "IT 해커톤 일정",
  },
];

const baseEvents = [
  {
    id: "krx-seollal-1",
    layer: "kr",
    title: "KRX 휴장: 설날 연휴",
    start: "2026-02-16",
    end: "2026-02-18",
    source: "sample",
  },
  {
    id: "us-presidents-day",
    layer: "us",
    title: "NYSE/Nasdaq 휴장: Presidents Day",
    start: "2026-02-16",
    end: "2026-02-16",
    source: "web",
  },
  {
    id: "mmca-sakda",
    layer: "art",
    title: "MMCA 서울: 소멸의 시학 — 삭는 미술에 대하여",
    start: "2026-01-30",
    end: "2026-05-03",
    source: "web",
    pin: "month-start",
  },
  {
    id: "mmca-shin-sang-ho",
    layer: "art",
    title: "MMCA 과천: 신상호 — 무한변주",
    start: "2025-11-27",
    end: "2026-03-29",
    source: "web",
    pin: "month-start",
  },
  {
    id: "hackathon-qualifier",
    layer: "hack",
    title: "조코딩 X OpenAI X Primer AI 해커톤 예선 마감",
    start: "2026-02-20",
    end: "2026-02-20",
    source: "user",
    detail: "예선 제출 마감: 2026-02-20 23:59",
  },
  {
    id: "hackathon-final",
    layer: "hack",
    title: "조코딩 X OpenAI X Primer AI 해커톤 결승",
    start: "2026-03-07",
    end: "2026-03-07",
    source: "user",
    detail: "결승: 2026-03-07(토)",
  },
  {
    id: "sample-sync",
    layer: "kr",
    title: "샘플: 월간 투자 회의",
    start: "2026-02-24",
    end: "2026-02-24",
    source: "sample",
  },
  {
    id: "sample-art-note",
    layer: "art",
    title: "샘플: 전시 리뷰 작성",
    start: "2026-02-08",
    end: "2026-02-08",
    source: "sample",
  },
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatISO = (date) => date.toISOString().slice(0, 10);

const buildDays = (monthDate) => {
  const days = [];
  const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const startWeekday = startOfMonth.getDay();
  const totalDays = endOfMonth.getDate();

  for (let i = 0; i < startWeekday; i += 1) {
    days.push({
      key: `pad-${i}`,
      date: null,
    });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    days.push({
      key: `day-${day}`,
      date: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), day),
    });
  }

  return days;
};

const useEventsByDay = (events, monthDate) => {
  return useMemo(() => {
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const map = new Map();

    events.forEach((event) => {
      const start = new Date(event.start);
      const end = new Date(event.end);

      if (event.pin === "month-start") {
        if (end < monthStart || start > monthEnd) return;
        const key = formatISO(monthStart);
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key).push(event);
        return;
      }

      const current = new Date(start);
      while (current <= end) {
        const key = formatISO(current);
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key).push(event);
        current.setDate(current.getDate() + 1);
      }
    });

    return map;
  }, [events, monthDate]);
};

const useLifeCalendar = () => {
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const yearEnd = new Date(today.getFullYear(), 11, 31);
  const totalDays = Math.round((yearEnd - yearStart) / 86400000) + 1;
  const dayOfYear = Math.round((today - yearStart) / 86400000) + 1;

  return { totalDays, dayOfYear };
};

export const tap = {
  id: "tap2",
  label: "TAP 2",
  title: "맞춤형 월간 캘린더",
  description:
    "내가 지금 중요하게 보는 레이어를 겹쳐 해석하는 월간 캘린더. 일정 탐색, 시간 감각, 메모 기록이 한 화면에서 연결됩니다.",
  Component: function Tap2Calendar() {
    const { preferences, setPreference } = useTapStore();
    const storedLayers = preferences.tap2?.layers ?? {};
    const memos = preferences.tap2?.memos ?? {};

    const [monthOffset, setMonthOffset] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const monthDate = useMemo(
      () => new Date(today.getFullYear(), today.getMonth() + monthOffset, 1),
      [monthOffset]
    );

    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    const layers = layerOptions.map((layer) => ({
      ...layer,
      enabled: storedLayers[layer.id] ?? true,
    }));

    const activeLayerIds = layers.filter((layer) => layer.enabled).map((layer) => layer.id);
    const visibleEvents = baseEvents.filter((event) => activeLayerIds.includes(event.layer));
    const eventsByDay = useEventsByDay(visibleEvents, monthDate);
    const days = useMemo(() => buildDays(monthDate), [monthDate]);
    const { totalDays, dayOfYear } = useLifeCalendar();

    const outOfMonthEvents = visibleEvents
      .filter((event) => new Date(event.start) > monthEnd)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 4);

    const toggleLayer = (id) => {
      setPreference("tap2", "layers", {
        ...storedLayers,
        [id]: !(storedLayers[id] ?? true),
      });
    };

    const openMemo = (event) => {
      setSelectedEvent(event);
    };

    const saveMemo = (value) => {
      if (!selectedEvent) return;
      setPreference("tap2", "memos", {
        ...memos,
        [selectedEvent.id]: value,
      });
    };

    const resetToToday = () => setMonthOffset(0);

    return (
      <div className="tap2">
        <div className="tap2-header">
          <div>
            <p className="tap2-month">{monthDate.toLocaleString("ko-KR", { month: "long" })}</p>
            <p className="tap2-year">{monthDate.getFullYear()}</p>
            <div className="tap2-nav">
              <button type="button" onClick={() => setMonthOffset((value) => value - 1)}>
                이전 달
              </button>
              <button type="button" onClick={resetToToday}>
                이번 달
              </button>
              <button type="button" onClick={() => setMonthOffset((value) => value + 1)}>
                다음 달
              </button>
            </div>
          </div>
          <div className="tap2-layers">
            <p className="tap2-label">Interest Layering</p>
            <div className="tap2-toggle-list">
              {layers.map((layer) => (
                <label key={layer.id} className="tap2-toggle">
                  <input type="checkbox" checked={layer.enabled} onChange={() => toggleLayer(layer.id)} />
                  <span>{layer.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <section className="tap2-calendar">
          {dayNames.map((day) => (
            <div key={day} className="tap2-weekday">
              {day}
            </div>
          ))}
          {days.map((day) => {
            if (!day.date) {
              return <div key={day.key} className="tap2-day tap2-day--empty" />;
            }

            const iso = formatISO(day.date);
            const items = eventsByDay.get(iso) ?? [];
            const isToday = formatISO(today) === iso;

            return (
              <div key={day.key} className={`tap2-day ${isToday ? "is-today" : ""}`}>
                <div className="tap2-date">{day.date.getDate()}</div>
                <div className="tap2-events">
                  <AnimatePresence initial={false}>
                    {items.map((event) => (
                      <motion.button
                        key={event.id}
                        type="button"
                        className="tap2-event"
                        onClick={() => openMemo(event)}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span>{event.title}</span>
                        {event.source === "sample" && <em>샘플</em>}
                        {event.source === "user" && <em>제공</em>}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </section>

        {outOfMonthEvents.length > 0 && (
          <section className="tap2-upcoming">
            <p className="tap2-label">Next</p>
            <div className="tap2-upcoming-list">
              {outOfMonthEvents.map((event) => (
                <button key={event.id} type="button" className="tap2-event" onClick={() => openMemo(event)}>
                  <span>{event.title}</span>
                  <em>{event.start}</em>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="tap2-life">
          <div>
            <p className="tap2-label">Visual Life Calendar</p>
            <p className="tap2-life-note">
              {today.getFullYear()}년 {dayOfYear}일차 · 남은 {totalDays - dayOfYear}일
            </p>
          </div>
          <div className="tap2-life-grid">
            {Array.from({ length: totalDays }).map((_, index) => {
              const dayIndex = index + 1;
              const cls =
                dayIndex < dayOfYear
                  ? "tap2-life-dot is-past"
                  : dayIndex === dayOfYear
                  ? "tap2-life-dot is-today"
                  : "tap2-life-dot";
              return <span key={`life-${dayIndex}`} className={cls} />;
            })}
          </div>
        </section>

        {selectedEvent && (
          <div className="tap2-modal" role="dialog" aria-modal="true">
            <div className="tap2-modal-card">
              <div className="tap2-modal-head">
                <div>
                  <p className="tap2-modal-title">{selectedEvent.title}</p>
                  <p className="tap2-modal-date">
                    {selectedEvent.start} {selectedEvent.end !== selectedEvent.start ? `~ ${selectedEvent.end}` : ""}
                  </p>
                  {selectedEvent.detail && <p className="tap2-modal-detail">{selectedEvent.detail}</p>}
                </div>
                <button type="button" className="tap2-close" onClick={() => setSelectedEvent(null)}>
                  닫기
                </button>
              </div>
              <textarea
                placeholder="종이 위에 짧게 메모..."
                value={memos[selectedEvent.id] ?? ""}
                onChange={(event) => saveMemo(event.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    );
  },
};
