
"use client";

import { useState, useEffect, FormEvent } from "react";

type Fee = {
  id: string;
  studentName: string;
  course: string;
  totalFee: number;
  paidAmount: number;
  paymentDate: string;
  paymentMode: string;
};

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    studentName: "",
    course: "",
    totalFee: "",
    paidAmount: "",
    paymentDate: "",
    paymentMode: "UPI",
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const fetchFees = async () => {
    try {
      const response = await fetch("/api/fees");

      if (!response.ok) {
        throw new Error("Failed to fetch fees");
      }

      const data = await response.json();

      const formattedFees: Fee[] = data.map((fee: any) => {
        let date = "";

        if (typeof fee.payment_date === "string") {
          date = fee.payment_date.slice(0, 10);
        } else if (fee.payment_date) {
          const d = new Date(fee.payment_date);
          date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        }

        return {
          id: String(fee.id),
          studentName: fee.student_name,
          course: fee.course || "",
          totalFee: Number(fee.total_fee),
          paidAmount: Number(fee.paid_amount),
          paymentDate: date,
          paymentMode: fee.payment_mode || "",
        };
      });

      setFees(formattedFees);
    } catch (error) {
      console.error("Fetch Fees Error:", error);
      alert("Unable to load fee records. Check MySQL connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      paymentDate: getToday(),
    }));

    fetchFees();
  }, []);

  const totalCollection = fees.reduce(
    (sum, fee) => sum + fee.paidAmount, 0
  );

  const totalPending = fees.reduce(
    (sum, fee) => sum + Math.max(0, fee.totalFee - fee.paidAmount), 0
  );

  const totalFees = fees.reduce(
    (sum, fee) => sum + fee.totalFee, 0
  );

  const filteredFees = fees.filter(
    (fee) =>
      fee.studentName.toLowerCase().includes(search.toLowerCase()) ||
      fee.course.toLowerCase().includes(search.toLowerCase())
  );

  const getPending = (fee: Fee) =>
    Math.max(0, fee.totalFee - fee.paidAmount);

  const getStatus = (fee: Fee) => {
    if (fee.paidAmount >= fee.totalFee) return "Paid";
    if (fee.paidAmount > 0) return "Partial";
    return "Pending";
  };

  const formatAmount = (amount: number) =>
    "₹" + amount.toLocaleString("en-IN");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setEditId(null);

    setFormData({
      studentName: "",
      course: "",
      totalFee: "",
      paidAmount: "",
      paymentDate: getToday(),
      paymentMode: "UPI",
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const total = Number(formData.totalFee);
    const paid = Number(formData.paidAmount);

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(paid) ||
      total <= 0 ||
      paid < 0 ||
      paid > total
    ) {
      alert("Please enter valid fee amounts. Paid amount cannot exceed total fee.");
      return;
    }

    if (!formData.paymentDate) {
      alert("Please select payment date.");
      return;
    }

    const feeData = {
      student_name: formData.studentName.trim(),
      course: formData.course.trim(),
      total_fee: total,
      paid_amount: paid,
      payment_date: formData.paymentDate,
      payment_mode: formData.paymentMode,
    };

    setSaving(true);

    try {
      const url =
        editId !== null ? `/api/fees/${editId}` : "/api/fees";

      const method = editId !== null ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editId !== null
            ? feeData
            : {
                ...feeData,
                id: `FEE${Date.now()}`,
              }
        ),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Fee operation failed");
      }

      await fetchFees();

      alert(
        editId !== null
          ? "Fee Record Updated Successfully!"
          : "Fee Record Added Successfully!"
      );

      resetForm();
    } catch (error) {
      console.error("Save Fee Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to save fee record"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (fee: Fee) => {
    setFormData({
      studentName: fee.studentName,
      course: fee.course,
      totalFee: String(fee.totalFee),
      paidAmount: String(fee.paidAmount),
      paymentDate: fee.paymentDate,
      paymentMode: fee.paymentMode,
    });

    setEditId(fee.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee record?")) {
      return;
    }

    try {
      const response = await fetch(`/api/fees/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed");
      }

      await fetchFees();

      if (editId === id) {
        resetForm();
      }

      alert("Fee Record Deleted Successfully!");
    } catch (error) {
      console.error("Delete Fee Error:", error);
      alert("Unable to delete fee record.");
    }
  };

  const inputStyle =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100";

  return (
    <div className="min-h-screen bg-[#f4f6fb] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              FINANCE MANAGEMENT
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172554]">
              Fees Management
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage student fee payments and pending balances.
            </p>
          </div>

          <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
            <p className="text-xs text-gray-500">Total Payment Records</p>
            <p className="mt-1 text-xl font-bold text-[#172554]">
              {fees.length}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Fees</p>
              <span className="rounded-xl bg-blue-50 px-3 py-2 text-lg">₹</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-blue-700">
              {formatAmount(totalFees)}
            </h2>
            <p className="mt-1 text-xs text-gray-400">Overall course fees</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Collection</p>
              <span className="rounded-xl bg-green-50 px-3 py-2 text-lg">↗</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-green-600">
              {formatAmount(totalCollection)}
            </h2>
            <p className="mt-1 text-xs text-gray-400">Amount collected</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Pending Amount</p>
              <span className="rounded-xl bg-red-50 px-3 py-2 text-lg">!</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-red-600">
              {formatAmount(totalPending)}
            </h2>
            <p className="mt-1 text-xs text-gray-400">Balance to be collected</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <span className="rounded-xl bg-purple-50 px-3 py-2 text-lg">♙</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-purple-600">
              {fees.length}
            </h2>
            <p className="mt-1 text-xs text-gray-400">Fee records available</p>
          </div>

        </div>

        {/* Add / Edit Fee Form */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">

          <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-[#172554]">
                {editId !== null ? "Edit Fee Record" : "Add Fee Payment"}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Enter student and payment details below.
              </p>
            </div>

            <span className="rounded-xl bg-blue-50 px-3 py-2 text-xl">₹</span>
          </div>

          <form onSubmit={handleSubmit} className="p-6">

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Student Name
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Enter student name"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Course Name
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="Enter course name"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Total Course Fee (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  name="totalFee"
                  value={formData.totalFee}
                  onChange={handleChange}
                  placeholder="Enter total fee"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Paid Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  placeholder="Enter paid amount"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Payment Date
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Payment Mode
                </label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  className={inputStyle}
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                </select>
              </div>

            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-700 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-blue-100 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editId !== null
                  ? "Update Fee"
                  : "+ Add Payment"}
              </button>

              {editId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-200 bg-gray-100 px-7 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  Cancel
                </button>
              )}

            </div>
          </form>
        </div>

        {/* Payment Records */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">

          <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#172554]">
                Payment Records
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                View and manage all student payments.
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                ⌕
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student or course..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px] text-left text-sm">

              <thead className="bg-[#f8faff] text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">S.No</th>
                  <th className="px-5 py-4 font-semibold">Student</th>
                  <th className="px-5 py-4 font-semibold">Course</th>
                  <th className="px-5 py-4 font-semibold">Total Fee</th>
                  <th className="px-5 py-4 font-semibold">Paid</th>
                  <th className="px-5 py-4 font-semibold">Pending</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Mode</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-gray-500">
                      Loading fee records...
                    </td>
                  </tr>
                ) : filteredFees.length > 0 ? (
                  filteredFees.map((fee, index) => {
                    const status = getStatus(fee);

                    return (
                      <tr key={fee.id} className="transition hover:bg-blue-50/40">

                        <td className="px-5 py-4 text-gray-500">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4 font-semibold text-gray-800">
                          {fee.studentName}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {fee.course}
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-800">
                          {formatAmount(fee.totalFee)}
                        </td>

                        <td className="px-5 py-4 font-semibold text-green-600">
                          {formatAmount(fee.paidAmount)}
                        </td>

                        <td className="px-5 py-4 font-semibold text-red-600">
                          {formatAmount(getPending(fee))}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {fee.paymentDate}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {fee.paymentMode}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              status === "Paid"
                                ? "bg-green-100 text-green-700"
                                : status === "Partial"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() => handleEdit(fee)}
                              className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-200"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(fee.id)}
                              className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                            >
                              Delete
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center">
                      <p className="font-semibold text-gray-600">
                        No Fee Records Found
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Try another search or add a new payment.
                      </p>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-6 py-4 text-xs text-gray-500">
            Showing {filteredFees.length} of {fees.length} payment records
          </div>

        </div>

      </div>
    </div>
  );
}
