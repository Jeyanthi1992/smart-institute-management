
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", path: "/", icon: "⌂" },
  { name: "Students", path: "/students", icon: "♙" },
  { name: "Teachers", path: "/teachers", icon: "♟" },
  { name: "Courses", path: "/courses", icon: "▤" },
  { name: "Attendance", path: "/attendance", icon: "▦" },
  { name: "Fees Management", path: "/fees", icon: "₹" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-gradient-to-b from-[#101d3a] to-[#172b50] px-4 py-6 text-white shadow-xl">

      {/* Logo */}
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-2xl font-bold shadow-lg shadow-blue-900/40">
          S
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-wide">
            Smart Institute
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-[2px] text-blue-200">
            Management System
          </p>
        </div>
      </div>

      {/* Navigation Heading */}
      <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-blue-300">
        Main Menu
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/40"
                  : "text-blue-100 hover:translate-x-1 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xl transition ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-blue-200 group-hover:bg-white/10"
                }`}
              >
                {item.icon}
              </span>

              <span className="text-sm font-semibold">
                {item.name}
              </span>

              {isActive && (
                <span className="ml-auto h-2 w-2 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold text-white">
          Smart Institute
        </p>
        <p className="mt-1 text-xs text-blue-200">
          Student Management Portal
        </p>
        <p className="mt-3 text-[10px] text-blue-300">
          © 2026 All Rights Reserved
        </p>
      </div>

    </aside>
  );
}
