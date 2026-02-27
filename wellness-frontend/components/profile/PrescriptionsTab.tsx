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
  <div className="animate-pulse rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/40 p-6 space-y-4 shadow-sm">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/5" />
      </div>
      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg" />
    </div>
    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
    <div className="flex gap-2">
      <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
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
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50",
  },
  completed: {
    label: "Completed",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700/50",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300 border-slate-200 dark:border-slate-600/50",
  },
};

function StatusBadge({ status }: { status: Prescription["status"] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.cancelled;
  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold px-2.5 py-0.5 border ${cfg.className}`}
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

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-5">
        <FileText className="w-9 h-9 text-blue-400 dark:text-blue-300" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        No prescriptions found
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {statusFilter !== "all"
          ? `You have no ${statusFilter} prescriptions. Try a different filter.`
          : "Your prescriptions will appear here once your doctor issues them."}
      </p>
      {statusFilter !== "all" && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 gap-1.5 text-blue-600 hover:text-blue-700"
          onClick={() => handleFilterChange("all")}
        >
          <Filter className="w-3.5 h-3.5" />
          Clear filter
        </Button>
      )}
    </div>
  );

  const renderPrescriptionCard = (prescription: Prescription) => (
    <Card
      key={prescription._id}
      className="group border border-slate-100 dark:border-slate-700/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/60"
    >
      <CardContent className="p-0">
        {/* Status accent bar */}
        <div
          className={`h-1 w-full ${prescription.status === "active"
              ? "bg-gradient-to-r from-emerald-400 to-teal-400"
              : prescription.status === "completed"
                ? "bg-gradient-to-r from-blue-400 to-indigo-400"
                : "bg-slate-200 dark:bg-slate-600"
            }`}
        />

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Doctor info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md">
                {prescription.doctor?.firstName?.[0] ?? "D"}
                {prescription.doctor?.lastName?.[0] ?? ""}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground truncate">
                  Dr.{" "}
                  {[
                    prescription.doctor?.firstName,
                    prescription.doctor?.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </h3>
                {prescription.doctor?.specialization && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    {prescription.doctor.specialization}
                  </p>
                )}
              </div>
            </div>

            <StatusBadge status={prescription.status} />
          </div>

          {/* Meta grid */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 shrink-0 text-blue-400" />
              <span>{formatDate(prescription.prescriptionDate ?? prescription.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Pill className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>
                {prescription.medications?.length ?? 0}{" "}
                {prescription.medications?.length === 1
                  ? "medication"
                  : "medications"}
              </span>
            </div>

            {prescription.followUpDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Follow-up: {formatDate(prescription.followUpDate)}</span>
              </div>
            )}
          </div>

          {/* Diagnosis pill */}
          {prescription.diagnosis && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-600/30">
              <Activity className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Diagnosis: </span>
                {prescription.diagnosis}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-colors"
              onClick={() => setViewingPrescription(prescription)}
            >
              <Eye className="w-3.5 h-3.5" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Prescriptions</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentUser?.firstName
              ? `${currentUser.firstName}'s prescription history`
              : "Your medical prescriptions, issued by your doctor"}
          </p>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger
              id="prescription-status-filter"
              className="w-40 rounded-xl border-slate-200 dark:border-slate-600"
            >
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => fetchPrescriptions(page, statusFilter)}
            disabled={loading}
            className="w-9 h-9 p-0 rounded-xl"
            aria-label="Refresh prescriptions"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && renderError()}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        !error && renderEmpty()
      ) : (
        <div className="space-y-4">
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Prescription Details
            </DialogTitle>
            <DialogDescription>
              Full prescription information issued by your doctor
            </DialogDescription>
          </DialogHeader>

          {viewingPrescription && (
            <div className="space-y-5 pt-1">
              {/* Doctor + status */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                    {viewingPrescription.doctor?.firstName?.[0] ?? "D"}
                    {viewingPrescription.doctor?.lastName?.[0] ?? ""}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Dr.{" "}
                      {[
                        viewingPrescription.doctor?.firstName,
                        viewingPrescription.doctor?.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                    {viewingPrescription.doctor?.specialization && (
                      <p className="text-sm text-muted-foreground">
                        {viewingPrescription.doctor.specialization}
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={viewingPrescription.status} />
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/40">
                <div>
                  <span className="text-muted-foreground">Date</span>
                  <p className="font-medium mt-0.5">
                    {formatDate(
                      viewingPrescription.prescriptionDate ??
                      viewingPrescription.createdAt
                    )}
                  </p>
                </div>
                {viewingPrescription.followUpDate && (
                  <div>
                    <span className="text-muted-foreground">Follow-up</span>
                    <p className="font-medium mt-0.5">
                      {formatDate(viewingPrescription.followUpDate)}
                    </p>
                  </div>
                )}
                {viewingPrescription.diagnosis && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Diagnosis</span>
                    <p className="font-medium mt-0.5">
                      {viewingPrescription.diagnosis}
                    </p>
                  </div>
                )}
                {viewingPrescription.symptoms && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Symptoms</span>
                    <p className="font-medium mt-0.5">
                      {viewingPrescription.symptoms}
                    </p>
                  </div>
                )}
              </div>

              {/* Medications */}
              {viewingPrescription.medications?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-indigo-500" />
                    Medications ({viewingPrescription.medications.length})
                  </h4>
                  <div className="space-y-2">
                    {viewingPrescription.medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/40 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground text-sm">
                            {med.productName}
                          </span>
                          <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-full">
                            {med.dosage}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {med.frequency}
                          {med.duration && ` · ${med.duration}`}
                          {med.timing && ` · ${med.timing}`}
                        </p>
                        {med.instructions && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {med.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General instructions */}
              {viewingPrescription.generalInstructions && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-700/30">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-1">
                    General Instructions
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {viewingPrescription.generalInstructions}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setViewingPrescription(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrescriptionsTab;
