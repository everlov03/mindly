"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BarChart2, Calendar, BookMarked } from "lucide-react";
import PlusFab from "./PlusFab";

const NAV_ITEMS = [
  { href: "/records", icon: BookOpen, label: "Записи" },
  { href: "/stats", icon: BarChart2, label: "Статистика" },
  { href: "/calendar", icon: Calendar, label: "Календарь" },
  { href: "/diary", icon: BookMarked, label: "Дневник", disabled: true },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.slice(0, 2).map(({ href, icon: Icon, label }) => (
          <NavLink key={href} href={href} icon={Icon} label={label} active={pathname === href} />
        ))}

        <PlusFab />

        {NAV_ITEMS.slice(2).map(({ href, icon: Icon, label, disabled }) =>
          disabled ? (
            <button
              key={href}
              disabled
              className="flex flex-col items-center gap-0.5 text-gray-300 cursor-not-allowed"
            >
              <Icon size={22} />
              <span className="text-[10px]">{label}</span>
            </button>
          ) : (
            <NavLink key={href} href={href} icon={Icon} label={label} active={pathname === href} />
          )
        )}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 transition-colors ${
        active ? "text-[#5B4FCF]" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      <Icon size={22} />
      <span className="text-[10px]">{label}</span>
    </Link>
  );
}
