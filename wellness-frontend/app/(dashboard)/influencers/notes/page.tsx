"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  User,
  Clock,
  Grid3X3,
  List,
  Download,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Heart,
  Brain,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LexicalEditor from "./LexicalEditor";

import { getApiV1Url } from "@/lib/utils/api";
// Note type definition
type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isPrivate: boolean;
  priority: "low" | "medium" | "high";
  status: "draft" | "published" | "archived";
};

// Dummy notes data
const notes: Note[] = [
  {
    id: "1",
    title: "Project Planning - Q1 2024",
    content:
      "<h2>Project Overview</h2><p><strong>Date:</strong> January 20, 2024</p><p><strong>Objective:</strong> Complete website redesign and launch new features</p><h3>Key Tasks:</h3><ul><li>UI/UX design updates</li><li>Backend API development</li><li>Database optimization</li><li>Testing and deployment</li></ul><h3>Timeline:</h3><ol><li>Design phase - 2 weeks</li><li>Development - 4 weeks</li><li>Testing - 1 week</li><li>Launch - 1 week</li></ol>",
    category: "Work",
    tags: ["project", "planning", "development", "timeline"],
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
    isFavorite: true,
    isPrivate: false,
    priority: "high",
    status: "published",
  },
  {
    id: "2",
    title: "Learning Notes - React Hooks",
    content:
      "<h2>React Hooks Deep Dive</h2><p><strong>Updated:</strong> January 18, 2024</p><h3>Key Concepts:</h3><ul><li>useState for state management</li><li>useEffect for side effects</li><li>useContext for global state</li><li>Custom hooks for reusability</li></ul><h3>Best Practices:</h3><p>Always use hooks at the top level of components, never inside loops or conditions.</p>",
    category: "Learning",
    tags: ["react", "hooks", "javascript", "frontend"],
    authorId: "1",
    authorName: "John Smith",
    createdAt: "2024-01-18T14:30:00Z",
    updatedAt: "2024-01-18T14:30:00Z",
    isFavorite: false,
    isPrivate: false,
    priority: "medium",
    status: "published",
  },
  {
    id: "3",
    title: "Personal Goals - 2024",
    content:
      "<h2>New Year Resolutions</h2><p><strong>Focus Areas:</strong> Health, Career, Learning</p><h3>Health Goals:</h3><p>Exercise 3 times per week, maintain healthy diet</p><h3>Career Goals:</h3><p>Learn new technologies, take on leadership role</p><h3>Learning Goals:</h3><p>Complete online courses, read 12 books this year</p>",
    category: "Personal",
    tags: ["goals", "resolutions", "health", "career"],
    authorId: "1",
    authorName: "John Smith",
    createdAt: "2024-01-15T09:15:00Z",
    updatedAt: "2024-01-15T09:15:00Z",
    isFavorite: true,
    isPrivate: true,
    priority: "high",
    status: "draft",
  },
];

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Personal",
    tags: "",
    priority: "medium",
    status: "draft",
    isPrivate: false,
  });

  // Fetch notes from backend
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(getApiV1Url("/influencer-notes"), {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const result = await response.json();
      if (result.success) {
        // Map backend data to frontend format
        const mappedNotes = result.data.map((note: any) => ({
          id: note._id,
          title: note.title,
          content: note.content,
          category: note.category,
          tags: note.tags || [],
          authorId: note.author?._id || note.author || "",
          authorName: note.author
            ? `${note.author.firstName || ""} ${note.author.lastName || ""}`.trim() ||
              "Unknown"
            : "Unknown",
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          isFavorite: note.isFavorite,
          isPrivate: note.isPrivate,
          priority: note.priority,
          status: note.status,
        }));
        setNotes(mappedNotes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort notes
  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        ) ||
        note.authorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || note.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || note.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || note.priority === priorityFilter;
      return (
        matchesSearch && matchesCategory && matchesStatus && matchesPriority
      );
    })
    .sort((a, b) => {
      let aValue: string | number | Date | boolean | string[] =
        a[sortBy as keyof typeof a];
      let bValue: string | number | Date | boolean | string[] =
        b[sortBy as keyof typeof b];

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotes = filteredNotes.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Work":
        return <FileText className="w-4 h-4" />;
      case "Learning":
        return <BookOpen className="w-4 h-4" />;
      case "Personal":
        return <Heart className="w-4 h-4" />;
      case "Ideas":
        return <Brain className="w-4 h-4" />;
      case "Meeting":
        return <User className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Work":
        return "default";
      case "Learning":
        return "secondary";
      case "Personal":
        return "outline";
      case "Ideas":
        return "default";
      case "Meeting":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "outline";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "archived":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags.join(", "),
      priority: note.priority,
      status: note.status,
      isPrivate: note.isPrivate,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setFormData({
      title: "",
      content: "",
      category: "Personal",
      tags: "",
      priority: "medium",
      status: "draft",
      isPrivate: false,
    });
    setIsAddModalOpen(true);
  };

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setIsViewModalOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiV1Url(`/influencer-notes/${noteId}`), {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await fetchNotes(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiV1Url("/influencer-notes"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsAddModalOpen(false);
        setFormData({
          title: "",
          content: "",
          category: "Personal",
          tags: "",
          priority: "medium",
          status: "draft",
          isPrivate: false,
        });
        await fetchNotes(); // Refresh the list
      } else {
        const error = await response.json();
        console.error("Error creating note:", error);
        alert(error.message || "Failed to create note");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to create note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        getApiV1Url(`/influencer-notes/${selectedNote.id}`),
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setIsEditModalOpen(false);
        await fetchNotes(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (noteId: string) => {
    try {
      const url = getApiV1Url(`/influencer-notes/${noteId}/favorite`);

      const response = await fetch(url, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to toggle favorite:", response.status, errorText);
        return;
      }

      const result = await response.json();
      const updated = result?.data;

      if (updated?._id) {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === updated._id
              ? { ...note, isFavorite: updated.isFavorite }
              : note,
          ),
        );
      } else {
        await fetchNotes();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notes</h1>
            <p className="text-muted-foreground">
              Manage your personal notes, ideas, and thoughts
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Note
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Notes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {notes.length}
                  </p>
                  <p className="text-sm text-emerald-600 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    All notes
                  </p>
                </div>
                <FileText className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-foreground">
                    {notes.filter((n) => n.status === "published").length}
                  </p>
                  <p className="text-sm text-blue-600 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Ready to share
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                  <p className="text-2xl font-bold text-foreground">
                    {notes.filter((n) => n.isFavorite).length}
                  </p>
                  <p className="text-sm text-yellow-600 flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Starred notes
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold text-foreground">
                    {notes.filter((n) => n.status === "draft").length}
                  </p>
                  <p className="text-sm text-orange-600 flex items-center gap-1">
                    <Edit className="w-3 h-3" />
                    Work in progress
                  </p>
                </div>
                <Edit className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search notes by title, content, tags, or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Learning">Learning</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Ideas">Ideas</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="updatedAt">Updated Date</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>

                {/* View Toggle */}
                <div className="flex border border-input rounded-lg overflow-hidden">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("table")}
                        className="rounded-none"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Table view</p>
                    </TooltipContent>
                  </Tooltip>
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table View */}
        {viewMode === "table" && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Note</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {getCategoryIcon(note.category)}
                          </div>
                          <div>
                            <p className="font-medium">{note.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {note.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {note.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{note.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoryColor(note.category)}>
                          {note.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">
                              {note.authorName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{note.authorName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(note.priority)}>
                          {note.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(note.status)}>
                          {note.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleFavorite(note.id)}
                              >
                                <Star
                                  className={`w-4 h-4 ${note.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {note.isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"}
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewNote(note)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Note</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditNote(note)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Note</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Note</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedNotes.map((note) => (
              <Card key={note.id} className="flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {getCategoryIcon(note.category)}
                      </div>
                      <Badge
                        variant={getCategoryColor(note.category)}
                        className="text-xs"
                      >
                        {note.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(note.id)}
                    >
                      <Star
                        className={`w-4 h-4 ${note.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                      />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{note.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={getPriorityColor(note.priority)}
                        className="text-xs"
                      >
                        {note.priority}
                      </Badge>
                      <Badge
                        variant={getStatusColor(note.status)}
                        className="text-xs"
                      >
                        {note.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewNote(note)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditNote(note)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredNotes.length)} of{" "}
              {filteredNotes.length} notes
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Add Note Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
              <DialogDescription>
                Create a new note with rich text formatting
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Note Details</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="noteTitle">Note Title</Label>
                    <Input
                      id="noteTitle"
                      placeholder="Enter note title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="noteCategory">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Learning">Learning</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Ideas">Ideas</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notePriority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="noteStatus">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="noteTags">Tags (comma separated)</Label>
                    <Input
                      id="noteTags"
                      placeholder="work, project, important"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <div>
                  <Label htmlFor="noteContent">Note Content</Label>
                  <div className="mt-2">
                    <textarea
                      className="w-full min-h-[300px] p-3 border rounded-md"
                      placeholder="Start writing your note..."
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                    />
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
              <Button
                onClick={handleAddNote}
                disabled={isLoading || !formData.title || !formData.content}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Note"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Note Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>
                Edit your note with rich text formatting
              </DialogDescription>
            </DialogHeader>
            {selectedNote && (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Note Details</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editNoteTitle">Note Title</Label>
                      <Input
                        id="editNoteTitle"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="editNoteCategory">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Learning">Learning</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Ideas">Ideas</SelectItem>
                          <SelectItem value="Meeting">Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editNotePriority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                          setFormData({ ...formData, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editNoteStatus">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editAuthorName">Author Name</Label>
                      <Input
                        id="editAuthorName"
                        value={selectedNote.authorName}
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="editNoteTags">Tags</Label>
                      <Input
                        id="editNoteTags"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label htmlFor="editNoteContent">Note Content</Label>
                    <div className="mt-2">
                      <textarea
                        className="w-full min-h-[300px] p-3 border rounded-md"
                        placeholder="Start writing your note..."
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateNote} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Note"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Note Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Note</DialogTitle>
              <DialogDescription>{selectedNote?.title}</DialogDescription>
            </DialogHeader>
            {selectedNote && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant={getCategoryColor(selectedNote.category)}>
                    {selectedNote.category}
                  </Badge>
                  <Badge variant={getPriorityColor(selectedNote.priority)}>
                    {selectedNote.priority}
                  </Badge>
                  <Badge variant={getStatusColor(selectedNote.status)}>
                    {selectedNote.status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedNote.authorName}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNote.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="border rounded-lg p-4">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>
                      Created:{" "}
                      {new Date(selectedNote.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      Updated:{" "}
                      {new Date(selectedNote.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>By: {selectedNote.authorName}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditNote(selectedNote!);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default NotesPage;
