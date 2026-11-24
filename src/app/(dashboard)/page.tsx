
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RecordData = Record<string, unknown>;

const menuItems = [
  { name: "Dashboard", path: "/", icon: "⌂", color: "blue" },
  { name: "Students", path: "/students", icon: "🎓", color: "blue" },
  { name: "Teachers", path: "/teachers", icon: "👨‍🏫", color: "emerald" },
  { name: "Courses", path: "/courses", icon: "📚", color: "purple" },
  { name: "Attendance", path: "/attendance", icon: "📅", color: "amber" },
  { name: "Fees Management", path: "/fees", icon: "💰", color: "rose" },
];

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Dashboard() {
  const [students, setStudents] = useState<RecordData[]>([]);
  const [teachers, setTeachers] = useState<RecordData[]>([]);
  const [courses, setCourses] = useState<RecordData[]>([]);
  const [fees, setFees] = useState<RecordData[]>([]);
  const [attendance, setAttendance] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [today, setToday] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setToday(getTodayDate());

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError("");

        const responses = await Promise.all([
          fetch("/api/students"),
          fetch("/api/teachers"),
          fetch("/api/courses"),
          fetch("/api/fees"),
          fetch("/api/attendance"),
        ]);

        if (responses.some((response) => !response.ok)) {
          throw new Error("Unable to load dashboard data");
        }

        const [
          studentsData,
          teachersData,
          coursesData,
          feesData,
          attendanceData,
        ] = await Promise.all(responses.map((response) => response.json()));

        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setFees(Array.isArray(feesData) ? feesData : []);
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError("Dashboard data load ஆகவில்லை. Please refresh.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.href = "/login";
    } catch (err) {
      console.error("Logout Error:", err);
      setError("Logout செய்ய முடியவில்லை. Please try again.");
      setLoggingOut(false);
    }
  }

  const todayAttendance = attendance.filter((item) => {
    const rawDate = String(item.attendance_date || item.date || "");
    if (!rawDate) return false;

    const date = rawDate.includes("T")
      ? new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(rawDate))
      : rawDate.slice(0, 10);

    return date === today;
  });

  const presentCount = todayAttendance.filter(
    (item) => String(item.status).toLowerCase() === "present"
  ).length;

  const absentCount = todayAttendance.filter(
    (item) => String(item.status).toLowerCase() === "absent"
  ).length;

  const leaveCount = todayAttendance.filter(
    (item) => String(item.status).toLowerCase() === "leave"
  ).length;

  const totalFees = fees.reduce(
    (total, fee) => total + Number(fee.paid_amount || 0),
    0
  );

  const attendancePercentage =
    todayAttendance.length > 0
      ? Math.round((presentCount / todayAttendance.length) * 100)
      : 0;

  const summaryCards = [
    {
      title: "Total Students",
      value: students.length.toLocaleString("en-IN"),
      icon: "🎓",
      subtitle: "Registered students",
      gradient: "from-blue-500 to-indigo-600",
      light: "bg-blue-50",
    },
    {
      title: "Total Teachers",
      value: teachers.length.toLocaleString("en-IN"),
      icon: "👨‍🏫",
      subtitle: "Teaching staff",
      gradient: "from-emerald-500 to-teal-600",
      light: "bg-emerald-50",
    },
    {
      title: "Total Courses",
      value: courses.length.toLocaleString("en-IN"),
      icon: "📚",
      subtitle: "Available courses",
      gradient: "from-violet-500 to-purple-600",
      light: "bg-violet-50",
    },
    {
      title: "Fees Collection",
      value: `₹${totalFees.toLocaleString("en-IN")}`,
      icon: "💰",
      subtitle: "Total amount collected",
      gradient: "from-orange-500 to-rose-500",
      light: "bg-orange-50",
    },
  ];

  const activities = [
    ...students.map((item) => ({
      label: `New Student: ${String(item.name || "Student")}`,
      date: String(item.created_at || ""),
      icon: "🎓",
    })),
    ...teachers.map((item) => ({
      label: `Teacher: ${String(item.name || "Teacher")}`,
      date: String(item.created_at || ""),
      icon: "👨‍🏫",
    })),
    ...courses.map((item) => ({
      label: `Course: ${String(item.name || "Course")}`,
      date: String(item.created_at || ""),
      icon: "📚",
    })),
    ...fees.map((item) => ({
      label: `Fee Payment: ${String(item.student_name || "Student")} - ₹${Number(item.paid_amount || 0).toLocaleString("en-IN")}`,
      date: String(item.created_at || item.payment_date || ""),
      icon: "💰",
    })),
    ...attendance.map((item) => ({
      label: `Attendance: ${String(item.student_name || "Student")} - ${String(item.status || "")}`,
      date: String(item.created_at || item.attendance_date || ""),
      icon: "📅",
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-[#101b36] text-white shadow-2xl md:flex">

        <div className="border-b border-white/10 px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-violet-600 text-2xl shadow-lg shadow-blue-900/40">
              🏫
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-wide">
                Smart Institute
              </h1>
              <p className="text-xs text-blue-200">
                Management System
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Main Navigation
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  item.path === "/"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/40"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
                {item.path === "/" && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-white" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-5">
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-bold">Administrator</p>
              <p className="text-xs text-slate-400">System Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full rounded-xl border border-white/15 px-4 py-3 text-left text-sm font-semibold text-slate-300 transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "↪  Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen md:ml-64">

        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-5 py-4 shadow-sm backdrop-blur-xl md:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-xl bg-slate-100 p-2 text-xl md:hidden"
                aria-label="Toggle navigation"
              >
                ☰
              </button>

              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900 md:text-xl">
                  Dashboard Overview
                </h2>
                <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                  Welcome back! Here is your institute summary.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 sm:px-4 sm:text-sm">
                📅 {today || "Loading..."}
              </div>

              <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 font-bold text-white shadow-md sm:flex">
                A
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50 md:hidden"
              >
                {loggingOut ? "..." : "Logout"}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 md:hidden">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold ${
                    item.path === "/"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {item.icon} {item.name}
                </Link>
              ))}
            </nav>
          )}
        </header>

        <div className="space-y-8 p-5 md:p-8">

          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#142957] via-[#283c91] to-[#6846bd] p-7 text-white shadow-xl shadow-indigo-900/10 md:p-9">
            <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
            <div className="absolute -bottom-24 right-36 h-56 w-56 rounded-full bg-blue-300/10 blur-2xl" />

            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-blue-100">
                  ✦ SMART INSTITUTE MANAGEMENT
                </div>

                <h1 className="text-2xl font-extrabold leading-tight md:text-4xl">
                  Welcome to your Dashboard
                  <span className="ml-2">👋</span>
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                  Manage your institute efficiently. Track students,
                  teachers, courses, attendance and fee collections
                  all in one place.
                </p>
              </div>

              <div className="hidden shrink-0 items-center justify-center sm:flex">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-6xl shadow-xl backdrop-blur">
                  🏫
                </div>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              ⚠️ {error}
            </div>
          )}

          {/* Statistics */}
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                  Overview
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  Institute Statistics
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your institute performance at a glance
                </p>
              </div>
              <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:inline-flex">
                ● Live Data
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-full ${card.light} opacity-70 transition-transform group-hover:scale-125`} />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">
                        {card.title}
                      </p>
                      <h3 className="mt-4 break-all text-2xl font-extrabold tracking-tight text-slate-900">
                        {loading ? "..." : card.value}
                      </h3>
                      <p className="mt-2 text-xs text-slate-400">
                        {card.subtitle}
                      </p>
                    </div>

                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-2xl text-white shadow-lg`}>
                      {card.icon}
                    </div>
                  </div>

                  <div className={`mt-5 h-1.5 overflow-hidden rounded-full ${card.light}`}>
                    <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${card.gradient}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Attendance Overview */}
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-7">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                  Daily Report
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  Today&apos;s Attendance
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Attendance summary for today
                </p>
              </div>

              <span className="w-fit rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
                📅 {today || "Loading..."}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-emerald-800">
                    Present
                  </p>
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="mt-3 text-4xl font-extrabold text-emerald-700">
                  {loading ? "..." : presentCount}
                </h3>
                <p className="mt-2 text-xs text-emerald-600">
                  Students present today
                </p>
              </div>

              <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-red-800">
                    Absent
                  </p>
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="mt-3 text-4xl font-extrabold text-red-700">
                  {loading ? "..." : absentCount}
                </h3>
                <p className="mt-2 text-xs text-red-600">
                  Students absent today
                </p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-amber-800">
                    Leave
                  </p>
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="mt-3 text-4xl font-extrabold text-amber-700">
                  {loading ? "..." : leaveCount}
                </h3>
                <p className="mt-2 text-xs text-amber-600">
                  Students on leave today
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-700">
                  Attendance Rate
                </span>
                <span className="text-lg font-extrabold text-blue-700">
                  {loading ? "..." : `${attendancePercentage}%`}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
                  style={{ width: `${attendancePercentage}%` }}
                />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Total attendance records today:{" "}
                <strong className="text-slate-800">
                  {loading ? "..." : todayAttendance.length}
                </strong>
              </p>
            </div>
          </section>

          {/* Quick Access */}
          <section>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                Quick Navigation
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                Management Modules
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Quickly access your institute management sections
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {menuItems.slice(1).map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-3xl transition-all group-hover:bg-blue-50 group-hover:scale-105">
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-slate-800 transition group-hover:text-blue-700">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Manage {item.name.toLowerCase()} records
                    </p>
                  </div>

                  <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Activities */}
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-7">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                Latest Updates
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                Recent Activities
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest updates from your institute
              </p>
            </div>

            {loading ? (
              <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                Loading activities...
              </p>
            ) : activities.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                No recent activities found.
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-xl p-3 transition hover:bg-slate-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                      {activity.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-bold text-slate-700">
                        {activity.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {activity.date
                          ? new Date(activity.date).toLocaleString("en-IN")
                          : "Date unavailable"}
                      </p>
                    </div>

                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="border-t border-slate-200 py-6 text-center">
            <p className="text-xs font-medium text-slate-400">
              © 2026 Smart Institute Management System. All rights reserved.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Designed for smarter institute management.
            </p>
          </footer>

        </div>
      </main>
    </div>
  );
}
