
"use client";

import { useEffect, useState } from "react";

type Teacher = {
  id: string;
  name: string;
  email: string;
  subject: string;
  phone: string;
  experience: string;
  status: "Active" | "Inactive";
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    phone: "",
    experience: "",
    status: "Active" as "Active" | "Inactive",
  });

  async function fetchTeachers() {
    try {
      setLoading(true);

      const response = await fetch("/api/teachers");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load teachers");
      }

      const formattedTeachers: Teacher[] = data.map((teacher: any) => ({
        ...teacher,
        id: String(teacher.id),
        experience: `${teacher.experience ?? 0} Years`,
        status: teacher.status === "Inactive" ? "Inactive" : "Active",
      }));

      setTeachers(formattedTeachers);
    } catch (error) {
      console.error("Fetch Teachers Error:", error);
      alert("Unable to load teachers. Please check the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeachers();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      email: "",
      subject: "",
      phone: "",
      experience: "",
      status: "Active",
    });

    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const experienceNumber = Number.parseInt(formData.experience, 10);

    if (!Number.isFinite(experienceNumber) || experienceNumber < 0) {
      alert("Please enter valid experience in years.");
      return;
    }

    const teacherData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject,
      phone: formData.phone,
      experience: experienceNumber,
      status: formData.status,
    };

    try {
      setSaving(true);

      const url = editId
        ? `/api/teachers/${encodeURIComponent(editId)}`
        : "/api/teachers";

      const method = editId ? "PUT" : "POST";

      const body = editId
        ? teacherData
        : {
            id: `TCH${Date.now()}`,
            ...teacherData,
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save teacher");
      }

      alert(
        editId
          ? "Teacher updated successfully!"
          : "Teacher added successfully!"
      );

      setShowForm(false);
      setEditId(null);

      setFormData({
        name: "",
        email: "",
        subject: "",
        phone: "",
        experience: "",
        status: "Active",
      });

      await fetchTeachers();
    } catch (error) {
      console.error("Save Teacher Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving teacher."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(teacher: Teacher) {
    setEditId(teacher.id);

    setFormData({
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
      phone: teacher.phone,
      experience: teacher.experience.replace(/\D/g, ""),
      status: teacher.status,
    });

    setShowForm(true);
  }

  async function handleDelete(id: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `/api/teachers/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete teacher");
      }

      alert("Teacher deleted successfully!");

      await fetchTeachers();
    } catch (error) {
      console.error("Delete Teacher Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete teacher."
      );
    }
  }

  const filteredTeachers = teachers.filter((teacher) => {
    const searchText = search.toLowerCase();

    return (
      teacher.name.toLowerCase().includes(searchText) ||
      teacher.id.toLowerCase().includes(searchText) ||
      teacher.email.toLowerCase().includes(searchText) ||
      teacher.subject.toLowerCase().includes(searchText) ||
      teacher.phone.includes(searchText)
    );
  });

  const activeCount = teachers.filter(
    (t) => t.status === "Active"
  ).length;

  const inactiveCount = teachers.filter(
    (t) => t.status === "Inactive"
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
              FACULTY MANAGEMENT
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Teachers
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage and monitor your institute teaching faculty.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            + Add New Teacher
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Teachers
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-800">
                  {teachers.length}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                👨‍🏫
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              All registered faculty members
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Teachers
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
              Currently active faculty
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Inactive Teachers
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
              Currently inactive faculty
            </p>
          </div>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-800">
                {editId ? "Edit Teacher Details" : "Add New Teacher"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the teacher information below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Teacher Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter teacher name"
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
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  >
                    <option value="">Select Subject</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="Data Science">Data Science</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Database">Database</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Experience (Years)
                  </label>
                  <input
                    name="experience"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]+"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    required
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Teacher Status
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
                    ? "Update Teacher"
                    : "Save Teacher"}
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

        {/* Teacher Records */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Faculty Records
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage registered teachers.
              </p>
            </div>

            <div className="w-full md:max-w-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, ID, email, subject..."
                className={inputStyle}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Teacher ID</th>
                  <th className="px-5 py-4">Teacher</th>
                  <th className="px-5 py-4">Subject</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Experience</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                      Loading teachers...
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredTeachers.map((teacher) => (
                      <tr
                        key={teacher.id}
                        className="transition hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                            {teacher.id}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {teacher.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {teacher.email}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                            {teacher.subject}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {teacher.phone}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-600">
                          {teacher.experience}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              teacher.status === "Active"
                                ? "rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                                : "rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                            }
                          >
                            {teacher.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(teacher)}
                              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(teacher.id)}
                              className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredTeachers.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-12 text-center text-sm text-slate-400"
                        >
                          No teachers found.
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
              Showing {filteredTeachers.length} of {teachers.length} teachers
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
