"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Edit,
  Loader2,
  Camera,
  Plus,
  X,
  Languages,
  AlertCircle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Redux Imports
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchDoctorSettings,
  updateProfileSettings,
  updateBusinessSettings,
  updateSecuritySettings,
  selectDoctorSettings,
  selectDoctorSettingsLoading,
  selectDoctorSettingsSaving,
  selectDoctorSettingsError,
} from "@/lib/redux/features/doctorSettingsSlice";

// Doctor Settings Page Component
const DoctorSettingsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const settingsData = useSelector(selectDoctorSettings);
  const isLoading = useSelector(selectDoctorSettingsLoading);
  const isSaving = useSelector(selectDoctorSettingsSaving);
  const error = useSelector(selectDoctorSettingsError);

  const [editStates, setEditStates] = useState({
    profile: false,
    business: false,
    security: false,
  });

  const [formData, setFormData] = useState(
    settingsData || {
      profile: {
        name: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        specialization: "",
        experience: 0,
        qualifications: "",
        license: "",
        hospital: "",
        location: "",
        bio: "",
        avatar: "",
        languages: [],
        consultationFee: 0,
        emergencyFee: 0,
        gender: "",
        dateOfBirth: "",
      },
      business: {
        clinicName: "",
        clinicAddress: "",
        clinicPhone: "",
        clinicEmail: "",
        website: "",
        taxId: "",
        businessType: "Private Practice",
        operatingHours: {
          monday: { start: "09:00", end: "17:00", closed: false },
          tuesday: { start: "09:00", end: "17:00", closed: false },
          wednesday: { start: "09:00", end: "17:00", closed: false },
          thursday: { start: "09:00", end: "17:00", closed: false },
          friday: { start: "09:00", end: "17:00", closed: false },
          saturday: { start: "10:00", end: "14:00", closed: false },
          sunday: { start: "00:00", end: "00:00", closed: true },
        },
        appointmentDuration: 30,
        maxPatientsPerDay: 20,
        emergencyAvailability: true,
      },
      security: {
        twoFactorAuth: false,
        loginAlerts: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        ipWhitelist: [],
        auditLogs: true,
        dataEncryption: true,
        backupFrequency: "daily",
      },
    },
  );

  const [successMessage, setSuccessMessage] = useState("");

  // Fetch settings on component mount
  useEffect(() => {
    dispatch(fetchDoctorSettings());
  }, [dispatch]);

  // Update form data when settings are fetched
  useEffect(() => {
    if (settingsData) {
      setFormData(settingsData);
    }
  }, [settingsData]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Show loader while fetching
  if (isLoading && !settingsData) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const handleEdit = (section: string) => {
    setEditStates((prev) => ({ ...prev, [section]: true }));
  };

  const handleCancel = (section: string) => {
    setEditStates((prev) => ({ ...prev, [section]: false }));
    if (settingsData) {
      setFormData(settingsData);
    }
  };

  const handleSave = async (section: string) => {
    try {
      if (section === "profile") {
        await dispatch(updateProfileSettings(formData.profile as any)).unwrap();
      } else if (section === "business") {
        await dispatch(
          updateBusinessSettings(formData.business as any),
        ).unwrap();
      } else if (section === "security") {
        await dispatch(
          updateSecuritySettings(formData.security as any),
        ).unwrap();
      }
      setEditStates((prev) => ({ ...prev, [section]: false }));
      setSuccessMessage(
        `${section.charAt(0).toUpperCase() + section.slice(1)} settings updated successfully!`,
      );
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  const handleInputChange = (
    section: string,
    field: string,
    value: string | number | boolean | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (
    section: string,
    parentField: string,
    childField: string,
    value: string | number | boolean | object,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [parentField]: {
          ...((prev[section as keyof typeof prev] as Record<string, unknown>)[
            parentField
          ] as Record<string, unknown>),
          [childField]: value,
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, business settings, and medical preferences
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal and professional information
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {editStates.profile ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleCancel("profile")}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSave("profile")}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => handleEdit("profile")}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={formData.profile.avatar}
                    alt={formData.profile.name || "Doctor"}
                  />
                  <AvatarFallback className="text-2xl">
                    {(formData.profile.name || "D")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.profile.name}
                    onChange={(e) =>
                      handleInputChange("profile", "name", e.target.value)
                    }
                    disabled={!editStates.profile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.profile.email}
                    onChange={(e) =>
                      handleInputChange("profile", "email", e.target.value)
                    }
                    disabled={!editStates.profile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.profile.phone}
                    onChange={(e) =>
                      handleInputChange("profile", "phone", e.target.value)
                    }
                    disabled={!editStates.profile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select
                    value={formData.profile.specialization}
                    onValueChange={(value) =>
                      handleInputChange("profile", "specialization", value)
                    }
                    disabled={!editStates.profile}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="Ophthalmology">
                        Ophthalmology
                      </SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Internal Medicine">
                        Internal Medicine
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.profile.experience}
                    onChange={(e) =>
                      handleInputChange(
                        "profile",
                        "experience",
                        parseInt(e.target.value),
                      )
                    }
                    disabled={!editStates.profile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">Medical License</Label>
                  <Input
                    id="license"
                    value={formData.profile.license}
                    onChange={(e) =>
                      handleInputChange("profile", "license", e.target.value)
                    }
                    disabled={!editStates.profile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital/Clinic</Label>
                  <Input
                    id="hospital"
                    value={formData.profile.hospital}
                    onChange={(e) =>
                      handleInputChange("profile", "hospital", e.target.value)
                    }
                    disabled={!editStates.profile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.profile.location}
                    onChange={(e) =>
                      handleInputChange("profile", "location", e.target.value)
                    }
                    disabled={!editStates.profile}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Input
                  id="qualifications"
                  value={formData.profile.qualifications}
                  onChange={(e) =>
                    handleInputChange(
                      "profile",
                      "qualifications",
                      e.target.value,
                    )
                  }
                  disabled={!editStates.profile}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.profile.bio}
                  onChange={(e) =>
                    handleInputChange("profile", "bio", e.target.value)
                  }
                  disabled={!editStates.profile}
                  rows={4}
                />
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label>Languages Spoken</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.profile.languages.map((language, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Languages className="w-3 h-3" />
                      {language}
                      {editStates.profile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => {
                            const newLanguages =
                              formData.profile.languages.filter(
                                (_, i) => i !== index,
                              );
                            handleInputChange(
                              "profile",
                              "languages",
                              newLanguages,
                            );
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </Badge>
                  ))}
                  {editStates.profile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newLanguage = prompt("Enter language:");
                        if (newLanguage) {
                          handleInputChange("profile", "languages", [
                            ...formData.profile.languages,
                            newLanguage,
                          ]);
                        }
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Language
                    </Button>
                  )}
                </div>
              </div>

              {/* Consultation Fees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="consultationFee">
                    Regular Consultation Fee (₹)
                  </Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    value={formData.profile.consultationFee}
                    onChange={(e) =>
                      handleInputChange(
                        "profile",
                        "consultationFee",
                        parseInt(e.target.value),
                      )
                    }
                    disabled={!editStates.profile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyFee">
                    Emergency Consultation Fee (₹)
                  </Label>
                  <Input
                    id="emergencyFee"
                    type="number"
                    value={formData.profile.emergencyFee}
                    onChange={(e) =>
                      handleInputChange(
                        "profile",
                        "emergencyFee",
                        parseInt(e.target.value),
                      )
                    }
                    disabled={!editStates.profile}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Manage your clinic and business details
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {editStates.business ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleCancel("business")}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSave("business")}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => handleEdit("business")}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Business
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic Name</Label>
                  <Input
                    id="clinicName"
                    value={formData.business.clinicName}
                    onChange={(e) =>
                      handleInputChange(
                        "business",
                        "clinicName",
                        e.target.value,
                      )
                    }
                    disabled={!editStates.business}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={formData.business.businessType}
                    onValueChange={(value) =>
                      handleInputChange("business", "businessType", value)
                    }
                    disabled={!editStates.business}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Private Practice">
                        Private Practice
                      </SelectItem>
                      <SelectItem value="Hospital">Hospital</SelectItem>
                      <SelectItem value="Clinic">Clinic</SelectItem>
                      <SelectItem value="Group Practice">
                        Group Practice
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicPhone">Clinic Phone</Label>
                  <Input
                    id="clinicPhone"
                    value={formData.business.clinicPhone}
                    onChange={(e) =>
                      handleInputChange(
                        "business",
                        "clinicPhone",
                        e.target.value,
                      )
                    }
                    disabled={!editStates.business}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicEmail">Clinic Email</Label>
                  <Input
                    id="clinicEmail"
                    type="email"
                    value={formData.business.clinicEmail}
                    onChange={(e) =>
                      handleInputChange(
                        "business",
                        "clinicEmail",
                        e.target.value,
                      )
                    }
                    disabled={!editStates.business}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.business.website}
                    onChange={(e) =>
                      handleInputChange("business", "website", e.target.value)
                    }
                    disabled={!editStates.business}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={formData.business.taxId}
                    onChange={(e) =>
                      handleInputChange("business", "taxId", e.target.value)
                    }
                    disabled={!editStates.business}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicAddress">Clinic Address</Label>
                <Textarea
                  id="clinicAddress"
                  value={formData.business.clinicAddress}
                  onChange={(e) =>
                    handleInputChange(
                      "business",
                      "clinicAddress",
                      e.target.value,
                    )
                  }
                  disabled={!editStates.business}
                  rows={3}
                />
              </div>

              {/* Operating Hours */}
              <div className="space-y-4">
                <Label>Operating Hours</Label>
                <div className="space-y-3">
                  {Object.entries(formData.business.operatingHours).map(
                    ([day, hours]) => (
                      <div key={day} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium capitalize">
                          {day}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!hours.closed}
                            onCheckedChange={(checked) =>
                              handleNestedInputChange(
                                "business",
                                "operatingHours",
                                day,
                                {
                                  ...hours,
                                  closed: !checked,
                                },
                              )
                            }
                            disabled={!editStates.business}
                          />
                          {!hours.closed ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={hours.start}
                                onChange={(e) =>
                                  handleNestedInputChange(
                                    "business",
                                    "operatingHours",
                                    day,
                                    {
                                      ...hours,
                                      start: e.target.value,
                                    },
                                  )
                                }
                                disabled={!editStates.business}
                                className="w-24"
                              />
                              <span>to</span>
                              <Input
                                type="time"
                                value={hours.end}
                                onChange={(e) =>
                                  handleNestedInputChange(
                                    "business",
                                    "operatingHours",
                                    day,
                                    {
                                      ...hours,
                                      end: e.target.value,
                                    },
                                  )
                                }
                                disabled={!editStates.business}
                                className="w-24"
                              />
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Closed
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDuration">
                    Appointment Duration (minutes)
                  </Label>
                  <Input
                    id="appointmentDuration"
                    type="number"
                    value={formData.business.appointmentDuration}
                    onChange={(e) =>
                      handleInputChange(
                        "business",
                        "appointmentDuration",
                        parseInt(e.target.value),
                      )
                    }
                    disabled={!editStates.business}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPatientsPerDay">
                    Max Patients Per Day
                  </Label>
                  <Input
                    id="maxPatientsPerDay"
                    type="number"
                    value={formData.business.maxPatientsPerDay}
                    onChange={(e) =>
                      handleInputChange(
                        "business",
                        "maxPatientsPerDay",
                        parseInt(e.target.value),
                      )
                    }
                    disabled={!editStates.business}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Availability</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.business.emergencyAvailability}
                      onCheckedChange={(checked) =>
                        handleInputChange(
                          "business",
                          "emergencyAvailability",
                          checked,
                        )
                      }
                      disabled={!editStates.business}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.business.emergencyAvailability
                        ? "Available"
                        : "Not Available"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and privacy settings
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {editStates.security ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleCancel("security")}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSave("security")}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => handleEdit("security")}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Security
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={formData.security.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      handleInputChange("security", "twoFactorAuth", checked)
                    }
                    disabled={!editStates.security}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                  <Switch
                    checked={formData.security.loginAlerts}
                    onCheckedChange={(checked) =>
                      handleInputChange("security", "loginAlerts", checked)
                    }
                    disabled={!editStates.security}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorSettingsPage;
