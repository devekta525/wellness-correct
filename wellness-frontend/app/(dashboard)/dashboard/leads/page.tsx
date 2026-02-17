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
        localStorage.getItem("token") ||
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    Contact Details - {selectedContact?.name}
                  </DialogTitle>
                  <DialogDescription>
                    Complete contact information and message.
                  </DialogDescription>
                </DialogHeader>
                {selectedContact && (
                  <div className="space-y-6">
                    {/* Lead Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span className="font-medium">
                              {selectedContact.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Email:
                            </span>
                            <span className="font-medium">
                              {selectedContact.email}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Phone:
                            </span>
                            <span className="font-medium">
                              {selectedContact.phone || "N/A"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Message Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Date:
                            </span>
                            <span className="font-medium">
                              {new Date(
                                selectedContact.createdAt,
                              ).toLocaleString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Message Content */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Message</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <p className="whitespace-pre-wrap">
                            {selectedContact.message}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowViewModal(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Lead Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Contact</DialogTitle>
                  <DialogDescription>
                    Update contact details for {selectedContact?.name}
                  </DialogDescription>
                </DialogHeader>
                {editForm && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="contact-name" className="mb-2 block">
                        Name
                      </Label>
                      <Input
                        id="contact-name"
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email" className="mb-2 block">
                        Email
                      </Label>
                      <Input
                        id="contact-email"
                        value={editForm.email || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone" className="mb-2 block">
                        Phone
                      </Label>
                      <Input
                        id="contact-phone"
                        value={editForm.phone || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-message" className="mb-2 block">
                        Message
                      </Label>
                      <Textarea
                        id="contact-message"
                        value={editForm.message || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            message: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    disabled={modalLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedContact && editForm) {
                        handleUpdateContact(selectedContact._id, {
                          name: editForm.name,
                          email: editForm.email,
                          phone: editForm.phone,
                          message: editForm.message,
                        });
                      }
                    }}
                    disabled={modalLoading}
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Contact"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete Contact</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete contact{" "}
                    {selectedContact?.name}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={modalLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteContact}
                    disabled={modalLoading}
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Contact"
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
