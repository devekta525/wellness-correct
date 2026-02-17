"use client";

import React, { useEffect, useState } from "react";
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
  AlertCircle,
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

// Redux Imports
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchNotes,
  fetchNoteStats,
  selectNotesData,
  selectNotesLoading,
  selectNotesError,
  selectNoteStats,
  setFilters,
  setPagination,
  createNote,
  updateNote,
  deleteNote,
  toggleFavorite,
  exportNotes,
  Note,
} from "@/lib/redux/features/notesSlice";

const NotesPage = () => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector(selectNotesData);
  const isLoading = useAppSelector(selectNotesLoading);
  const error = useAppSelector(selectNotesError);
  const stats = useAppSelector(selectNoteStats);

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  // Form state for Add/Edit modals
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formPriority, setFormPriority] = useState("medium");
  const [formStatus, setFormStatus] = useState("draft");
  const [formTags, setFormTags] = useState("");
  const [formIsPrivate, setFormIsPrivate] = useState("true");

  // Fetch notes on mount and when filters change
  useEffect(() => {
    dispatch(fetchNotes());
    dispatch(fetchNoteStats());
  }, [dispatch]);

  // Update filters in Redux
  useEffect(() => {
    dispatch(
      setFilters({
        category: categoryFilter,
        status: statusFilter,
        priority: priorityFilter,
        search: searchTerm,
      }),
    );
  }, [categoryFilter, statusFilter, priorityFilter, searchTerm, dispatch]);

  // Update pagination in Redux
  useEffect(() => {
    dispatch(setPagination({ page: currentPage, limit: itemsPerPage }));
  }, [currentPage, itemsPerPage, dispatch]);

  // Filter and sort notes (client-side)
  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        ) ||
        (note.authorName &&
          note.authorName.toLowerCase().includes(searchTerm.toLowerCase()));
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
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

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
        return "destructive";
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
    setFormTitle(note.title);
    setFormCategory(note.category);
    setFormPriority(note.priority);
    setFormStatus(note.status);
    setFormTags(note.tags.join(", "));
    setFormIsPrivate(note.isPrivate ? "true" : "false");
    setEditorContent(note.content);
    setIsEditModalOpen(true);
  };

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setIsViewModalOpen(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      const success = await dispatch(deleteNote(noteId));
      if (success) {
        dispatch(fetchNotes());
        dispatch(fetchNoteStats());
      }
    }
  };

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newNote = {
      title: formTitle,
      content: editorContent,
      category: formCategory,
      priority: formPriority as "low" | "medium" | "high",
      status: formStatus as "draft" | "published" | "archived",
      tags: tags || [],
      isPrivate: formIsPrivate === "true",
    };

    const success = await dispatch(createNote(newNote));
    setIsSubmitting(false);

    if (success) {
      setIsAddModalOpen(false);
      setFormTitle("");
      setFormCategory("General");
      setFormPriority("medium");
      setFormStatus("draft");
      setFormTags("");
      setFormIsPrivate("true");
      setEditorContent("");
      setCurrentPage(1); // Reset to page 1 to see new note
      dispatch(setPagination({ page: 1, limit: itemsPerPage }));
      dispatch(fetchNotes());
      dispatch(fetchNoteStats());
    }
  };

  const handleUpdateNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedNote) return;

    setIsSubmitting(true);

    const tags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedData = {
      title: formTitle,
      content: editorContent,
      category: formCategory,
      priority: formPriority as "low" | "medium" | "high",
      status: formStatus as "draft" | "published" | "archived",
      tags: tags || [],
      isPrivate: formIsPrivate === "true",
    };

    const success = await dispatch(updateNote(selectedNote._id, updatedData));
    setIsSubmitting(false);

    if (success) {
      setIsEditModalOpen(false);
      setFormTitle("");
      setFormCategory("General");
      setFormPriority("medium");
      setFormStatus("draft");
      setFormTags("");
      setFormIsPrivate("true");
      setEditorContent("");
      setCurrentPage(1); // Reset to page 1
      dispatch(setPagination({ page: 1, limit: itemsPerPage }));
      dispatch(fetchNotes());
      dispatch(fetchNoteStats());
    }
  };

  const handleToggleFavorite = async (noteId: string) => {
    const success = await dispatch(toggleFavorite(noteId));
    if (success) {
      dispatch(fetchNotes());
      dispatch(fetchNoteStats());
    }
  };

  const handleExport = async () => {
    await dispatch(exportNotes());
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
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              onClick={() => {
                setFormTitle("");
                setFormCategory("General");
                setFormPriority("medium");
                setFormStatus("draft");
                setFormTags("");
                setFormIsPrivate("true");
                setEditorContent("");
                setIsAddModalOpen(true);
              }}
              className="gap-2"
            >
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
                    {stats?.total || notes.length}
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
                    {stats?.published || 0}
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
                    {stats?.favorites || 0}
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
                    {stats?.draft || 0}
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
                    <SelectItem value="General">General</SelectItem>
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

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
                  Failed to load notes
                </p>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {error}
                </p>
                <Button
                  onClick={() => dispatch(fetchNotes())}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col justify-center items-center py-24">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  Loading notes...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && notes.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-16">
                <FileText className="w-20 h-20 mx-auto mb-4 text-slate-300" />
                <p className="text-xl text-slate-500 mb-2">No notes found</p>
                <p className="text-sm text-slate-400 mb-4">
                  Create your first note to get started
                </p>
                <Button
                  onClick={() => {
                    setFormTitle("");
                    setFormCategory("General");
                    setFormPriority("medium");
                    setFormStatus("draft");
                    setFormTags("");
                    setFormIsPrivate("true");
                    setEditorContent("");
                    setIsAddModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table View */}
        {!isLoading && !error && notes.length > 0 && viewMode === "table" && (
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
                    <TableRow key={note._id}>
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
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {note.authorName || "Unknown"}
                          </span>
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
                                onClick={() => handleToggleFavorite(note._id)}
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    note.isFavorite
                                      ? "fill-yellow-400 text-yellow-400"
                                      : ""
                                  }`}
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
                                onClick={() => handleDeleteNote(note._id)}
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
        {!isLoading && !error && notes.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedNotes.map((note) => (
              <Card key={note._id} className="flex flex-col h-full">
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
                      onClick={() => handleToggleFavorite(note._id)}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          note.isFavorite
                            ? "fill-yellow-400 text-yellow-400"
                            : ""
                        }`}
                      />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{note.authorName || "Unknown"}</span>
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
        {!isLoading && !error && totalPages > 1 && (
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
            <form onSubmit={handleAddNote}>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Note Details</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="noteTitle">Note Title *</Label>
                      <Input
                        id="noteTitle"
                        placeholder="Enter note title"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="noteCategory">Category *</Label>
                      <Select
                        value={formCategory}
                        onValueChange={setFormCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
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
                        value={formPriority}
                        onValueChange={setFormPriority}
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
                      <Select value={formStatus} onValueChange={setFormStatus}>
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
                    <div>
                      <Label htmlFor="noteTags">Tags (comma separated)</Label>
                      <Input
                        id="noteTags"
                        placeholder="work, project, important"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="isPrivate">Privacy</Label>
                      <Select
                        value={formIsPrivate}
                        onValueChange={setFormIsPrivate}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Private</SelectItem>
                          <SelectItem value="false">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label htmlFor="noteContent">Note Content</Label>
                    <div className="mt-2">
                      <LexicalEditor
                        placeholder="Start writing your note..."
                        onChange={setEditorContent}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Note"
                  )}
                </Button>
              </DialogFooter>
            </form>
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
              <form onSubmit={handleUpdateNote}>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Note Details</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editNoteTitle">Note Title *</Label>
                        <Input
                          id="editNoteTitle"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="editNoteCategory">Category *</Label>
                        <Select
                          value={formCategory}
                          onValueChange={setFormCategory}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General</SelectItem>
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
                          value={formPriority}
                          onValueChange={setFormPriority}
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
                          value={formStatus}
                          onValueChange={setFormStatus}
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
                        <Label htmlFor="editNoteTags">Tags</Label>
                        <Input
                          id="editNoteTags"
                          value={formTags}
                          onChange={(e) => setFormTags(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="editIsPrivate">Privacy</Label>
                        <Select
                          value={formIsPrivate}
                          onValueChange={setFormIsPrivate}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Private</SelectItem>
                            <SelectItem value="false">Public</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <Label htmlFor="editNoteContent">Note Content</Label>
                      <div className="mt-2">
                        <LexicalEditor
                          initialContent={selectedNote.content}
                          placeholder="Start writing your note..."
                          onChange={setEditorContent}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Note"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
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
                    <span className="text-sm">
                      {selectedNote.authorName || "Unknown"}
                    </span>
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
                    className="prose prose-sm max-w-none dark:prose-invert"
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
                    <span>By: {selectedNote.authorName || "Unknown"}</span>
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
