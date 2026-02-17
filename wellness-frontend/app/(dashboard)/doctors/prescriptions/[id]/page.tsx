"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, FileText, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { getApiV1Url } from "@/lib/utils/api";

const PrescriptionDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [prescription, setPrescription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token =
          localStorage.getItem("authToken") || localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found. Please login again.");
          setIsLoading(false);
          return;
        }

        const url = getApiV1Url(`/prescriptions/${params.id}`);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await response.json();

        if (data.success) {
          setPrescription(data.data);
        } else {
          setError(data.message || "Failed to load prescription");
        }
      } catch (error) {
        console.error("Error fetching prescription:", error);
        setError("Failed to load prescription");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPrescription();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.push("/doctors/prescriptions");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Prescription Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error || "The requested prescription could not be found."}
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Prescriptions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Print Actions */}
      <div className="print:hidden bg-background border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Prescriptions
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Prescription Content */}
      <div className="max-w-4xl mx-auto p-6 print:p-8">
        <Card className="print:shadow-none print:border-0">
          <CardHeader className="text-center border-b border-border pb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-8 h-8 text-red-500" />
              <h1 className="text-3xl font-bold text-foreground">
                Wellness Fuel Medical Center
              </h1>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>123 Medical Street, Health City, HC 12345</p>
              <p>Phone: +91 98765 43210 | Email: info@wellnessfuel.com</p>
              <p>License No: MH-MED-2024-001</p>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Prescription Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  PRESCRIPTION
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Date:{" "}
                    {new Date(prescription.prescriptionDate).toLocaleDateString(
                      "en-IN",
                    )}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Prescription ID</p>
                <p className="font-mono text-lg font-bold">
                  #{prescription._id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Patient Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Name:</strong>{" "}
                    {prescription.patientName ||
                      `${prescription.patient?.firstName} ${prescription.patient?.lastName}`}
                  </div>
                  <div>
                    <strong>Patient ID:</strong>{" "}
                    {prescription.patient?.patientId || "N/A"}
                  </div>
                  {prescription.patient?.email && (
                    <div>
                      <strong>Email:</strong> {prescription.patient.email}
                    </div>
                  )}
                  {prescription.patient?.phone && (
                    <div>
                      <strong>Phone:</strong> {prescription.patient.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Doctor Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Doctor:</strong>{" "}
                    {`${prescription.doctor?.firstName} ${prescription.doctor?.lastName}` ||
                      "Dr. Name"}
                  </div>
                  {prescription.doctor?.specialization && (
                    <div>
                      <strong>Specialization:</strong>{" "}
                      {prescription.doctor.specialization}
                    </div>
                  )}
                  {prescription.doctor?.license && (
                    <div>
                      <strong>License:</strong> {prescription.doctor.license}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Diagnosis and Symptoms */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Medical Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Diagnosis
                  </h4>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {prescription.diagnosis}
                  </p>
                </div>
                {prescription.symptoms && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Symptoms
                    </h4>
                    <p className="text-sm bg-muted p-3 rounded-lg">
                      {prescription.symptoms}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Medications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Prescribed Medications
              </h3>
              <div className="space-y-4">
                {prescription.medications?.map(
                  (medication: any, index: number) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {index + 1}. {medication.productName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Dosage: {medication.dosage}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Frequency:
                          </span>
                          <p className="text-foreground">
                            {medication.frequency}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Duration:
                          </span>
                          <p className="text-foreground">
                            {medication.duration}
                          </p>
                        </div>
                        {medication.timing && (
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Timing:
                            </span>
                            <p className="text-foreground">
                              {medication.timing}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Quantity:
                          </span>
                          <p className="text-foreground">
                            {medication.quantity} tablets
                          </p>
                        </div>
                      </div>
                      {medication.instructions && (
                        <div className="mt-3">
                          <span className="font-medium text-muted-foreground text-sm">
                            Special Instructions:
                          </span>
                          <p className="text-sm text-foreground mt-1">
                            {medication.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* General Instructions */}
            {prescription.generalInstructions && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  General Instructions
                </h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-foreground">
                    {prescription.generalInstructions}
                  </p>
                </div>
              </div>
            )}

            {/* Follow-up Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Follow-up Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescription.followUpDate && (
                  <div>
                    <span className="font-medium text-muted-foreground">
                      Next Appointment:
                    </span>
                    <p className="text-foreground">
                      {new Date(prescription.followUpDate).toLocaleDateString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-muted-foreground">
                    Status:
                  </span>
                  <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded text-sm capitalize">
                    {prescription.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Prescription Footer */}
            <div className="border-t border-border pt-6 mt-8">
              <div className="flex justify-between items-end">
                <div>
                  <div className="h-16 w-32 border border-border rounded flex items-center justify-center mb-2">
                    <span className="text-xs text-muted-foreground">
                      Doctor&apos;s Signature
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {`${prescription.doctor?.firstName} ${prescription.doctor?.lastName}` ||
                      "Dr. Name"}
                  </p>
                  {prescription.doctor?.license && (
                    <p className="text-xs text-muted-foreground">
                      License: {prescription.doctor.license}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-muted-foreground text-center border-t border-border pt-4 mt-6">
              <p>
                <strong>Disclaimer:</strong> This prescription is valid for 30
                days from the date of issue. Please consult your doctor before
                making any changes to the medication. In case of any adverse
                reactions, contact your doctor immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-8 {
            padding: 2rem !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-0 {
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrescriptionDetailPage;
