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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const products = useSelector(selectProductsData); // Using selector from productSlice
  const patients = useSelector(selectPatientsData); // Get patients from Redux

  // Local State
  const [viewMode, setViewMode] = useState<"products" | "prescriptions">(
    "prescriptions",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [patientSearch, setPatientSearch] = useState(""); // For patient search

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
    dispatch(fetchProductsData()); // Loading products
    dispatch(fetchPatients()); // Loading patients
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
      // Reset Form
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

  // Medication Logic
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Prescriptions
            </h1>
            <p className="text-muted-foreground">
              Manage patient prescriptions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> New Prescription
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">
                  {stats?.totalPrescriptions || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-emerald-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {stats?.activePrescriptions || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medicines</p>
                <p className="text-2xl font-bold">{products?.length || 0}</p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name or diagnosis..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "prescriptions" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("prescriptions")}
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "products" ? "default" : "ghost"}
                    size="icon"
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
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <>
            {/* Error Display */}
            {/* {error && (
              <Card className="border-red-500">
                <CardContent className="p-6 text-red-600">
                  Error: {error}
                </CardContent>
              </Card>
            )} */}
            {viewMode === "prescriptions" && (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions.map((prescription) => (
                        <TableRow key={prescription._id}>
                          <TableCell>
                            <p className="font-medium">
                              {prescription.patientName ||
                                `${prescription.patient?.firstName || ""} ${prescription.patient?.lastName || ""}`.trim()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {prescription.patient?.email || "N/A"}
                            </p>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              prescription.prescriptionDate,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{prescription.diagnosis}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                getStatusColor(prescription.status) as any
                              }
                            >
                              {prescription.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/doctors/prescriptions/${prescription._id}`,
                                  )
                                }
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeletePrescription(prescription._id)
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {prescriptions.length === 0 && (
                    <div className="p-12 text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">
                        No prescriptions found
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start by creating a new prescription
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Products List View for Adding to Prescriptions Context */}
            {viewMode === "products" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <Card key={product._id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-bold">{product.name}</h3>
                        <Badge>{product.category?.name || "Product"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Price: ₹{product.price?.amount}
                      </p>
                      <Button
                        className="w-full"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddModalOpen(true);
                          addProductToPrescription(product);
                        }}
                      >
                        Create Prescription with this
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Prescription</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Select Patient</Label>
                    <Select value={patientId} onValueChange={setPatientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a patient by ID..." />
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
                  <div>
                    <Label>Diagnosis</Label>
                    <Input
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Symptoms</Label>
                    <Textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>General Instructions</Label>
                    <Textarea
                      value={generalInstructions}
                      onChange={(e) => setGeneralInstructions(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Follow Up Date</Label>
                    <Input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medications" className="space-y-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-bold mb-4">Available Products</h3>
                    <div className="space-y-2 h-64 overflow-y-auto">
                      {products.map((p: any) => (
                        <div
                          key={p._id}
                          className="flex justify-between items-center border p-2 rounded"
                        >
                          <span>{p.name}</span>
                          <Button
                            size="sm"
                            onClick={() => addProductToPrescription(p)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-bold mb-4">Selected Medications</h3>
                    <div className="space-y-4 h-64 overflow-y-auto">
                      {selectedProducts.map((med, idx) => (
                        <div
                          key={idx}
                          className="border p-3 rounded bg-muted/20"
                        >
                          <div className="flex justify-between mb-2">
                            <span className="font-bold">{med.productName}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeProductFromPrescription(idx)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={med.dosage}
                              onChange={(e) =>
                                updateMedication(idx, "dosage", e.target.value)
                              }
                              placeholder="Dosage"
                              className="h-8 text-xs"
                            />
                            <Input
                              value={med.frequency}
                              onChange={(e) =>
                                updateMedication(
                                  idx,
                                  "frequency",
                                  e.target.value,
                                )
                              }
                              placeholder="Freq"
                              className="h-8 text-xs"
                            />
                            <Input
                              value={med.duration}
                              onChange={(e) =>
                                updateMedication(
                                  idx,
                                  "duration",
                                  e.target.value,
                                )
                              }
                              placeholder="Duration"
                              className="h-8 text-xs"
                            />
                            <Input
                              type="number"
                              value={med.quantity}
                              onChange={(e) =>
                                updateMedication(
                                  idx,
                                  "quantity",
                                  Number(e.target.value),
                                )
                              }
                              placeholder="Qty"
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddPrescription} disabled={isLoading}>
                {isLoading ? "Saving..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default PrescriptionsPage;
