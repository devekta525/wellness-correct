"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  Calendar,
  Pill,
  Clock,
  Download,
  Eye,
  AlertCircle,
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

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  imageUrl?: string;
}

interface Medication {
  _id: string;
  productName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

interface Prescription {
  _id: string;
  doctor: Doctor;
  createdAt: string;
  status: string;
  medications: Medication[];
  diagnosis?: string;
  generalInstructions?: string;
  followUpDate?: string;
}

const PrescriptionsTab = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingPrescription, setViewingPrescription] =
    useState<Prescription | null>(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken") || localStorage.getItem("token")
          : null;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/v1/prescriptions/my`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        },
      );
      if (response.data.success) {
        setPrescriptions(response.data.prescriptions);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setViewingPrescription(prescription);
    setShowViewDialog(true);
  };

  const handleDownload = (prescriptionId: string) => {
    // Placeholder for actual download functionality
    console.log(`Download requested for prescription: ${prescriptionId}`);
    alert("Download functionality is not yet implemented.");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Prescriptions</h2>
          <p className="text-muted-foreground">
            View and download your medical prescriptions
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading prescriptions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {prescriptions.map((prescription) => (
            <Card
              key={prescription._id}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Prescription Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          Dr. {prescription.doctor?.firstName}{" "}
                          {prescription.doctor?.lastName}
                        </h3>
                        <p className="text-muted-foreground">
                          {prescription.doctor?.specialization}
                        </p>
                      </div>
                      <Badge className={getStatusColor(prescription.status)}>
                        {prescription.status.charAt(0).toUpperCase() +
                          prescription.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Date:</span>
                          <span>
                            {new Date(
                              prescription.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {prescription.followUpDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Follow-up:</span>
                            <span>
                              {new Date(
                                prescription.followUpDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Pill className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Medications:</span>
                          <span>{prescription.medications.length}</span>
                        </div>
                      </div>
                    </div>

                    {prescription.diagnosis && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Diagnosis:</span>{" "}
                          {prescription.diagnosis}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewPrescription(prescription)}
                      className="gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => handleDownload(prescription._id)}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {prescriptions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No prescriptions found
              </h3>
              <p className="text-muted-foreground mb-4">
                Your prescriptions will appear here once they are issued by your
                doctor
              </p>
            </div>
          )}
        </div>
      )}

      {/* View Prescription Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              View complete prescription information
            </DialogDescription>
          </DialogHeader>

          {viewingPrescription && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Dr. {viewingPrescription.doctor?.firstName}{" "}
                    {viewingPrescription.doctor?.lastName}
                  </h3>
                  <p className="text-muted-foreground">
                    {viewingPrescription.doctor?.specialization}
                  </p>
                </div>
                <Badge className={getStatusColor(viewingPrescription.status)}>
                  {viewingPrescription.status.charAt(0).toUpperCase() +
                    viewingPrescription.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">
                    {new Date(
                      viewingPrescription.createdAt,
                    ).toLocaleDateString()}
                  </span>
                </div>
                {viewingPrescription.followUpDate && (
                  <div>
                    <span className="font-medium">Follow-up:</span>
                    <span className="ml-2">
                      {new Date(
                        viewingPrescription.followUpDate,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Medications:</h4>
                <div className="space-y-2">
                  {viewingPrescription.medications.map((medication) => (
                    <div
                      key={medication._id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {medication.productName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {medication.dosage}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span>
                          {medication.frequency} for {medication.duration}
                        </span>
                        {medication.instructions && (
                          <span className="ml-2">
                            • {medication.instructions}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {viewingPrescription.generalInstructions && (
                <div>
                  <h4 className="font-medium mb-2">Instructions:</h4>
                  <p className="text-sm text-muted-foreground">
                    {viewingPrescription.generalInstructions}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() =>
                viewingPrescription && handleDownload(viewingPrescription._id)
              }
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrescriptionsTab;
