"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";

const MOODS: Record<number, { emoji: string; color: string; label: string }> = {
  1: { emoji: "😄", color: "#FFD93D", label: "Отличное" },
  2: { emoji: "🙂", color: "#6BCB77", label: "Хорошее" },
  3: { emoji: "😐", color: "#4D96FF", label: "Нейтральное" },
  4: { emoji: "😔", color: "#FF922B", label: "Плохое" },
  5: { emoji: "😣", color: "#FF6B6B", label: "Ужасное" },
};

interface MoodStat { mood_id: number; count: number; }
interface ActivityStat { activity_item_id: number; label: string; emoji: string; count: number; }

export default function StatsPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [moodStats, setMoodStats] = useState<MoodStat[]>([]);
  const [actStats, setActStats] = useState<ActivityStat[]>([]);
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
    Promise.all([
      api.get(`/stats/moods?month=${month}&year=${year}`),
      api.get(`/stats/activities?month=${month}&year=${year}`),
    ]).then(([mRes, aRes]) => {
      setMoodStats(mRes.data.stats);
      setActStats(aRes.data.stats.slice(0, 10));
    }).finally(() => setLoading(false));
  }, [month, year]);

  const totalMood = moodStats.reduce((s, m) => s + m.count, 0);
  const totalAct = actStats.reduce((s, a) => s + a.count, 0);
  const maxAct = actStats[0]?.count ?? 1;

  const monthName = new Date(year, month - 1).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Month switcher */}
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

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-[#5B4FCF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Mood stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Настроение</h2>
            {totalMood === 0 ? (
              <p className="text-sm text-gray-400">Нет данных за этот месяц</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(MOODS).map(([id, m]) => {
                  const stat = moodStats.find(s => s.mood_id === parseInt(id));
                  const count = stat?.count ?? 0;
                  const pct = totalMood > 0 ? Math.round((count / totalMood) * 100) : 0;
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <span className="text-xl w-7 text-center">{m.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{m.label}</span>
                          <span>{count} {pct > 0 ? `(${pct}%)` : ""}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: m.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Активности</h2>
            {actStats.length === 0 ? (
              <p className="text-sm text-gray-400">Нет данных за этот месяц</p>
            ) : (
              <div className="space-y-3">
                {actStats.map(a => {
                  const pct = Math.round((a.count / maxAct) * 100);
                  return (
                    <div key={a.activity_item_id} className="flex items-center gap-3">
                      <span className="text-xl w-7 text-center">{a.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{a.label}</span>
                          <span>{a.count} раз</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#5B4FCF] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
