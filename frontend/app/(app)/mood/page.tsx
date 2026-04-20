"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

const MOODS = [
  { id: 1, emoji: "😄", label: "Отличное", color: "#FFD93D" },
  { id: 2, emoji: "🙂", label: "Хорошее",  color: "#6BCB77" },
  { id: 3, emoji: "😐", label: "Нейтральное", color: "#4D96FF" },
  { id: 4, emoji: "😔", label: "Плохое",   color: "#FF922B" },
  { id: 5, emoji: "😣", label: "Ужасное",  color: "#FF6B6B" },
];

function MoodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [now, setNow] = useState(new Date());
  const [selected, setSelected] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);
  const [pickerDate, setPickerDate] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const dateParam = searchParams.get("date");
  const isPicker = searchParams.get("picker") === "true";

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (isPicker) {
      setShowPicker(true);
      setChecking(false);
      return;
    }
    if (!dateParam) {
      setChecking(false);
      return;
    }
    api.get(`/entries/${dateParam}`)
      .then(() => router.replace("/records"))
      .catch(() => setChecking(false));
  }, [dateParam, isPicker, router]);

  async function handleSelect(moodId: number) {
    setSelected(moodId);
    const date = dateParam ?? new Date().toISOString().split("T")[0];
    setTimeout(() => {
      router.push(`/activities?date=${date}&mood_id=${moodId}`);
    }, 400);
  }

  function handlePickerSubmit() {
    if (!pickerDate) return;
    router.push(`/mood?date=${pickerDate}`);
  }

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

  const today = new Date().toISOString().split("T")[0];

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5B4FCF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showPicker) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Выберите дату</h2>
          <input
            type="date"
            max={today}
            value={pickerDate}
            onChange={(e) => setPickerDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/30 mb-4"
          />
          <button
            onClick={handlePickerSubmit}
            disabled={!pickerDate}
            className="w-full bg-[#5B4FCF] text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40 hover:bg-[#4a3fbe] transition-colors"
          >
            Продолжить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <p className="text-4xl font-light text-gray-800 tabular-nums">{formatTime(now)}</p>
        <p className="text-gray-500 text-sm mt-1 capitalize">{formatDate(now)}</p>
        {dateParam && dateParam !== today && (
          <p className="mt-2 text-xs text-[#5B4FCF] bg-[#5B4FCF]/10 rounded-full px-3 py-1 inline-block">
            Запись за {new Date(dateParam + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
          </p>
        )}
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mb-8">Как ты себя чувствуешь?</h2>

      <div className="flex gap-5">
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelect(m.id)}
            className={`flex flex-col items-center gap-2 transition-all duration-200 ${
              selected === m.id ? "scale-125" : "hover:scale-110"
            }`}
          >
            <span
              className="text-5xl select-none"
              style={{ filter: selected !== null && selected !== m.id ? "grayscale(1) opacity(0.3)" : "none" }}
            >
              {m.emoji}
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: selected !== null && selected !== m.id ? "#9ca3af" : m.color }}
            >
              {m.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MoodPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5B4FCF] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MoodContent />
    </Suspense>
  );
}
