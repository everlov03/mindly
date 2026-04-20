"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreVertical, X, Target, CheckCircle2, Circle } from "lucide-react";
import api from "@/lib/api";

const MOODS: Record<number, { emoji: string; color: string; label: string }> = {
  1: { emoji: "😄", color: "#FFD93D", label: "Отличное" },
  2: { emoji: "🙂", color: "#6BCB77", label: "Хорошее" },
  3: { emoji: "😐", color: "#4D96FF", label: "Нейтральное" },
  4: { emoji: "😔", color: "#FF922B", label: "Плохое" },
  5: { emoji: "😣", color: "#FF6B6B", label: "Ужасное" },
};

interface Photo { id: number; file_path: string; }
interface Entry {
  id: number;
  date: string;
  mood_id: number | null;
  note: string | null;
  activity_ids: number[];
  photos: Photo[];
}
interface Goal { id: number; title: string; status: string; }
interface ActivityItem { id: number; label: string; emoji: string; }

function labelForDate(dateStr: string): string {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr + "T00:00:00"); d.setHours(0,0,0,0);
  const diff = (today.getTime() - d.getTime()) / 86400000;
  if (diff === 0) return `Сегодня ${d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`;
  if (diff === 1) return `Вчера ${d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`;
  return d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
}

export default function RecordsPage() {
  const router = useRouter();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [menuEntry, setMenuEntry] = useState<number | null>(null);
  const [editModal, setEditModal] = useState<Entry | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [goalMenuId, setGoalMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const maxYear = today.getFullYear();
  const maxMonth = today.getMonth() + 1;
  const isMax = year === maxYear && month === maxMonth;

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
      api.get(`/entries?month=${month}&year=${year}`),
      api.get("/goals"),
      api.get("/activities/categories"),
    ]).then(([eRes, gRes, aRes]) => {
      const sorted = [...eRes.data].sort(
        (a: Entry, b: Entry) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEntries(sorted);
      setGoals(gRes.data);
      const items: ActivityItem[] = [];
      for (const cat of aRes.data) items.push(...cat.items);
      setAllActivities(items);
    }).finally(() => setLoading(false));
  }, [month, year]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuEntry(null);
        setGoalMenuId(null);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function handleGoalStatus(id: number, status: string) {
    await api.patch(`/goals/${id}`, { status });
    setGoals(prev => prev.map(g => g.id === id ? { ...g, status } : g));
    setGoalMenuId(null);
  }

  function openEdit(entry: Entry) {
    setEditModal(entry);
    setEditNote(entry.note ?? "");
    setMenuEntry(null);
  }

  async function saveEdit() {
    if (!editModal) return;
    setEditSaving(true);
    try {
      const updated = await api.patch(`/entries/${editModal.id}`, { note: editNote.trim() || null });
      setEntries(prev => prev.map(e => e.id === updated.data.id ? updated.data : e));
      setEditModal(null);
    } catch {
      alert("Не удалось сохранить");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleAddPhoto(entryId: number) {
    setMenuEntry(null);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await api.post(`/entries/${entryId}/photos`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEntries(prev => prev.map(e =>
          e.id === entryId ? { ...e, photos: [...e.photos, res.data] } : e
        ));
      } catch {
        alert("Не удалось загрузить фото");
      }
    };
    input.click();
  }

  const activeGoals = goals.filter(g => g.status === "in_progress");
  const monthName = new Date(year, month - 1).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  return (
    <div className="max-w-lg mx-auto px-4 py-6" ref={menuRef}>
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

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div className="mb-6 space-y-2">
          {activeGoals.map(goal => (
            <div key={goal.id} className="relative bg-[#5B4FCF]/8 border border-[#5B4FCF]/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Target size={16} className="text-[#5B4FCF] shrink-0" />
                <span className="text-sm text-gray-700 truncate">{goal.title}</span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setGoalMenuId(prev => prev === goal.id ? null : goal.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <MoreVertical size={16} />
                </button>
                {goalMenuId === goal.id && (
                  <div className="absolute right-0 top-7 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-30">
                    <button
                      onClick={() => handleGoalStatus(goal.id, "done")}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <CheckCircle2 size={15} className="text-green-500" /> Выполнено
                    </button>
                    <button
                      onClick={() => handleGoalStatus(goal.id, "dropped")}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Circle size={15} className="text-gray-400" /> Отказаться
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entries */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-[#5B4FCF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-10">Записей за этот месяц нет</p>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => {
            const mood = entry.mood_id ? MOODS[entry.mood_id] : null;
            const actItems = allActivities.filter(a => entry.activity_ids.includes(a.id));

            return (
              <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {mood && (
                      <span
                        className="text-3xl shrink-0"
                        title={mood.label}
                      >
                        {mood.emoji}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 capitalize">{labelForDate(entry.date)}</p>
                      {mood && (
                        <p className="text-xs font-medium mt-0.5" style={{ color: mood.color }}>
                          {mood.label}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      onClick={() => setMenuEntry(prev => prev === entry.id ? null : entry.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {menuEntry === entry.id && (
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-30">
                        <button
                          onClick={() => openEdit(entry)}
                          className="flex w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleAddPhoto(entry.id)}
                          className="flex w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Добавить фото
                        </button>
                        <button
                          onClick={() => openEdit(entry)}
                          className="flex w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Добавить заметку
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {actItems.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {actItems.map(a => (
                      <span key={a.id} className="text-xs bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
                        {a.emoji} {a.label}
                      </span>
                    ))}
                  </div>
                )}

                {entry.note && (
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{entry.note}</p>
                )}

                {entry.photos.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {entry.photos.map(photo => (
                      <img
                        key={photo.id}
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/v1", "")}/static/uploads/${photo.file_path.split("/").pop()}`}
                        alt="фото"
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">Редактировать запись</h2>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Заметка..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/30 resize-none mb-4"
            />
            <button
              onClick={saveEdit}
              disabled={editSaving}
              className="w-full bg-[#5B4FCF] text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50 hover:bg-[#4a3fbe] transition-colors"
            >
              {editSaving ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
