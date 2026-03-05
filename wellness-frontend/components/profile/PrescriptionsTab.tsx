"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  Calendar,
  Pill,
  Clock,
  Eye,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Activity,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectUser } from "@/lib/redux/features/authSlice";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
}

interface Medication {
  productName: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing?: string;
  instructions?: string;
  quantity: number;
}

interface Prescription {
  _id: string;
  doctor: Doctor;
  patientName: string;
  prescriptionDate: string;
  createdAt: string;
  status: "active" | "completed" | "cancelled";
  medications: Medication[];
  diagnosis: string;
  symptoms?: string;
  generalInstructions?: string;
  followUpDate?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

type StatusFilter = "all" | "active" | "completed" | "cancelled";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const PAGE_SIZE = 5;

/** Read the JWT from Redux state first, then fall back to localStorage keys. */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    null
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated card skeleton shown while loading */
const SkeletonCard = () => (
  <div className="animate-pulse rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/40 p-6 shadow-sm h-72 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-4 w-full">
        <div className="h-16 w-16 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        <div className="space-y-3 flex-1">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
    </div>
    <div className="mt-8">
      <div className="h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
    </div>
  </div>
);

/** Status badge colours */
const STATUS_CONFIG: Record<
  Prescription["status"],
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/50",
  },
  completed: {
    label: "Completed",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-700/50",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-700/50",
  },
};

function StatusBadge({ status }: { status: Prescription["status"] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.cancelled;
  return (
    <Badge
      variant="outline"
      className={`text-[11px] font-bold px-3 py-1 uppercase tracking-wider rounded-full shadow-sm ${cfg.className}`}
    >
      {cfg.label}
    </Badge>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PrescriptionsTab: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const currentUser = useAppSelector(selectUser);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Detail dialog
  const [viewingPrescription, setViewingPrescription] =
    useState<Prescription | null>(null);

  // Abort controller ref – cancel in-flight requests on unmount / re-fetch
  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPrescriptions = useCallback(
    async (currentPage: number, status: StatusFilter) => {
      // Cancel any previous in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      const token = getAuthToken();

      // Guard: no token → show a friendly auth error instead of a 401 flash
      if (!token) {
        setError("You are not logged in. Please log in to view prescriptions.");
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(PAGE_SIZE),
          sort: "createdAt",
          order: "desc",
        });
        if (status !== "all") params.set("status", status);

        const res = await fetch(
          `${API_BASE}/v1/prescriptions/my?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        // Handle non-2xx explicitly for better error messages
        if (res.status === 401) {
          setError("Your session has expired. Please log in again.");
          return;
        }
        if (res.status === 403) {
          setError("This section is available to patients only.");
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            (body as { message?: string }).message ??
            `Server error (${res.status})`
          );
        }

        const json = await res.json();

        if (json.success) {
          // Backend sends `data` (array) + `pagination` object
          setPrescriptions((json.data as Prescription[]) ?? []);
          setPagination((json.pagination as Pagination) ?? null);
        } else {
          throw new Error(json.message ?? "Unexpected response from server.");
        }
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") return; // intentionally cancelled
        console.error("[PrescriptionsTab] fetch error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load prescriptions. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Trigger on mount and when page / filter changes
  useEffect(() => {
    fetchPrescriptions(page, statusFilter);
    return () => abortRef.current?.abort(); // cleanup on unmount
  }, [page, statusFilter, fetchPrescriptions]);

  // Reset to page 1 when filter changes
  const handleFilterChange = (value: string) => {
    setPage(1);
    setStatusFilter(value as StatusFilter);
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderError = () => (
    <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 px-5 py-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-700 dark:text-red-300">
          {error}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => fetchPrescriptions(page, statusFilter)}
        className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Retry
      </Button>
    </div>
  );

  const renderPrescriptionCard = (prescription: Prescription) => (
    <div
      key={prescription._id}
      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-800/80"
    >
      <div
        className={`h-2 w-full opacity-80 group-hover:opacity-100 transition-opacity ${prescription.status === "active"
          ? "bg-gradient-to-r from-emerald-400 to-teal-500"
          : prescription.status === "completed"
            ? "bg-gradient-to-r from-blue-500 to-indigo-600"
            : "bg-gradient-to-r from-red-400 to-red-500"
          }`}
      />

      <div className="flex h-full flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-md ring-4 ring-white dark:ring-slate-800">
              {prescription.doctor?.firstName?.[0] ?? "D"}
              {prescription.doctor?.lastName?.[0] ?? ""}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-1">
                Dr.{" "}
                {[
                  prescription.doctor?.firstName,
                  prescription.doctor?.lastName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </h3>
              {prescription.doctor?.specialization && (
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <Stethoscope className="w-4 h-4 text-indigo-400" />
                  {prescription.doctor.specialization}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status:</span>
          <StatusBadge status={prescription.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-5 dark:bg-slate-900/50 dark:border-slate-800/50 mb-6">
          <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date
            </span>
            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
              {formatDate(prescription.prescriptionDate ?? prescription.createdAt)}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Pill className="w-3.5 h-3.5 text-indigo-500" /> Meds
            </span>
            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
              {prescription.medications?.length ?? 0}{" "}
              {prescription.medications?.length === 1 ? "Item" : "Items"}
            </p>
          </div>

          {prescription.followUpDate && (
            <div className="col-span-2 mt-1 pt-3 border-t border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Follow-Up
              </span>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-snug">
                {formatDate(prescription.followUpDate)}
              </p>
            </div>
          )}
        </div>

        {prescription.diagnosis && (
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
            <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-900/70 dark:text-indigo-400/80 mb-1.5">
              <Activity className="w-3.5 h-3.5" />
              Diagnosis
            </h4>
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300 leading-relaxed">
              {prescription.diagnosis}
            </p>
          </div>
        )}

        {/* Actions flex holder that pushes to bottom */}
        <div className="mt-auto pt-2">
          <Button
            onClick={() => setViewingPrescription(prescription)}
            className="w-full h-12 rounded-xl text-white font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{" "}
          of <span className="font-medium text-foreground">{pagination.total}</span>
        </p>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            disabled={!pagination.hasPrevPage || loading}
            onClick={() => setPage((p) => p - 1)}
            className="w-8 h-8 p-0 rounded-lg"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Page number pills */}
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(
              (n) =>
                n === 1 ||
                n === pagination.totalPages ||
                Math.abs(n - pagination.page) <= 1
            )
            .reduce<(number | "…")[]>((acc, n, idx, arr) => {
              if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("…");
              acc.push(n);
              return acc;
            }, [])
            .map((n, idx) =>
              n === "…" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm"
                >
                  …
                </span>
              ) : (
                <Button
                  key={n}
                  size="sm"
                  variant={pagination.page === n ? "default" : "outline"}
                  onClick={() => setPage(n)}
                  disabled={loading}
                  className={`w-8 h-8 p-0 rounded-lg text-sm font-medium ${pagination.page === n
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent hover:from-blue-700 hover:to-indigo-700"
                    : ""
                    }`}
                  aria-label={`Page ${n}`}
                  aria-current={pagination.page === n ? "page" : undefined}
                >
                  {n}
                </Button>
              )
            )}

          <Button
            size="sm"
            variant="outline"
            disabled={!pagination.hasNextPage || loading}
            onClick={() => setPage((p) => p + 1)}
            className="w-8 h-8 p-0 rounded-lg"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            <Pill className="h-7 w-7 text-indigo-500" />
            Prescriptions
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
            Access your medical prescriptions, treatments, and dosages continuously. Stay up to date with follow-up appointments.
          </p>
        </div>

        {/* Refresh button */}
        <div className="flex items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <Button
            size="icon"
            variant="outline"
            onClick={() => fetchPrescriptions(page, statusFilter)}
            disabled={loading}
            className="w-12 h-12 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 active:scale-95 shrink-0"
            aria-label="Refresh prescriptions"
          >
            <RefreshCw
              className={`w-5 h-5 ${loading ? "animate-spin text-indigo-500" : "text-slate-500 dark:text-slate-400"}`}
            />
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && renderError()}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        !error && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 py-24 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50 shadow-inner dark:bg-indigo-900/20">
              <FileText className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="mb-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              No Prescriptions Found
            </h3>
            <p className="max-w-sm text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
              {statusFilter !== "all"
                ? `You have no ${statusFilter} prescriptions in your history. Try changing the filter.`
                : "Your prescriptions will appear here once your assigned doctor issues them."}
            </p>
            {statusFilter !== "all" && (
              <Button
                variant="outline"
                className="rounded-xl border-2 hover:bg-slate-100 font-bold px-6"
                onClick={() => handleFilterChange("all")}
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filter
              </Button>
            )}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {prescriptions.map(renderPrescriptionCard)}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && renderPagination()}

      {/* ── Detail Dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={!!viewingPrescription}
        onOpenChange={(open) => !open && setViewingPrescription(null)}
      >
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto sm:rounded-3xl p-0 gap-0 border-0 shadow-2xl dark:bg-slate-900 focus:outline-none">
          <DialogHeader className="p-6 sm:px-8 sm:py-7 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 border-b border-indigo-100/50 dark:border-indigo-500/10">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                <Pill className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Prescription Details
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium ml-[3.25rem] mt-1">
              Issued by your doctor
            </DialogDescription>
          </DialogHeader>

          {viewingPrescription && (
            <div className="p-6 sm:p-8 space-y-8 bg-white dark:bg-slate-900">
              {/* Doctor + status row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner shrink-0">
                    {viewingPrescription.doctor?.firstName?.[0] ?? "D"}
                    {viewingPrescription.doctor?.lastName?.[0] ?? ""}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight truncate">
                      Dr.{" "}
                      {[
                        viewingPrescription.doctor?.firstName,
                        viewingPrescription.doctor?.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </h3>
                    {viewingPrescription.doctor?.specialization && (
                      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                        <Stethoscope className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="truncate">{viewingPrescription.doctor.specialization}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 self-start sm:self-auto">
                  <StatusBadge status={viewingPrescription.status} />
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-3xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-slate-900 p-6 border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-500/80 dark:text-indigo-400 mb-2">
                    <Calendar className="w-4 h-4" /> Date Issued
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white text-base">
                    {formatDate(
                      viewingPrescription.prescriptionDate ??
                      viewingPrescription.createdAt
                    )}
                  </p>
                </div>

                {viewingPrescription.followUpDate && (
                  <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/10 dark:to-slate-900 p-6 border border-orange-100/50 dark:border-orange-800/30 shadow-sm">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-500/80 dark:text-orange-400 mb-2">
                      <Clock className="w-4 h-4" /> Follow-up Date
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-base">
                      {formatDate(viewingPrescription.followUpDate)}
                    </p>
                  </div>
                )}

                {viewingPrescription.diagnosis && (
                  <div className={`rounded-3xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-slate-900 p-6 border border-blue-100/50 dark:border-blue-800/30 shadow-sm ${viewingPrescription.followUpDate ? 'sm:col-span-2' : 'sm:col-span-2'}`}>
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-500/80 dark:text-blue-400 mb-2">
                      <Activity className="w-4 h-4" /> Diagnosis
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {viewingPrescription.diagnosis}
                    </p>
                  </div>
                )}

                {viewingPrescription.symptoms && (
                  <div className="sm:col-span-2 rounded-3xl bg-gradient-to-br from-rose-50 to-white dark:from-rose-900/10 dark:to-slate-900 p-6 border border-rose-100/50 dark:border-rose-800/30 shadow-sm">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-500/80 dark:text-rose-400 mb-2">
                      <AlertCircle className="w-4 h-4" /> Symptoms
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {viewingPrescription.symptoms}
                    </p>
                  </div>
                )}
              </div>

              {/* Medications Table/List */}
              {viewingPrescription.medications?.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-5 flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-500">
                      <Pill className="w-5 h-5" />
                    </div>
                    Prescribed Medications
                    <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs py-1 px-3 rounded-full font-bold ml-auto sm:ml-2">
                      {viewingPrescription.medications.length} items
                    </span>
                  </h4>
                  <div className="space-y-4">
                    {viewingPrescription.medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-500/50"
                      >
                        <div className="flex-1 space-y-3">
                          <h5 className="font-bold text-lg text-slate-900 dark:text-white">
                            {med.productName}
                          </h5>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-200/50 dark:border-slate-600 font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                              {med.frequency}
                            </Badge>
                            {med.duration && (
                              <Badge variant="secondary" className="bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-200/50 dark:border-slate-600 font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                                {med.duration}
                              </Badge>
                            )}
                            {med.timing && (
                              <Badge variant="secondary" className="bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-200/50 dark:border-slate-600 font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                                <Clock className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                                {med.timing}
                              </Badge>
                            )}
                          </div>
                          {med.instructions && (
                            <div className="mt-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-900/10 p-2.5 rounded-r-xl">
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic">
                                "{med.instructions}"
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 self-start sm:self-center bg-indigo-50 dark:bg-indigo-900/30 px-5 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                          <span className="text-indigo-700 dark:text-indigo-300 text-sm font-bold tracking-wide">
                            {med.dosage}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General instructions */}
              {viewingPrescription.generalInstructions && (
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/10 dark:to-slate-900 border border-amber-200/60 dark:border-amber-700/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -mx-10 -my-10" />
                  <h4 className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-400 mb-3 relative z-10">
                    <FileText className="w-5 h-5 text-amber-500" />
                    General Instructions
                  </h4>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200/80 leading-relaxed relative z-10">
                    {viewingPrescription.generalInstructions}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="p-6 sm:px-8 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/50 rounded-b-3xl">
            <Button
              className="w-full sm:w-auto rounded-xl px-10 font-bold border border-slate-200/60 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors h-12 shadow-sm"
              onClick={() => setViewingPrescription(null)}
              variant="outline"
            >
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrescriptionsTab;
