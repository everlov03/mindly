"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Target, CalendarDays, ChevronLeft } from "lucide-react";
import NewGoalModal from "./NewGoalModal";

export default function PlusFab() {
  const [open, setOpen] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleToday() {
    setOpen(false);
    const today = new Date().toISOString().split("T")[0];
    router.push(`/mood?date=${today}`);
  }

  function handleYesterday() {
    setOpen(false);
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().split("T")[0];
    router.push(`/mood?date=${yesterday}`);
  }

  function handleOtherDay() {
    setOpen(false);
    router.push("/mood?picker=true");
  }

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      {open && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <button
            onClick={() => { setOpen(false); setShowGoalModal(true); }}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Target size={16} className="text-[#5B4FCF]" />
            Новая цель
          </button>
          <div className="h-px bg-gray-100" />
          <button
            onClick={handleToday}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            <CalendarDays size={16} className="text-[#5B4FCF]" />
            Сегодня
          </button>
          <button
            onClick={handleYesterday}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft size={16} className="text-[#5B4FCF]" />
            Вчера
          </button>
          <button
            onClick={handleOtherDay}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            <CalendarDays size={16} className="text-gray-400" />
            Другой день
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
          open
            ? "bg-gray-200 rotate-45"
            : "bg-[#5B4FCF] hover:bg-[#4a3fbe]"
        }`}
        aria-label="Добавить запись"
      >
        {open ? <X size={22} className="text-gray-600" /> : <Plus size={22} className="text-white" />}
      </button>

      {showGoalModal && (
        <NewGoalModal onClose={() => setShowGoalModal(false)} />
      )}
    </div>
  );
}
