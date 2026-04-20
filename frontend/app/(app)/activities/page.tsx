"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import api from "@/lib/api";

interface ActivityItem {
  id: number;
  label: string;
  emoji: string;
  user_id: number | null;
}

interface ActivityCategory {
  id: number;
  name: string;
  items: ActivityItem[];
}

function ActivitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];
  const moodId = searchParams.get("mood_id");

  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [addModal, setAddModal] = useState<{ categoryId: number; name: string } | null>(null);
  const [newEmoji, setNewEmoji] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    api.get("/activities/categories").then((res) => setCategories(res.data));
  }, []);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.post("/entries", {
        date,
        mood_id: moodId ? parseInt(moodId) : null,
        note: note.trim() || null,
        activity_ids: Array.from(selected),
      });
      const entryId = res.data.id;

      if (photoFile) {
        const form = new FormData();
        form.append("file", photoFile);
        await api.post(`/entries/${entryId}/photos`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      router.push("/records");
    } catch {
      alert("Не удалось сохранить запись");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCustom() {
    if (!addModal || !newLabel.trim()) return;
    setAddLoading(true);
    try {
      const res = await api.post("/activities/custom", {
        category_id: addModal.categoryId,
        label: newLabel.trim(),
        emoji: newEmoji.trim() || "⭐",
      });
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === addModal.categoryId
            ? { ...cat, items: [...cat.items, res.data] }
            : cat
        )
      );
      setAddModal(null);
      setNewEmoji("");
      setNewLabel("");
    } catch {
      alert("Не удалось добавить активность");
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-1">Активности</h1>
      <p className="text-sm text-gray-400 mb-6">
        {new Date(date + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
      </p>

      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {cat.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                    selected.has(item.id)
                      ? "bg-[#5B4FCF] text-white border-[#5B4FCF]"
                      : "bg-white text-gray-700 border-gray-200 hover:border-[#5B4FCF]/40"
                  }`}
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                onClick={() => setAddModal({ categoryId: cat.id, name: cat.name })}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-dashed border-gray-300 text-gray-400 hover:border-[#5B4FCF] hover:text-[#5B4FCF] transition-colors"
              >
                <Plus size={13} />
                Добавить своё
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Добавить заметку..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/30 resize-none"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={() => photoRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-[#5B4FCF]/40 transition-colors"
          >
            <ImageIcon size={16} />
            {photoFile ? photoFile.name : "Прикрепить фото"}
          </button>
          {photoFile && (
            <button onClick={() => setPhotoFile(null)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full bg-[#5B4FCF] text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50 hover:bg-[#4a3fbe] transition-colors"
      >
        {saving ? "Сохраняем..." : "Сохранить"}
      </button>

      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">
                Добавить в «{addModal.name}»
              </h2>
              <button onClick={() => setAddModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Эмодзи (необязательно)"
                maxLength={4}
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/30"
              />
              <input
                autoFocus
                type="text"
                placeholder="Название активности"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/30"
              />
              <button
                onClick={handleAddCustom}
                disabled={addLoading || !newLabel.trim()}
                className="w-full bg-[#5B4FCF] text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50 hover:bg-[#4a3fbe] transition-colors"
              >
                {addLoading ? "Добавляем..." : "Добавить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActivitiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5B4FCF] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ActivitiesContent />
    </Suspense>
  );
}
