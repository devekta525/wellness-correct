'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Edit, 
  Trash2, 
  MessageSquare,
  Eye,
  EyeOff,
  Loader2,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import NoData from '@/components/common/dashboard/NoData'
import Loader from '@/components/common/dashboard/Loader'
import Error from '@/components/common/dashboard/Error'
import {
  fetchPopupsData,
  setPopupFilters,
  selectPopupsData,
  selectPopupsLoading,
  selectPopupsError,
  selectPopupsFilters,
  createPopup,
  updatePopup,
  deletePopup,
  Popup
} from '@/lib/redux/features/popupSlice'

const statuses = ["All", "active", "inactive"]

const PopupsPage = () => {
  const dispatch = useAppDispatch()
  const popups = useAppSelector(selectPopupsData)
  const isLoading = useAppSelector(selectPopupsLoading)
  const error = useAppSelector(selectPopupsError)
  const filters = useAppSelector(selectPopupsFilters)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null)

  const [newPopup, setNewPopup] = useState({
    name: '',
    heading: '',
    subheading: '',
    delay: '',
    image: '',
    ctaButtonText: 'Subscribe',
    secondaryButtonText: 'No Thanks',
    buttonAction: '',
    badgeText: '',
    badgeVisible: false,
    showCloseIcon: true,
    status: 'active' as 'active' | 'inactive',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    buttonColor: '#007bff',
    buttonTextColor: '#ffffff',
    borderColor: '#e0e0e0'
  })

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchPopupsData())
  }, [dispatch])

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    dispatch(setPopupFilters({ name: value }))
  }

  const handleStatusChange = (value: string) => {
    dispatch(setPopupFilters({ status: value === 'All' ? '' : value }))
  }

  const handleAddPopup = async () => {
    try {
      const formData = new FormData()
      formData.append('name', newPopup.name)
      formData.append('heading', newPopup.heading)
      formData.append('subheading', newPopup.subheading)
      formData.append('delay', newPopup.delay)
      formData.append('image', newPopup.image)
      formData.append('ctaButtonText', newPopup.ctaButtonText)
      formData.append('secondaryButtonText', newPopup.secondaryButtonText)
      formData.append('buttonAction', newPopup.buttonAction)
      formData.append('badgeText', newPopup.badgeText)
      formData.append('badgeVisible', newPopup.badgeVisible.toString())
      formData.append('showCloseIcon', newPopup.showCloseIcon.toString())
      formData.append('status', newPopup.status)
      formData.append('backgroundColor', newPopup.backgroundColor)
      formData.append('textColor', newPopup.textColor)
      formData.append('buttonColor', newPopup.buttonColor)
      formData.append('buttonTextColor', newPopup.buttonTextColor)
      formData.append('borderColor', newPopup.borderColor)

      const success = await dispatch(createPopup(formData)) as unknown as boolean
      if (success) {
        setShowAddModal(false)
        setNewPopup({
          name: '',
          heading: '',
          subheading: '',
          delay: '',
          image: '',
          ctaButtonText: 'Subscribe',
          secondaryButtonText: 'No Thanks',
          buttonAction: '',
          badgeText: '',
          badgeVisible: false,
          showCloseIcon: true,
          status: 'active',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          buttonColor: '#007bff',
          buttonTextColor: '#ffffff',
          borderColor: '#e0e0e0'
        })
        dispatch(fetchPopupsData())
      }
    } catch (error) {
      console.error('Error creating popup:', error)
    }
  }

  const handleEditPopup = async () => {
    try {
      if (!selectedPopup) return

      const formData = new FormData()
      formData.append('name', newPopup.name)
      formData.append('heading', newPopup.heading)
      formData.append('subheading', newPopup.subheading)
      formData.append('delay', newPopup.delay)
      formData.append('image', newPopup.image)
      formData.append('ctaButtonText', newPopup.ctaButtonText)
      formData.append('secondaryButtonText', newPopup.secondaryButtonText)
      formData.append('buttonAction', newPopup.buttonAction)
      formData.append('badgeText', newPopup.badgeText)
      formData.append('badgeVisible', newPopup.badgeVisible.toString())
      formData.append('showCloseIcon', newPopup.showCloseIcon.toString())
      formData.append('status', newPopup.status)
      formData.append('backgroundColor', newPopup.backgroundColor)
      formData.append('textColor', newPopup.textColor)
      formData.append('buttonColor', newPopup.buttonColor)
      formData.append('buttonTextColor', newPopup.buttonTextColor)
      formData.append('borderColor', newPopup.borderColor)

      const success = await dispatch(updatePopup(selectedPopup._id, formData)) as unknown as boolean
      if (success) {
        setShowEditModal(false)
        setSelectedPopup(null)
        dispatch(fetchPopupsData())
      }
    } catch (error) {
      console.error('Error updating popup:', error)
    }
  }

  const handleDeletePopup = async () => {
    try {
      if (!selectedPopup) return
      
      const success = await dispatch(deletePopup(selectedPopup._id)) as unknown as boolean
      if (success) {
        setShowDeleteModal(false)
        setSelectedPopup(null)
        dispatch(fetchPopupsData())
      }
    } catch (error) {
      console.error('Error deleting popup:', error)
    }
  }


  const openEditModal = (popup: Popup) => {
    setSelectedPopup(popup)
    setNewPopup({
      name: popup.name,
      heading: popup.heading,
      subheading: popup.subheading,
      delay: popup.delay.toString(),
      image: popup.image,
      ctaButtonText: popup.ctaButtonText,
      secondaryButtonText: popup.secondaryButtonText,
      buttonAction: popup.buttonAction,
      badgeText: popup.badgeText,
      badgeVisible: popup.badgeVisible,
      showCloseIcon: popup.showCloseIcon,
      status: popup.status,
      backgroundColor: popup.backgroundColor,
      textColor: popup.textColor,
      buttonColor: popup.buttonColor,
      buttonTextColor: popup.buttonTextColor,
      borderColor: popup.borderColor
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (popup: Popup) => {
    setSelectedPopup(popup)
    setShowDeleteModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {error ? (
          <Error title="Error loading popups" message={error} />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Popups</h1>
                <p className="text-muted-foreground">Manage website popups and promotional banners</p>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setShowAddModal(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Popup
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create a new popup</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Popups</p>
                      <p className="text-2xl font-bold text-foreground">{popups.length}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Popups</p>
                      <p className="text-2xl font-bold text-foreground">
                        {popups.filter(p => p.status === 'active').length}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Inactive Popups</p>
                      <p className="text-2xl font-bold text-foreground">
                        {popups.filter(p => p.status === 'inactive').length}
                      </p>
                    </div>
                    <EyeOff className="w-8 h-8 text-amber-500" />
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
                      placeholder="Search popups..."
                      value={filters.name || ''}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={filters.status || 'All'} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex border border-input rounded-lg overflow-hidden">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'grid' ? 'default' : 'ghost'}
                          size="icon"
                          onClick={() => setViewMode('grid')}
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
                          variant={viewMode === 'list' ? 'default' : 'ghost'}
                          size="icon"
                          onClick={() => setViewMode('list')}
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
              <Loader variant="skeleton" message="Loading popups..." />
            ) : popups.length === 0 ? (
              <NoData 
                message="No popups found"
                description="Get started by creating your first popup"
                icon={<MessageSquare className="w-full h-full text-muted-foreground/60" />}
                action={{
                  label: "Add Popup",
                  onClick: () => setShowAddModal(true)
                }}
                size="lg"
              />
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {popups.map(popup => (
                      <Card key={popup._id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                        <CardContent className="p-6 flex-1 flex flex-col">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <CardTitle className="text-lg">{popup.name}</CardTitle>
                              <Badge variant={popup.status === 'active' ? 'default' : 'secondary'}>
                                {popup.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-3 mb-4">
                              <div>
                                <p className="text-sm font-medium text-foreground">{popup.heading}</p>
                                <p className="text-sm text-muted-foreground">{popup.subheading}</p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Delay</span>
                                <span className="font-medium">{popup.delay}s</span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Created</span>
                                <span className="font-medium text-sm">{formatDate(popup.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-auto">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openEditModal(popup)}
                                  className="flex-1 gap-2"
                                  size="sm"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit popup details</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => openDeleteModal(popup)}
                                  variant="outline"
                                  className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  size="sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete this popup</p>
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
                          <TableHead>Heading</TableHead>
                          <TableHead>Delay</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {popups.map(popup => (
                          <TableRow key={popup._id}>
                            <TableCell className="font-medium">{popup.name}</TableCell>
                            <TableCell>{popup.heading}</TableCell>
                            <TableCell>{popup.delay}s</TableCell>
                            <TableCell>
                              <Badge variant={popup.status === 'active' ? 'default' : 'secondary'}>
                                {popup.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(popup.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => openEditModal(popup)}
                                      variant="ghost"
                                      size="icon"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit popup</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => openDeleteModal(popup)}
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete popup</p>
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
              </>
            )}

            {/* Add Popup Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Popup</DialogTitle>
                  <DialogDescription>
                    Create a new popup with all the necessary details and see a live preview.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Basic Information</h3>
                    <div>
                      <Label htmlFor="add-popup-name" className="mb-2 block">Popup Name</Label>
                      <Input
                        id="add-popup-name"
                        type="text"
                        placeholder="e.g., Newsletter Signup"
                        value={newPopup.name}
                        onChange={(e) => setNewPopup({...newPopup, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-popup-heading" className="mb-2 block">Heading</Label>
                      <Input
                        id="add-popup-heading"
                        type="text"
                        placeholder="e.g., Subscribe to our newsletter"
                        value={newPopup.heading}
                        onChange={(e) => setNewPopup({...newPopup, heading: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-popup-subheading" className="mb-2 block">Subheading</Label>
                      <Textarea
                        id="add-popup-subheading"
                        placeholder="e.g., Get the latest updates and exclusive offers"
                        value={newPopup.subheading}
                        onChange={(e) => setNewPopup({...newPopup, subheading: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-popup-delay" className="mb-2 block">Delay (seconds)</Label>
                      <Input
                        id="add-popup-delay"
                        type="number"
                        placeholder="5"
                        value={newPopup.delay}
                        onChange={(e) => setNewPopup({...newPopup, delay: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Buttons & Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Buttons & Actions</h3>
                    <div>
                      <Label htmlFor="add-popup-cta-text" className="mb-2 block">CTA Button Text</Label>
                      <Input
                        id="add-popup-cta-text"
                        type="text"
                        placeholder="Subscribe"
                        value={newPopup.ctaButtonText}
                        onChange={(e) => setNewPopup({...newPopup, ctaButtonText: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-popup-secondary-text" className="mb-2 block">Secondary Button Text</Label>
                      <Input
                        id="add-popup-secondary-text"
                        type="text"
                        placeholder="No Thanks"
                        value={newPopup.secondaryButtonText}
                        onChange={(e) => setNewPopup({...newPopup, secondaryButtonText: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-popup-action" className="mb-2 block">Button Action</Label>
                      <Input
                        id="add-popup-action"
                        type="text"
                        placeholder="e.g., /subscribe"
                        value={newPopup.buttonAction}
                        onChange={(e) => setNewPopup({...newPopup, buttonAction: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-popup-badge" className="mb-2 block">Badge Text</Label>
                      <Input
                        id="add-popup-badge"
                        type="text"
                        placeholder="e.g., NEW"
                        value={newPopup.badgeText}
                        onChange={(e) => setNewPopup({...newPopup, badgeText: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="add-popup-badge-visible"
                        checked={newPopup.badgeVisible}
                        onChange={(e) => setNewPopup({...newPopup, badgeVisible: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="add-popup-badge-visible">Show Badge</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="add-popup-close-icon"
                        checked={newPopup.showCloseIcon}
                        onChange={(e) => setNewPopup({...newPopup, showCloseIcon: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="add-popup-close-icon">Show Close Icon</Label>
                    </div>
                    <div>
                      <Label htmlFor="add-popup-status" className="mb-2 block">Status</Label>
                      <Select value={newPopup.status} onValueChange={(value: 'active' | 'inactive') => setNewPopup({...newPopup, status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Color Customization */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Color Customization</h3>
                    <div>
                      <Label htmlFor="add-popup-bg-color" className="mb-2 block">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="add-popup-bg-color"
                          type="color"
                          value={newPopup.backgroundColor}
                          onChange={(e) => setNewPopup({...newPopup, backgroundColor: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={newPopup.backgroundColor}
                          onChange={(e) => setNewPopup({...newPopup, backgroundColor: e.target.value})}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="add-popup-text-color" className="mb-2 block">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="add-popup-text-color"
                          type="color"
                          value={newPopup.textColor}
                          onChange={(e) => setNewPopup({...newPopup, textColor: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={newPopup.textColor}
                          onChange={(e) => setNewPopup({...newPopup, textColor: e.target.value})}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="add-popup-button-color" className="mb-2 block">Button Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="add-popup-button-color"
                          type="color"
                          value={newPopup.buttonColor}
                          onChange={(e) => setNewPopup({...newPopup, buttonColor: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={newPopup.buttonColor}
                          onChange={(e) => setNewPopup({...newPopup, buttonColor: e.target.value})}
                          placeholder="#007bff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="add-popup-button-text-color" className="mb-2 block">Button Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="add-popup-button-text-color"
                          type="color"
                          value={newPopup.buttonTextColor}
                          onChange={(e) => setNewPopup({...newPopup, buttonTextColor: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={newPopup.buttonTextColor}
                          onChange={(e) => setNewPopup({...newPopup, buttonTextColor: e.target.value})}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="add-popup-border-color" className="mb-2 block">Border Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="add-popup-border-color"
                          type="color"
                          value={newPopup.borderColor}
                          onChange={(e) => setNewPopup({...newPopup, borderColor: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={newPopup.borderColor}
                          onChange={(e) => setNewPopup({...newPopup, borderColor: e.target.value})}
                          placeholder="#e0e0e0"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Live Preview</h3>
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 min-h-[400px] flex items-center justify-center">
                      <div 
                        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-sm w-full border"
                        style={{
                          backgroundColor: newPopup.backgroundColor,
                          color: newPopup.textColor,
                          borderColor: newPopup.borderColor
                        }}
                      >
                        {newPopup.badgeVisible && newPopup.badgeText && (
                          <div className="mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {newPopup.badgeText}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold" style={{ color: newPopup.textColor }}>
                            {newPopup.heading || 'Popup Heading'}
                          </h3>
                          {newPopup.showCloseIcon && (
                            <button className="text-gray-400 hover:text-gray-600">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <p className="text-sm mb-4 opacity-80" style={{ color: newPopup.textColor }}>
                          {newPopup.subheading || 'This is a sample subheading text for your popup.'}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            style={{
                              backgroundColor: newPopup.buttonColor,
                              color: newPopup.buttonTextColor,
                              borderColor: newPopup.buttonColor
                            }}
                          >
                            {newPopup.ctaButtonText || 'Subscribe'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            style={{
                              borderColor: newPopup.borderColor,
                              color: newPopup.textColor
                            }}
                          >
                            {newPopup.secondaryButtonText || 'No Thanks'}
                          </Button>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPopup} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Popup'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Popup Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Popup</DialogTitle>
                  <DialogDescription>
                    Update the popup details below and see a live preview.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Basic Information</h3>
                    <div>
                      <Label htmlFor="edit-popup-name" className="mb-2 block">Popup Name</Label>
                      <Input
                        id="edit-popup-name"
                        type="text"
                        placeholder="e.g., Newsletter Signup"
                        value={newPopup.name}
                        onChange={(e) => setNewPopup({...newPopup, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-popup-heading" className="mb-2 block">Heading</Label>
                      <Input
                        id="edit-popup-heading"
                        type="text"
                        placeholder="e.g., Subscribe to our newsletter"
                        value={newPopup.heading}
                        onChange={(e) => setNewPopup({...newPopup, heading: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-popup-subheading" className="mb-2 block">Subheading</Label>
                      <Textarea
                        id="edit-popup-subheading"
                        placeholder="e.g., Get the latest updates and exclusive offers"
                        value={newPopup.subheading}
                        onChange={(e) => setNewPopup({...newPopup, subheading: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-popup-delay" className="mb-2 block">Delay (seconds)</Label>
                      <Input
                        id="edit-popup-delay"
                        type="number"
                        placeholder="5"
                        value={newPopup.delay}
                        onChange={(e) => setNewPopup({...newPopup, delay: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Buttons & Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Buttons & Actions</h3>
                    <div>
                      <Label htmlFor="edit-popup-cta-text" className="mb-2 block">CTA Button Text</Label>
                      <Input
                        id="edit-popup-cta-text"
                        type="text"
                        placeholder="Subscribe"
                        value={newPopup.ctaButtonText}
                        onChange={(e) => setNewPopup({...newPopup, ctaButtonText: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-popup-secondary-text" className="mb-2 block">Secondary Button Text</Label>
                      <Input
                        id="edit-popup-secondary-text"
                        type="text"
                        placeholder="No Thanks"
                        value={newPopup.secondaryButtonText}
                        onChange={(e) => setNewPopup({...newPopup, secondaryButtonText: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-popup-action" className="mb-2 block">Button Action</Label>
                      <Input
                        id="edit-popup-action"
                        type="text"
                        placeholder="e.g., /subscribe"
                        value={newPopup.buttonAction}
                        onChange={(e) => setNewPopup({...newPopup, buttonAction: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-popup-badge" className="mb-2 block">Badge Text</Label>
                      <Input
                        id="edit-popup-badge"
                        type="text"
                        placeholder="e.g., NEW"
                        value={newPopup.badgeText}
                        onChange={(e) => setNewPopup({...newPopup, badgeText: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-popup-badge-visible"
                        checked={newPopup.badgeVisible}
                        onChange={(e) => setNewPopup({...newPopup, badgeVisible: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="edit-popup-badge-visible">Show Badge</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-popup-close-icon"
                        checked={newPopup.showCloseIcon}
                        onChange={(e) => setNewPopup({...newPopup, showCloseIcon: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="edit-popup-close-icon">Show Close Icon</Label>
                    </div>
                    <div>
                      <Label htmlFor="edit-popup-status" className="mb-2 block">Status</Label>
                      <Select value={newPopup.status} onValueChange={(value: 'active' | 'inactive') => setNewPopup({...newPopup, status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Color Customization */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Color Customization</h3>
                    <div>
                      <Label htmlFor="edit-popup-bg-color" className="mb-2 block">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="edit-popup-bg-color"
                          type="color"
                          value={newPopup.backgroundColor}
                          onChange={(e) => setNewPopup({...newPopup, backgroundColor: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={newPopup.backgroundColor}
                          onChange={(e) => setNewPopup({...newPopup, backgroundColor: e.target.value})}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-popup-text-color" className="mb-2 block">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="edit-popup-text-color"
                          type="color"
                          value={newPopup.textColor}
                          onChange={(e) => setNewPopup({...newPopup, textColor: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={newPopup.textColor}
                          onChange={(e) => setNewPopup({...newPopup, textColor: e.target.value})}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-popup-button-color" className="mb-2 block">Button Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="edit-popup-button-color"
                          type="color"
                          value={newPopup.buttonColor}
                          onChange={(e) => setNewPopup({...newPopup, buttonColor: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={newPopup.buttonColor}
                          onChange={(e) => setNewPopup({...newPopup, buttonColor: e.target.value})}
                          placeholder="#007bff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-popup-button-text-color" className="mb-2 block">Button Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="edit-popup-button-text-color"
                          type="color"
                          value={newPopup.buttonTextColor}
                          onChange={(e) => setNewPopup({...newPopup, buttonTextColor: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={newPopup.buttonTextColor}
                          onChange={(e) => setNewPopup({...newPopup, buttonTextColor: e.target.value})}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-popup-border-color" className="mb-2 block">Border Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="edit-popup-border-color"
                          type="color"
                          value={newPopup.borderColor}
                          onChange={(e) => setNewPopup({...newPopup, borderColor: e.target.value})}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={newPopup.borderColor}
                          onChange={(e) => setNewPopup({...newPopup, borderColor: e.target.value})}
                          placeholder="#e0e0e0"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Live Preview</h3>
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 min-h-[400px] flex items-center justify-center">
                      <div 
                        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-sm w-full border"
                        style={{
                          backgroundColor: newPopup.backgroundColor,
                          color: newPopup.textColor,
                          borderColor: newPopup.borderColor
                        }}
                      >
                        {newPopup.badgeVisible && newPopup.badgeText && (
                          <div className="mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {newPopup.badgeText}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold" style={{ color: newPopup.textColor }}>
                            {newPopup.heading || 'Popup Heading'}
                          </h3>
                          {newPopup.showCloseIcon && (
                            <button className="text-gray-400 hover:text-gray-600">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <p className="text-sm mb-4 opacity-80" style={{ color: newPopup.textColor }}>
                          {newPopup.subheading || 'This is a sample subheading text for your popup.'}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            style={{
                              backgroundColor: newPopup.buttonColor,
                              color: newPopup.buttonTextColor,
                              borderColor: newPopup.buttonColor
                            }}
                          >
                            {newPopup.ctaButtonText || 'Subscribe'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            style={{
                              borderColor: newPopup.borderColor,
                              color: newPopup.textColor
                            }}
                          >
                            {newPopup.secondaryButtonText || 'No Thanks'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditPopup} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Popup'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete Popup</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete popup &quot;{selectedPopup?.name}&quot;? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeletePopup} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>    
    </TooltipProvider>
  )
}

// Export as dynamic component to prevent prerendering issues
export default dynamic(() => Promise.resolve(PopupsPage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  )
})