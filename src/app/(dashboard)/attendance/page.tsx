
"use client";

import { useEffect, useState, FormEvent } from "react";

type Attendance = {
  id: string;
  studentName: string;
  course: string;
  date: string;
  status: string;
};

function formatDate(value: string | Date) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return String(value).slice(0, 10);
}

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    studentName: "",
    course: "",
    date: "",
    status: "Present",
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function fetchAttendance() {
    try {
      setLoading(true);

      const response = await fetch("/api/attendance");

      if (!response.ok) {
        throw new Error("Failed to fetch attendance");
      }

      const data = await response.json();

      setRecords(
        data.map((item: any) => ({
          id: String(item.id),
          studentName: item.student_name,
          course: item.course,
          date: formatDate(item.attendance_date),
          status: item.status,
        }))
      );
    } catch (error) {
      console.error("Fetch Attendance Error:", error);
      alert("Unable to load attendance records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: getToday(),
    }));

    fetchAttendance();
  }, []);

  const filteredRecords = records.filter(
    (record) =>
      record.studentName.toLowerCase().includes(search.toLowerCase()) ||
      record.course.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = records.filter(
    (r) => r.status === "Present"
  ).length;

  const absentCount = records.filter(
    (r) => r.status === "Absent"
  ).length;

  const leaveCount = records.filter(
    (r) => r.status === "Leave"
  ).length;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);

      let response;

      const body = {
        student_name: formData.studentName,
        course: formData.course,
        attendance_date: formData.date,
        status: formData.status,
      };

      if (editId !== null) {
        response = await fetch(`/api/attendance/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
      } else {
        response = await fetch("/api/attendance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: `ATT${Date.now()}`,
            ...body,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed");
      }

      alert(
        editId !== null
          ? "Attendance Updated Successfully!"
          : "Attendance Added Successfully!"
      );

      setEditId(null);

      setFormData({
        studentName: "",
        course: "",
        date: getToday(),
        status: "Present",
      });

      await fetchAttendance();
    } catch (error) {
      console.error("Save Attendance Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record: Attendance) => {
    setFormData({
      studentName: record.studentName,
      course: record.course,
      date: record.date,
      status: record.status,
    });

    setEditId(record.id);
  };

  const handleDelete = async (id: string) => {
    if (
      confirm("Are you sure you want to delete this attendance?")
    ) {
      try {
        const response = await fetch(`/api/attendance/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Delete failed");
        }

        alert("Attendance Deleted Successfully!");

        await fetchAttendance();
      } catch (error) {
        console.error("Delete Attendance Error:", error);
        alert(
          error instanceof Error
            ? error.message
            : "Unable to delete attendance"
        );
      }
    }
  };

  const handleCancel = () => {
    setEditId(null);

    setFormData({
      studentName: "",
      course: "",
      date: getToday(),
      status: "Present",
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
          <span>Dashboard</span>
          <span className="text-slate-400">/</span>
          <span>Attendance</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
          Attendance Management
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Track and manage daily student attendance records.
        </p>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Records
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-800">
                {records.length}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                All attendance entries
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              📋
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Present
              </p>
              <h2 className="mt-3 text-3xl font-bold text-emerald-600">
                {presentCount}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Present records
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
              ✓
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Absent
              </p>
              <h2 className="mt-3 text-3xl font-bold text-rose-600">
                {absentCount}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Absent records
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl">
              ✕
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Leave
              </p>
              <h2 className="mt-3 text-3xl font-bold text-amber-600">
                {leaveCount}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Leave records
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl">
              🗓️
            </div>
          </div>
        </div>

      </div>

      {/* Attendance Form */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-800">
            {editId !== null ? "Edit Attendance" : "Mark Student Attendance"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter student details and attendance status.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Student Name *
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                placeholder="Enter student name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Course Name *
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="Enter course name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Attendance Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Attendance Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </div>

          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editId !== null
                  ? "Update Attendance"
                  : "Mark Attendance"}
            </button>

            {editId !== null && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-slate-200 bg-white px-7 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            )}

          </div>
        </form>
      </div>

      {/* Attendance Records */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Attendance Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View and manage student attendance.
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              ⌕
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or course..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">

            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">S.No</th>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
                      <p className="text-sm text-slate-500">
                        Loading attendance records...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className="transition hover:bg-blue-50/40"
                  >
                    <td className="px-6 py-5 text-sm text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-800">
                        {record.studentName}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        Student Record
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {record.course}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {record.date}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={
                          record.status === "Present"
                            ? "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                            : record.status === "Absent"
                              ? "inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                              : "inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                        }
                      >
                        <span
                          className={
                            record.status === "Present"
                              ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                              : record.status === "Absent"
                                ? "h-1.5 w-1.5 rounded-full bg-rose-500"
                                : "h-1.5 w-1.5 rounded-full bg-amber-500"
                          }
                        ></span>
                        {record.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(record.id)}
                          className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="text-4xl">📋</div>
                    <p className="mt-3 font-semibold text-slate-700">
                      No Attendance Records Found
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try another search or add an attendance record.
                    </p>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {filteredRecords.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {records.length}
          </span>{" "}
          attendance records
        </div>

      </div>

    </main>
  );
}
