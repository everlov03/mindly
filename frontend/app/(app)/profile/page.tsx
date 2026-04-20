"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Pencil, X, Check } from "lucide-react";
import api from "@/lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/me")
      .then(res => {
        setUser(res.data);
        setName(res.data.name);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await api.patch("/users/me", { name: name.trim() });
      setUser(res.data);
      setEditing(false);
    } catch {
      setError("Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5B4FCF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinedDate = new Date(user.created_at).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-[#5B4FCF] flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-md">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            initials
          )}
        </div>

        {editing ? (
          <div className="flex items-center gap-2 w-full max-w-xs">
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4FCF]/30 text-center"
            />
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="p-2 rounded-xl bg-[#5B4FCF] text-white hover:bg-[#4a3fbe] disabled:opacity-50 transition-colors"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => { setEditing(false); setName(user.name); setError(""); }}
              className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 text-gray-400 hover:text-[#5B4FCF] transition-colors"
            >
              <Pencil size={15} />
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 mb-6">
        <div className="flex justify-between px-5 py-4">
          <span className="text-sm text-gray-500">Email</span>
          <span className="text-sm text-gray-800 font-medium">{user.email}</span>
        </div>
        <div className="flex justify-between px-5 py-4">
          <span className="text-sm text-gray-500">Дата регистрации</span>
          <span className="text-sm text-gray-800">{joinedDate}</span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} />
        Выйти из аккаунта
      </button>
    </div>
  );
}
