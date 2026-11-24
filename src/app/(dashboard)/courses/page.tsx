
"use client";

import { useEffect, useState } from "react";

type Course = {
  id: string;
  name: string;
  duration: string;
  fee: number;
  description: string;
  status: "Active" | "Inactive";
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    fee: "",
    description: "",
    status: "Active" as "Active" | "Inactive",
  });

  async function fetchCourses() {
    try {
      setLoading(true);

      const response = await fetch("/api/courses");

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();

      setCourses(
        data.map((course: any) => ({
          ...course,
          fee: Number(course.fee),
        }))
      );
    } catch (error) {
      console.error("Fetch Courses Error:", error);
      alert("Unable to load courses. Please check the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function openAddForm() {
    setEditId(null);

    setFormData({
      name: "",
      duration: "",
      fee: "",
      description: "",
      status: "Active",
    });

    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fee = Number(formData.fee);

    if (!Number.isFinite(fee) || fee <= 0) {
      alert("Please enter a valid course fee.");
      return;
    }

    try {
      setSaving(true);

      let response;

      if (editId) {
        response = await fetch(`/api/courses/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            fee,
          }),
        });
      } else {
        response = await fetch("/api/courses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: `CRS${Date.now()}`,
            ...formData,
            fee,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed");
      }

      alert(
        editId
          ? "Course updated successfully!"
          : "Course added successfully!"
      );

      setShowForm(false);
      setEditId(null);

      await fetchCourses();
    } catch (error) {
      console.error("Save Course Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(course: Course) {
    setEditId(course.id);

    setFormData({
      name: course.name,
      duration: course.duration,
      fee: String(course.fee),
      description: course.description,
      status: course.status,
    });

    setShowForm(true);
  }

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Delete failed");
      }

      alert("Course deleted successfully!");

      await fetchCourses();
    } catch (error) {
      console.error("Delete Course Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete course"
      );
    }
  }

  const filteredCourses = courses.filter((course) => {
    const searchText = search.toLowerCase();

    return (
      course.name.toLowerCase().includes(searchText) ||
      course.id.toLowerCase().includes(searchText) ||
      course.description.toLowerCase().includes(searchText)
    );
  });

  const activeCourses = courses.filter(
    (course) => course.status === "Active"
  ).length;

  const inactiveCourses = courses.filter(
    (course) => course.status === "Inactive"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">

      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <span>Dashboard</span>
            <span className="text-slate-400">/</span>
            <span>Courses</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Courses Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage institute courses, duration and fees.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <span className="text-xl">+</span>
          Add New Course
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Courses
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-800">
                {courses.length}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                All registered courses
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              📚
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Courses
              </p>
              <h2 className="mt-3 text-3xl font-bold text-emerald-600">
                {activeCourses}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Currently available
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
              ✓
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Inactive Courses
              </p>
              <h2 className="mt-3 text-3xl font-bold text-rose-600">
                {inactiveCourses}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Currently unavailable
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-2xl">
              ⏸
            </div>
          </div>
        </div>

      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {editId ? "Edit Course Details" : "Add New Course"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the course information below.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="rounded-lg px-3 py-2 text-xl text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Course Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter course name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Course Duration *
                </label>
                <input
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 6 Months"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Course Fee (₹) *
                </label>
                <input
                  name="fee"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.fee}
                  onChange={handleChange}
                  placeholder="Enter course fee"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Course Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Course Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter course description"
                  required
                  rows={4}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
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
                  : editId
                    ? "Update Course"
                    : "Save Course"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-7 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Search and Course List */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              All Courses
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View and manage your institute courses.
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
              placeholder="Search by name, ID or description..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">

            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-semibold">Course ID</th>
                <th className="px-6 py-4 font-semibold">Course Name</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Course Fee</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
                      <p className="text-sm text-slate-500">
                        Loading courses...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="transition hover:bg-blue-50/40"
                    >
                      <td className="px-6 py-5 text-sm font-medium text-slate-500">
                        {course.id}
                      </td>

                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-800">
                          {course.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Institute Course
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {course.duration}
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                        ₹{course.fee.toLocaleString("en-IN")}
                      </td>

                      <td className="max-w-[220px] px-6 py-5 text-sm text-slate-500">
                        <p className="line-clamp-2">
                          {course.description}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={
                            course.status === "Active"
                              ? "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                              : "inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                          }
                        >
                          <span
                            className={
                              course.status === "Active"
                                ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
                                : "h-1.5 w-1.5 rounded-full bg-rose-500"
                            }
                          ></span>
                          {course.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(course)}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(course.id)}
                            className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="text-4xl">📚</div>
                        <p className="mt-3 font-semibold text-slate-700">
                          No courses found
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Try another search or add a new course.
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              )}

            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {filteredCourses.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {courses.length}
          </span>{" "}
          courses
        </div>

      </div>

    </main>
  );
}
