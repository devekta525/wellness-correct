"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  BarChart3,
  Download,
  RefreshCw,
  FileText,
  PieChart,
  LineChart,
  DollarSign,
  Users,
  Calendar,
  Pill,
  AlertCircle,
  CheckCircle,
  Star,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Redux Imports
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchOverviewReport,
  fetchAppointmentReport,
  fetchPatientReport,
  fetchPrescriptionReport,
  exportReportData,
  selectOverviewReport,
  selectAppointmentReport,
  selectPatientReport,
  selectPrescriptionReport,
  selectExportStatus,
} from "@/lib/redux/features/reportSlice";

const DoctorReportsPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux Data
  const overviewState = useSelector(selectOverviewReport);
  const appointmentsState = useSelector(selectAppointmentReport);
  const patientsState = useSelector(selectPatientReport);
  const prescriptionsState = useSelector(selectPrescriptionReport);
  const exportState = useSelector(selectExportStatus);

  // Local UI State
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [exportFormat, setExportFormat] = useState("pdf");

  // Initial Fetch
  useEffect(() => {
    handleGenerateReport();
  }, []);

  // Handle API Calls based on selection
  const handleGenerateReport = () => {
    const params = { from: dateRange.from, to: dateRange.to };

    // Always fetch overview for the cards
    dispatch(fetchOverviewReport(params));

    // Fetch specific data based on active view or fetch all for the preview tabs
    if (selectedReport === "overview" || selectedReport === "appointments")
      dispatch(fetchAppointmentReport(params));
    if (selectedReport === "overview" || selectedReport === "patients")
      dispatch(fetchPatientReport(params));
    if (selectedReport === "overview" || selectedReport === "prescriptions")
      dispatch(fetchPrescriptionReport(params));
  };

  const handleExportReport = async () => {
    await dispatch(
      exportReportData({
        type: selectedReport,
        from: dateRange.from,
        to: dateRange.to,
        format: exportFormat,
      }),
    );
  };

  // Fallback data object if API returns null (prevents crashes)
  const medicalStats = overviewState.data || {
    totalAppointments: 0,
    totalPatients: 0,
    totalRevenue: 0,
    patientSatisfaction: 0,
    avgConsultationTime: 0,
    emergencyCases: 0,
    followUpRate: 0,
  };

  // Using Redux data or defaulting to empty arrays
  const appointmentData = appointmentsState.data || [];
  const patientAnalytics = patientsState.data || [];
  const prescriptionData = prescriptionsState.data || [];

  const reportTypes = [
    {
      id: "overview",
      name: "Overview Report",
      description: "Complete practice overview",
      icon: BarChart3,
    },
    {
      id: "appointments",
      name: "Appointment Analytics",
      description: "Appointment trends",
      icon: Calendar,
    },
    {
      id: "patients",
      name: "Patient Analytics",
      description: "Patient demographics",
      icon: Users,
    },
    {
      id: "prescriptions",
      name: "Prescription Report",
      description: "Medication usage",
      icon: Pill,
    },
  ];

  const exportFormats = [
    { value: "pdf", label: "PDF Report", icon: FileText },
    { value: "csv", label: "CSV Data", icon: FileText },
    { value: "json", label: "JSON Data", icon: FileText },
  ];

  const isGenerating = overviewState.isLoading || appointmentsState.isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" /> Generate Report
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportReport}
            disabled={exportState.isLoading}
          >
            {exportState.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" /> Export
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards - Using Data from Overview API */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medicalStats.totalAppointments?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">For selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medicalStats.totalPatients?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{medicalStats.totalRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Calculated from completed visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Prescriptions
            </CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medicalStats.activePrescriptions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently prescribed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>
            Preview of your selected report based on {dateRange.from} to{" "}
            {dateRange.to}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Data Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Lists</TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointment Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Appointment Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {appointmentsState.isLoading ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      <div className="space-y-4">
                        {appointmentData.length === 0 ? (
                          <p className="text-center text-muted-foreground">
                            No data found
                          </p>
                        ) : (
                          appointmentData
                            .slice(0, 5)
                            .map((day: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between border-b pb-2"
                              >
                                <div>
                                  <p className="font-medium">
                                    {new Date(
                                      day.date || day._id,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">
                                    {day.count || day.appointments} appointments
                                  </p>
                                  {day.revenue && (
                                    <p className="text-sm text-green-600">
                                      ₹{day.revenue}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Patient Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patientsState.isLoading ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      <div className="space-y-3">
                        {patientAnalytics.length === 0 ? (
                          <p className="text-center text-muted-foreground">
                            No data found
                          </p>
                        ) : (
                          patientAnalytics
                            .slice(0, 5)
                            .map((condition: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  <span className="font-medium">
                                    {condition.condition ||
                                      condition._id ||
                                      "General"}
                                  </span>
                                </div>
                                <Badge variant="outline">
                                  {condition.count} patients
                                </Badge>
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: DETAILED */}
            <TabsContent value="detailed" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Prescription Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Top Medicines Prescribed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {prescriptionsState.isLoading ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      <div className="space-y-4">
                        {prescriptionData.length === 0 ? (
                          <p className="text-center text-muted-foreground">
                            No data found
                          </p>
                        ) : (
                          prescriptionData.map((med: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">
                                  {med.medication || med.productName}
                                </p>
                                {med.patients && (
                                  <p className="text-sm text-muted-foreground">
                                    {med.patients} patients
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {med.prescriptions || med.count || 0} times
                                </p>
                                {med.cost && (
                                  <p className="text-sm text-green-600">
                                    ₹{med.cost.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default dynamic(() => Promise.resolve(DoctorReportsPage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  ),
});
