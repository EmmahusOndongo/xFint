import type { ExpenseStatus } from "./types";
export const statusBadgeClasses = (s: ExpenseStatus) =>
  ({
    CREATED: "bg-gray-100 text-gray-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-700",
    PROCESSED: "bg-indigo-100 text-indigo-700",
  }[s]);