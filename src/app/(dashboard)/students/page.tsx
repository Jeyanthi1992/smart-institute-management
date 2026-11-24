
"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  name: string;
  email: string;
  course: string;
  phone: string;
  status: "Active" | "Inactive";
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
    phone: "",
    status: "Active" as "Active" | "Inactive",
  });

  async function fetchStudents() {
    try {
      setLoading(true);
      const response = await fetch("/api/students");

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
      alert("Unable to load students. Please check the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function openAddForm() {
    setEditId(null);
    setFormData({
      name: "",
      email: "",
      course: "",
      phone: "",
      status: "Active",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      const isEditing = editId !== null;

      const response = await fetch(
        isEditing ? `/api/students/${editId}` : "/api/students",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEditing
              ? formData
              : { id: `STU${Date.now()}`, ...formData }
          ),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Operation failed");
      }

      alert(
        isEditing
          ? "Student updated successfully!"
          : "Student added successfully!"
      );

      setShowForm(false);
      setEditId(null);
      await fetchStudents();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(student: Student) {
    setEditId(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      course: student.course,
      phone: student.phone,
      status: student.status,
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed");
      }

      alert("Student deleted successfully!");
      await fetchStudents();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Unable to delete student"
      );
    }
  }

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();

    return (
      student.name.toLowerCase().includes(searchText) ||
      student.id.toLowerCase().includes(searchText) ||
      student.email.toLowerCase().includes(searchText) ||
      student.course.toLowerCase().includes(searchText) ||
      student.phone.includes(searchText)
    );
  });

  const activeCount = students.filter(
    (s) => s.status === "Active"
  ).length;

  const inactiveCount = students.filter(
    (s) => s.status === "Inactive"
  ).length;

  const inputStyle =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100";

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold text-blue-600">
              STUDENT MANAGEMENT
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Students
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage and monitor all institute student records.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            + Add New Student
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Students
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-800">
                  {students.length}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                👨‍🎓
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              All registered students
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Students
                </p>
                <h2 className="mt-3 text-3xl font-bold text-emerald-600">
                  {activeCount}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                ✓
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Currently active students
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Inactive Students
                </p>
                <h2 className="mt-3 text-3xl font-bold text-rose-600">
                  {inactiveCount}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-2xl">
                !
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Currently inactive students
            </p>
          </div>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-800">
                {editId ? "Edit Student Details" : "Add New Student"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the student information below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Student Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter student name"
                    required
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10 digit phone number"
                    required
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Course
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  >
                    <option value="">Select Course</option>
                    <option value="Python Full Stack">Python Full Stack</option>
                    <option value="Java Full Stack">Java Full Stack</option>
                    <option value="Data Science">Data Science</option>
                    <option value="MERN Stack">MERN Stack</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Student Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={inputStyle}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editId
                    ? "Update Student"
                    : "Save Student"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Student Records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage registered students.
              </p>
            </div>

            <div className="w-full md:max-w-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, ID, email, course..."
                className={inputStyle}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Student ID</th>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Course</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      Loading students...
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="transition hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                            {student.id}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {student.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {student.email}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {student.course}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {student.phone}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              student.status === "Active"
                                ? "rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                                : "rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                            }
                          >
                            {student.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(student.id)}
                              className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredStudents.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-12 text-center text-sm text-slate-400"
                        >
                          No students found.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-400">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
