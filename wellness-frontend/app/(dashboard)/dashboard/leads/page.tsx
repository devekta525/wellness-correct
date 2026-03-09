"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Users,
  Phone,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  MessageSquare,
  Calendar,
  Mail,
} from "lucide-react";
import Swal from "sweetalert2";
import { getApiV1Url } from "@/lib/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import Loader from "@/components/common/dashboard/Loader";
import Error from "@/components/common/dashboard/Error";
import NoData from "@/components/common/dashboard/NoData";

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

const LeadsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Contact> | null>(null);

  // Helper to get auth token
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      let token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        "";
      return token.replace(/^"|"$/g, "");
    }
    return "";
  };

  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(getApiV1Url("/contacts"), {
        headers,
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setContacts(data.data);
      } else {
        setError(data.message || "Failed to fetch contacts");
      }
    } catch (err) {
      setError("Failed to fetch contacts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Client-side filtering
  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      contact.phone.includes(searchLower) ||
      contact.message.toLowerCase().includes(searchLower)
    );
  });

  // Pagination logic
  const totalItems = filteredContacts.length;
  const totalPages = Math.ceil(totalItems / pagination.limit);
  const startIndex = (pagination.page - 1) * pagination.limit;
  const paginatedContacts = filteredContacts.slice(
    startIndex,
    startIndex + pagination.limit,
  );

  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Reset page when search changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchTerm]);

  const handleUpdateContact = async (
    contactId: string,
    updatedData: Partial<Contact>,
  ) => {
    setModalLoading(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(getApiV1Url(`/contacts/${contactId}`), {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (data.success) {
        fetchContacts();
        setShowEditModal(false);
        Swal.fire({
          title: "Success!",
          text: "Contact updated successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update contact.",
        icon: "error",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    setModalLoading(true);
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(getApiV1Url(`/contacts/${selectedContact._id}`), {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        fetchContacts();
        setShowDeleteModal(false);
        setSelectedContact(null);
        Swal.fire({
          title: "Deleted!",
          text: "The contact has been deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete contact.",
        icon: "error",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const openViewModal = (contact: Contact) => {
    setSelectedContact(contact);
    setShowViewModal(true);
  };

  const openEditModal = (contact: Contact) => {
    setSelectedContact(contact);
    setEditForm({ ...contact });
    setShowEditModal(true);
  };

  const openDeleteModal = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDeleteModal(true);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {error ? (
          <Error title="Error loading contacts" message={error} />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Contacts (Leads)
                </h1>
                <p className="text-muted-foreground">
                  Manage customer inquiries and contact form submissions
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Contacts
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {contacts.length}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        This Month
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {
                          contacts.filter((c) => {
                            const date = new Date(c.createdAt);
                            const now = new Date();
                            return (
                              date.getMonth() === now.getMonth() &&
                              date.getFullYear() === now.getFullYear()
                            );
                          }).length
                        }
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        With Phone
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {contacts.filter((c) => c.phone).length}
                      </p>
                    </div>
                    <Phone className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        With Email
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {contacts.filter((c) => c.email).length}
                      </p>
                    </div>
                    <Mail className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* View Toggle */}
                  <div className="flex border border-input rounded-lg overflow-hidden">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === "grid" ? "default" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("grid")}
                          className="rounded-none"
                        >
                          <Grid3X3 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Grid view</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="icon"
                          onClick={() => setViewMode("list")}
                          className="rounded-none"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>List view</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            {isLoading ? (
              <Loader variant="skeleton" message="Loading contacts..." />
            ) : filteredContacts.length === 0 ? (
              <NoData
                message="No contacts found"
                description="No contacts match your current search"
                icon={
                  <Users className="w-full h-full text-muted-foreground/60" />
                }
                size="lg"
              />
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedContacts.map((contact: Contact) => (
                      <Card
                        key={contact._id}
                        className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {contact.name}
                            </CardTitle>
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </Badge>
                          </div>
                          <CardDescription>
                            {contact.email}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 flex-1 flex flex-col">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Phone:
                              </span>
                              <span className="text-sm font-medium">
                                {contact.phone || "N/A"}
                              </span>
                            </div>
                            <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground line-clamp-3">
                              {contact.message}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2 mt-auto">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openViewModal(contact)}
                                  className="flex-1 gap-2"
                                  size="sm"
                                  variant="outline"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View details</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openEditModal(contact)}
                                  className="flex-1 gap-2"
                                  size="sm"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit contact</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Contact Info</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedContacts.map((contact: Contact) => (
                          <TableRow key={contact._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">
                                  {contact.name}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm text-foreground">
                                  {contact.email}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {contact.phone}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                {contact.message}
                              </p>
                            </TableCell>
                            <TableCell>
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => openViewModal(contact)}
                                      variant="ghost"
                                      size="icon"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View details</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => openEditModal(contact)}
                                      variant="ghost"
                                      size="icon"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit contact</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => openDeleteModal(contact)}
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete contact</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}

                {/* Pagination */}
                {!isLoading && filteredContacts.length > 0 && totalPages > 1 && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Showing {startIndex + 1} to{" "}
                          {Math.min(
                            startIndex + pagination.limit,
                            totalItems,
                          )}{" "}
                          of {totalItems} contacts
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(Math.max(pagination.page - 1, 1))
                            }
                            disabled={pagination.page === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: totalPages },
                              (_, i) => i + 1,
                            ).map((page) => (
                              <Button
                                key={page}
                                variant={
                                  pagination.page === page
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePageChange(
                                Math.min(pagination.page + 1, totalPages),
                              )
                            }
                            disabled={pagination.page === totalPages}
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* View Lead Modal */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
              <DialogContent className="max-w-[800px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="px-8 py-6 border-b bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      Inquiry Procurement Node
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                      Decipher incoming lead intelligence and verify contact vectors.
                    </DialogDescription>
                  </div>
                </DialogHeader>

                {selectedContact && (
                  <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                    {/* Identity Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legal Alias</p>
                        <p className="text-lg font-black text-slate-900 dark:text-slate-50">{selectedContact.name}</p>
                      </div>
                      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Vector</p>
                        <p className="text-sm font-bold text-primary truncate">{selectedContact.email}</p>
                      </div>
                      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Voice Frequency</p>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{selectedContact.phone || "UNAVAILABLE"}</p>
                      </div>
                    </div>

                    {/* Temporal & Contextual Data */}
                    <div className="flex flex-wrap gap-4">
                      <Badge variant="outline" className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 text-[10px] font-black uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5 mr-2 text-primary" />
                        Procured: {new Date(selectedContact.createdAt).toLocaleString()}
                      </Badge>
                      <Badge variant="outline" className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 text-[10px] font-black uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
                        Registry ID: {selectedContact._id.slice(-8).toUpperCase()}
                      </Badge>
                    </div>

                    {/* Intelligence Payload */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Message Payload</span>
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                      </div>
                      <div className="p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                          &quot;{selectedContact.message}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 dark:bg-slate-900/50 sticky bottom-0 z-10 backdrop-blur-sm">
                  <Button
                    variant="outline"
                    className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] border-slate-200"
                    onClick={() => setShowViewModal(false)}
                  >
                    Close Protocol
                  </Button>
                  <Button
                    onClick={() => {
                      setShowViewModal(false);
                      openEditModal(selectedContact!);
                    }}
                    className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                  >
                    Calibrate Vector
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Lead Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogContent className="max-w-[600px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="px-8 py-6 border-b bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Edit className="w-6 h-6 text-primary" />
                      </div>
                      Calibration Interface
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                      Refine contact parameters and stabilize identity record.
                    </DialogDescription>
                  </div>
                </DialogHeader>

                {editForm && (
                  <div className="p-8 space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="contact-name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Designation</Label>
                        <Input
                          id="contact-name"
                          className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="contact-email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Connection String</Label>
                        <Input
                          id="contact-email"
                          className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                          value={editForm.email || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="contact-phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Voice Vector Port</Label>
                        <Input
                          id="contact-phone"
                          className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                          value={editForm.phone || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="contact-message" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Intelligence Payload Modification</Label>
                        <Textarea
                          id="contact-message"
                          className="min-h-[120px] rounded-2xl border-slate-200 bg-white dark:bg-slate-900 shadow-inner focus:ring-primary/20 resize-none p-4 font-medium"
                          value={editForm.message || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              message: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 dark:bg-slate-900/50 sticky bottom-0 z-10 backdrop-blur-sm">
                  <Button
                    variant="outline"
                    className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] border-slate-200"
                    onClick={() => setShowEditModal(false)}
                    disabled={modalLoading}
                  >
                    Discard Changes
                  </Button>
                  <Button
                    onClick={() =>
                      handleUpdateContact(selectedContact!._id, editForm!)
                    }
                    disabled={modalLoading}
                    className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Synchronizing...
                      </>
                    ) : (
                      "Commit Updates"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="px-8 py-6 border-b bg-red-50/50 dark:bg-red-950/20 sticky top-0 z-10 backdrop-blur-sm">
                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-black uppercase tracking-tight text-red-600 dark:text-red-400 flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      Registry Purge Protocol
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                      Irreversible termination of lead intelligence node.
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <div className="p-8">
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed text-center">
                      Confirm deletion of <span className="text-red-600 font-black px-2 bg-red-50 dark:bg-red-950/30 rounded-lg">&quot;{selectedContact?.name}&quot;</span> from the central registry?
                    </p>
                  </div>
                </div>

                <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 dark:bg-slate-900/50 sticky bottom-0 z-10 backdrop-blur-sm">
                  <Button
                    variant="outline"
                    className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={modalLoading}
                  >
                    Abort Process
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteContact}
                    disabled={modalLoading}
                    className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Purging...
                      </>
                    ) : (
                      "Confirm Purge"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default LeadsPage;
