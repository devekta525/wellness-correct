"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  Download,
  Loader2,
  Pill,
  CheckCircle,
  Package,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchPrescriptions,
  createPrescription,
  deletePrescription,
  fetchPrescriptionStats,
  exportPrescriptions,
  selectPrescriptions,
  selectPrescriptionLoading,
  selectPrescriptionStats,
  PrescriptionMedication,
} from "@/lib/redux/features/prescriptionSlice";

// IMPORTING FROM YOUR PRODUCT SLICE
import {
  fetchProductsData,
  selectProductsData,
} from "@/lib/redux/features/productSlice";
import {
  fetchPatients,
  selectPatientsData,
} from "@/lib/redux/features/patientSlice";

const PrescriptionsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Redux State
  const prescriptions = useSelector(selectPrescriptions);
  const stats = useSelector(selectPrescriptionStats);
  const isLoading = useSelector(selectPrescriptionLoading);
  const products = useSelector(selectProductsData);
  const patients = useSelector(selectPatientsData);

  // Local State
  const [viewMode, setViewMode] = useState<"products" | "prescriptions">(
    "prescriptions",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    PrescriptionMedication[]
  >([]);

  // Form State
  const [patientId, setPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [generalInstructions, setGeneralInstructions] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  // Initial Fetch
  useEffect(() => {
    dispatch(
      fetchPrescriptions({ page: 1, status: statusFilter, search: searchTerm }),
    );
    dispatch(fetchPrescriptionStats());
    dispatch(fetchProductsData());
    dispatch(fetchPatients());
  }, [dispatch, statusFilter, searchTerm]);

  // --- Handlers ---

  const handleAddPrescription = async () => {
    if (!patientId || !diagnosis) {
      alert("Patient ID and Diagnosis are required");
      return;
    }

    const payload = {
      patientId: patientId,
      diagnosis,
      symptoms,
      generalInstructions,
      followUpDate,
      medications: selectedProducts,
    };

    const result = await dispatch(createPrescription(payload));
    if (createPrescription.fulfilled.match(result)) {
      setIsAddModalOpen(false);
      setPatientId("");
      setDiagnosis("");
      setSymptoms("");
      setGeneralInstructions("");
      setFollowUpDate("");
      setSelectedProducts([]);
      dispatch(fetchPrescriptions({ page: 1 }));
      dispatch(fetchPrescriptionStats());
    }
  };

  const handleDeletePrescription = async (id: string) => {
    if (confirm("Are you sure you want to delete this prescription?")) {
      await dispatch(deletePrescription(id));
      dispatch(fetchPrescriptionStats());
    }
  };

  const handleExport = () => {
    dispatch(exportPrescriptions());
  };

  const addProductToPrescription = (product: any) => {
    const newMedication: PrescriptionMedication = {
      product: product._id,
      productName: product.name,
      dosage: product.weightSize?.value
        ? `${product.weightSize.value}${product.weightSize.unit}`
        : "500mg",
      frequency: "Once daily",
      duration: "7 days",
      timing: "After meals",
      instructions: "",
      quantity: 1,
      price: product.price?.amount || 0,
    };
    setSelectedProducts([...selectedProducts, newMedication]);
  };

  const removeProductFromPrescription = (index: number) => {
    const newProducts = [...selectedProducts];
    newProducts.splice(index, 1);
    setSelectedProducts(newProducts);
  };

  const updateMedication = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const newProducts = [...selectedProducts];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setSelectedProducts(newProducts);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      active: { color: "#059669", bg: "#ECFDF5" },
      completed: { color: "#2563EB", bg: "#EFF6FF" },
      cancelled: { color: "#DC2626", bg: "#FEF2F2" },
    };
    const theme = map[status] || { color: "#6B7280", bg: "#F3F4F6" };
    return (
      <span
        style={{
          color: theme.color,
          background: theme.bg,
          fontSize: "11px",
          fontWeight: 700,
          padding: "3px 10px",
          borderRadius: "20px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prescriptions</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage and create patient prescriptions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-9 text-sm gap-2 rounded-lg border-slate-200 hover:bg-slate-50"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="h-9 text-sm gap-2 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> New Prescription
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total", value: stats?.totalPrescriptions || 0, icon: FileText, color: "emerald" },
            { label: "Active", value: stats?.activePrescriptions || 0, icon: CheckCircle, color: "blue" },
            { label: "Medicines", value: products?.length || 0, icon: Package, color: "purple" },
          ].map((stat) => (
            <Card key={stat.label} className="border-slate-100 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="form-input pl-10"
                  placeholder="Search by patient name or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="form-select-trigger w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "prescriptions" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-none h-9 w-9"
                    onClick={() => setViewMode("prescriptions")}
                  >
                    <ClipboardList className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "products" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-none h-9 w-9"
                    onClick={() => setViewMode("products")}
                  >
                    <Pill className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
          </div>
        ) : (
          <>
            {viewMode === "prescriptions" && (
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Patient</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Diagnosis</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions.map((prescription) => (
                        <TableRow key={prescription._id} className="hover:bg-slate-50/50">
                          <TableCell>
                            <p className="font-semibold text-slate-900 text-sm">
                              {prescription.patientName ||
                                `${prescription.patient?.firstName || ""} ${prescription.patient?.lastName || ""}`.trim()}
                            </p>
                            <p className="text-xs text-slate-500">
                              {prescription.patient?.email || "N/A"}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {new Date(prescription.prescriptionDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700 font-medium">{prescription.diagnosis}</TableCell>
                          <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                                onClick={() => router.push(`/doctors/prescriptions/${prescription._id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500 rounded-lg"
                                onClick={() => handleDeletePrescription(prescription._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {prescriptions.length === 0 && (
                    <div className="p-16 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="text-base font-semibold text-slate-700 mb-1">No prescriptions found</p>
                      <p className="text-sm text-slate-400">Start by creating a new prescription</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {viewMode === "products" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.map((product: any) => (
                  <Card key={product._id} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-slate-900 text-sm">{product.name}</h3>
                        <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                          {product.category?.name || "Product"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-4">₹{product.price?.amount}</p>
                      <Button
                        className="w-full h-9 text-sm rounded-lg bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setIsAddModalOpen(true);
                          addProductToPrescription(product);
                        }}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Create Prescription
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Create Prescription Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl border-slate-200 shadow-2xl">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                  Create Prescription
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-0.5">Fill in patient details and add medications</p>
              </DialogHeader>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6">
              <Tabs defaultValue="details">
                <TabsList className="form-tabs-list w-full mb-6">
                  <TabsTrigger value="details" className="form-tabs-trigger flex-1">
                    Patient Details
                  </TabsTrigger>
                  <TabsTrigger value="medications" className="form-tabs-trigger flex-1">
                    Medications
                    {selectedProducts.length > 0 && (
                      <span className="ml-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {selectedProducts.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-0">
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label form-label-required">Select Patient</label>
                      <Select value={patientId} onValueChange={setPatientId}>
                        <SelectTrigger className="form-select-trigger">
                          <SelectValue placeholder="Choose a patient..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {patients.map((patient) => (
                            <SelectItem key={patient._id} value={patient._id}>
                              {patient.patientId ? `${patient.patientId} – ` : ""}
                              {patient.firstName} {patient.lastName}
                              {patient.email ? ` (${patient.email})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="form-field">
                      <label className="form-label form-label-required">Diagnosis</label>
                      <input
                        className="form-input"
                        placeholder="Primary diagnosis"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                      />
                    </div>

                    <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Symptoms</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Describe patient symptoms..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="form-field" style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">General Instructions</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Treatment instructions and notes..."
                        value={generalInstructions}
                        onChange={(e) => setGeneralInstructions(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Follow Up Date</label>
                      <input
                        className="form-input"
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="medications" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Available Products */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Products</p>
                      </div>
                      <div className="space-y-1 max-h-72 overflow-y-auto p-3">
                        {products.map((p: any) => (
                          <div
                            key={p._id}
                            className="flex justify-between items-center rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                              <p className="text-xs text-slate-400">₹{p.price?.amount}</p>
                            </div>
                            <Button
                              size="sm"
                              className="h-7 w-7 p-0 rounded-lg bg-blue-600 hover:bg-blue-700"
                              onClick={() => addProductToPrescription(p)}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected Medications */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected Medications</p>
                        <span className="text-xs font-bold text-blue-600">{selectedProducts.length} added</span>
                      </div>
                      <div className="space-y-2 max-h-72 overflow-y-auto p-3">
                        {selectedProducts.length === 0 && (
                          <div className="text-center py-8">
                            <Pill className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-xs text-slate-400">No medications added yet</p>
                          </div>
                        )}
                        {selectedProducts.map((med, idx) => (
                          <div key={idx} className="rounded-xl bg-blue-50/50 border border-blue-100 p-3">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-bold text-slate-800">{med.productName}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-500 rounded-lg"
                                onClick={() => removeProductFromPrescription(idx)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { key: "dosage", placeholder: "Dosage" },
                                { key: "frequency", placeholder: "Frequency" },
                                { key: "duration", placeholder: "Duration" },
                              ].map((field) => (
                                <input
                                  key={field.key}
                                  value={(med as any)[field.key]}
                                  onChange={(e) => updateMedication(idx, field.key, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="form-input"
                                  style={{ height: "34px", fontSize: "12px" }}
                                />
                              ))}
                              <input
                                type="number"
                                value={med.quantity}
                                onChange={(e) => updateMedication(idx, "quantity", Number(e.target.value))}
                                placeholder="Qty"
                                className="form-input"
                                style={{ height: "34px", fontSize: "12px" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
              <button className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAddPrescription}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Prescription
                  </>
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PrescriptionsPage;
