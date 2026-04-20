"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const MOODS: Record<number, { emoji: string; color: string }> = {
  1: { emoji: "😄", color: "#FFD93D" },
  2: { emoji: "🙂", color: "#6BCB77" },
  3: { emoji: "😐", color: "#4D96FF" },
  4: { emoji: "😔", color: "#FF922B" },
  5: { emoji: "😣", color: "#FF6B6B" },
};

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface Entry { date: string; mood_id: number | null; }

export default function CalendarPage() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  const isMax = year === today.getFullYear() && month === today.getMonth() + 1;

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (isMax) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  useEffect(() => {
    setLoading(true);
    api.get(`/entries?month=${month}&year=${year}`)
      .then(res => setEntries(res.data))
      .finally(() => setLoading(false));
  }, [month, year]);

  const entryByDate = Object.fromEntries(entries.map(e => [e.date, e]));

  // Build calendar grid (Mon-Sun)
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  // getDay(): 0=Sun, 1=Mon... convert to Mon=0
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = today.toISOString().split("T")[0];
  const monthName = new Date(year, month - 1).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  function handleDayClick(day: number) {
    const d = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const entry = entryByDate[d];
    if (entry) {
      router.push("/records");
    } else {
      const dateObj = new Date(d + "T00:00:00");
      const isToday = d === todayStr;
      const isPast = dateObj < today;
      if (isToday || isPast) {
        router.push(`/mood?date=${d}`);
      }
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-base font-semibold text-gray-800 capitalize">{monthName}</h1>
        <button
          onClick={nextMonth}
          disabled={isMax}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-[#5B4FCF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const entry = entryByDate[dateStr];
            const isToday = dateStr === todayStr;
            const isFuture = new Date(dateStr + "T00:00:00") > today;
            const mood = entry?.mood_id ? MOODS[entry.mood_id] : null;

            return (
              <button
                key={day}
                onClick={() => !isFuture && handleDayClick(day)}
                disabled={isFuture}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition-all
                  ${isFuture ? "opacity-30 cursor-default" : "hover:bg-gray-50 cursor-pointer"}
                  ${isToday ? "ring-2 ring-[#5B4FCF] ring-offset-1" : ""}
                `}
              >
                {mood ? (
                  <>
                    <span className="text-lg leading-none">{mood.emoji}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{day}</span>
                  </>
                ) : (
                  <span className={`font-medium ${isToday ? "text-[#5B4FCF]" : "text-gray-600"}`}>
                    {day}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {Object.entries(MOODS).map(([id, m]) => (
          <div key={id} className="flex items-center gap-1 text-xs text-gray-500">
            <span>{m.emoji}</span>
            <span>
              {id === "1" ? "Отличное" : id === "2" ? "Хорошее" : id === "3" ? "Нейтральное" : id === "4" ? "Плохое" : "Ужасное"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
