'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Users,
  Search,
  Eye,
  ShoppingBag,
  Star,
  UserPlus,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  TrendingUp,
  CheckCircle,
  Award,
  Calendar,
  CreditCard,
  Heart,
  Activity,
  Grid3X3,
  List,
  Upload,
  Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import Loader from '@/components/common/dashboard/Loader'
import Error from '@/components/common/dashboard/Error'
import NoData from '@/components/common/dashboard/NoData'
import {
  fetchUsersData,
  setFilters,
  setPagination,
  selectUsersData,
  selectUsersLoading,
  selectUsersError,
  selectUsersPagination,
  updateUser,
  deleteUser,
  User as UserType
} from '@/lib/redux/features/userSlice'

// Customer type definition
type Customer = {
  id: number
  name: string
  email: string
  phone: string
  imageUrl: string
  status: string
  customerType: string
  joinDate: string
  location: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  languages: string[]
  tags: string[]
  bio: string
  occupation: string
  bloodGroup: string
  age: number
  maritalStatus: string
}

const CustomersPage = () => {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectUsersData)
  const isLoading = useAppSelector(selectUsersLoading)
  const error = useAppSelector(selectUsersError)
  const pagination = useAppSelector(selectUsersPagination)

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedCustomer, setSelectedCustomer] = useState<UserType | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)

  // Add form state for Add Customer Modal
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    imageUrl: '',
    customerType: '',
    occupation: '',
    age: '',
    bloodGroup: '',
    maritalStatus: '',
    bio: ''
  })

  // Add form state for Edit Customer Modal
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    imageUrl: '',
    customerType: '',
    occupation: '',
    age: '',
    bloodGroup: '',
    maritalStatus: '',
    bio: ''
  })

  // Fetch customers data on component mount
  useEffect(() => {
    dispatch(setFilters({ role: 'Customer' }))
    dispatch(fetchUsersData())
  }, [dispatch])

  // When selectedCustomer changes, update editForm
  useEffect(() => {
    if (selectedCustomer) {
      setEditForm({
        name: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        email: selectedCustomer.email || '',
        phone: selectedCustomer.phone || '',
        imageUrl: selectedCustomer.imageUrl || '',
        customerType: selectedCustomer.customerType || 'Regular',
        occupation: selectedCustomer.occupation || '',
        age: selectedCustomer.age?.toString() || '',
        bloodGroup: selectedCustomer.bloodGroup || '',
        maritalStatus: selectedCustomer.maritalStatus || '',
        bio: selectedCustomer.bio || ''
      })
    }
  }, [selectedCustomer])

  // Convert users to customers format and filter
  const customers: Customer[] = users.filter(user => user.role === 'Customer').map(user => ({
    id: parseInt(user._id?.slice(-8), 16) || Math.random(),
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone,
    imageUrl: '',
    status: user.status?.toLowerCase() || 'inactive',
    customerType: user.customerType || 'Regular',
    joinDate: user.createdAt,
    location: user.address || 'Not specified',
    totalOrders: 0, // Default since not in API
    totalSpent: 0, // Default since not in API
    lastOrder: user.createdAt, // Default to join date
    languages: user.language || ['English'],
    tags: user.customerType ? [user.customerType] : ['Regular'],
    bio: user.bio || '',
    occupation: user.occupation || '',
    bloodGroup: user.bloodGroup || '',
    age: user.age || 0,
    maritalStatus: user.maritalStatus || ''
  }))

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.customerType.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
      const matchesType = typeFilter === 'all' || customer.customerType === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof Customer]
      let bValue = b[sortBy as keyof Customer]

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const totalPages = Math.ceil(filteredCustomers.length / pagination.limit)
  const startIndex = (pagination.page - 1) * pagination.limit
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + pagination.limit)


  // Handle pagination changes
  const handlePageChange = (newPage: number) => {
    dispatch(setPagination({ page: newPage }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'pending': return 'outline'
      default: return 'outline'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'premium': return 'default'
      case 'regular': return 'secondary'
      case 'vip': return 'outline'
      default: return 'secondary'
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    const user = users.find(u => u.role === 'Customer' && `${u.firstName} ${u.lastName}` === customer.name)
    if (user) {
      setSelectedCustomer(user)
      setIsEditModalOpen(true)
    }
  }

  const handleDeleteCustomer = async (customerId: number) => {
    setModalLoading(true)
    try {
      const user = users.find(u => u.role === 'Customer' && parseInt(u._id?.slice(-8), 16) === customerId)
      if (user) {
        await dispatch(deleteUser(user._id))
        dispatch(fetchUsersData())
      }
    } finally {
      setModalLoading(false)
    }
  }

  const handleAddCustomer = async () => {
    setModalLoading(true)
    try {
      // TODO: Implement actual add logic
      setIsAddModalOpen(false)
      setAddForm({
        name: '',
        email: '',
        phone: '',
        imageUrl: '',
        customerType: '',
        occupation: '',
        age: '',
        bloodGroup: '',
        maritalStatus: '',
        bio: ''
      })
      dispatch(fetchUsersData())
    } finally {
      setModalLoading(false)
    }
  }

  const handleUpdateCustomer = async () => {
    setModalLoading(true)
    try {
      if (selectedCustomer) {
        // TODO: Implement actual update logic
        await dispatch(updateUser(selectedCustomer._id, {
          ...selectedCustomer,
          firstName: editForm.name.split(' ')[0] || '',
          lastName: editForm.name.split(' ').slice(1).join(' ') || '',
          email: editForm.email,
          phone: editForm.phone,
          imageUrl: editForm.imageUrl,
          customerType: editForm.customerType,
          occupation: editForm.occupation,
          age: Number(editForm.age),
          bloodGroup: editForm.bloodGroup as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
          maritalStatus: editForm.maritalStatus as "Single" | "Married" | "Divorced" | "Widowed",
          bio: editForm.bio
        }))
        setIsEditModalOpen(false)
        dispatch(fetchUsersData())
      }
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {error ? (
          <Error title="Error loading customers" message={error} />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Customers</h1>
                <p className="text-muted-foreground">Manage your customers and client relationships</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Customer
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                      <p className="text-2xl font-bold text-foreground">{customers.length}</p>
                      <p className="text-sm text-emerald-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +15% from last month
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Customers</p>
                      <p className="text-2xl font-bold text-foreground">{customers.filter(c => c.status === 'active').length}</p>
                      <p className="text-sm text-blue-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {customers.length > 0
                          ? Math.round((customers.filter(c => c.status === 'active').length / customers.length) * 100)
                          : 0
                        }% of total
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Customer Types</p>
                      <p className="text-2xl font-bold text-foreground">{new Set(customers.map(c => c.customerType)).size}</p>
                      <p className="text-sm text-purple-600 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Registered tiers
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-foreground">₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}</p>
                      <p className="text-sm text-orange-600 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Customer value
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-orange-500" />
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
                        placeholder="Search customers by name, email, phone, or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="customerType">Type</SelectItem>
                        <SelectItem value="totalOrders">Orders</SelectItem>
                        <SelectItem value="totalSpent">Spent</SelectItem>
                        <SelectItem value="joinDate">Join Date</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>

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
                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('table')}
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
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            {isLoading ? (
              <Loader variant="skeleton" message="Loading customers..." />
            ) : filteredCustomers.length === 0 ? (
              <NoData 
                message="No customers found"
                description="Get started by adding your first customer"
                icon={<Users className="w-full h-full text-muted-foreground/60" />}
                action={{
                  label: "Add Customer",
                  onClick: () => setIsAddModalOpen(true)
                }}
                size="lg"
              />
            ) : (
          <>
            {viewMode === 'table' && (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Last Order</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={customer.imageUrl} />
                                <AvatarFallback>
                                  {customer.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-sm text-muted-foreground">{customer.location}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getTypeColor(customer.customerType)}>
                              {customer.customerType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(customer.status)}>
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                              {customer.totalOrders}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              ₹{customer.totalSpent.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {new Date(customer.lastOrder).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Customer</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete Customer</TooltipContent>
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

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCustomers.map((customer) => (
                  <Card key={customer.id} className="flex flex-col h-full">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={customer.imageUrl} />
                          <AvatarFallback>
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">{customer.location}</p>
                        </div>
                        <Badge variant={getStatusColor(customer.status)} className="text-xs">
                          {customer.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Type:</span>
                          <Badge variant={getTypeColor(customer.customerType)} className="text-xs">
                            {customer.customerType}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Orders:</span>
                          <span className="text-sm font-medium">{customer.totalOrders}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total Spent:</span>
                          <span className="text-sm font-medium">₹{customer.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Join Date:</span>
                          <span className="text-sm font-medium">{new Date(customer.joinDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditCustomer(customer)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditCustomer(customer)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDeleteCustomer(customer.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && filteredCustomers.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + pagination.limit, filteredCustomers.length)} of {filteredCustomers.length} customers
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(pagination.page - 1, 1))}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(pagination.page + 1, totalPages))}
                    disabled={pagination.page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Add Customer Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Register a new customer account
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="addName">Full Name</Label>
                    <Input
                      id="addName"
                      placeholder="Customer Name"
                      value={addForm.name}
                      onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addEmail">Email</Label>
                    <Input
                      id="addEmail"
                      type="email"
                      placeholder="customer@email.com"
                      value={addForm.email}
                      onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addPhone">Phone</Label>
                    <Input
                      id="addPhone"
                      placeholder="+91 98765 43210"
                      value={addForm.phone}
                      onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addType">Customer Type</Label>
                    <Select
                      value={addForm.customerType}
                      onValueChange={v => setAddForm(f => ({ ...f, customerType: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="addOccupation">Occupation</Label>
                    <Input
                      id="addOccupation"
                      placeholder="Software Engineer"
                      value={addForm.occupation}
                      onChange={e => setAddForm(f => ({ ...f, occupation: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addAge">Age</Label>
                    <Input
                      id="addAge"
                      type="number"
                      placeholder="28"
                      value={addForm.age}
                      onChange={e => setAddForm(f => ({ ...f, age: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addBloodGroup">Blood Group</Label>
                    <Select
                      value={addForm.bloodGroup}
                      onValueChange={v => setAddForm(f => ({ ...f, bloodGroup: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="addMaritalStatus">Marital Status</Label>
                    <Select
                      value={addForm.maritalStatus}
                      onValueChange={v => setAddForm(f => ({ ...f, maritalStatus: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="addBio">Bio</Label>
                    <Textarea
                      id="addBio"
                      placeholder="Tell us about yourself"
                      rows={3}
                      value={addForm.bio}
                      onChange={e => setAddForm(f => ({ ...f, bio: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCustomer} disabled={modalLoading}>
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Customer'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add Customer Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Register a new customer account
                  </DialogDescription>
                </DialogHeader>
                {/* Avatar Section - Top Center */}
                <div className="flex flex-col items-center space-y-4 py-4">
                  <Label className="text-lg font-medium">Profile Picture</Label>
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={selectedCustomer?.imageUrl || '/placeholder-customer.svg'} />
                    <AvatarFallback className="text-xl">CST</AvatarFallback>
                  </Avatar>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="addName">Full Name</Label>
                    <Input id="addName" placeholder="Customer Name" />
                  </div>
                  <div>
                    <Label htmlFor="addEmail">Email</Label>
                    <Input id="addEmail" type="email" placeholder="customer@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="addPhone">Phone</Label>
                    <Input id="addPhone" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <Label htmlFor="addCustomerType">Customer Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="addOccupation">Occupation</Label>
                    <Input id="addOccupation" placeholder="Occupation" />
                  </div>
                  <div>
                    <Label htmlFor="addAge">Age</Label>
                    <Input id="addAge" type="number" placeholder="Age" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleAddCustomer()} disabled={modalLoading}>
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Customer'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Customer Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Customer Details</DialogTitle>
                  <DialogDescription>
                    View and edit customer information
                  </DialogDescription>
                </DialogHeader>
                {selectedCustomer && (
                  <>
                    {/* Avatar Section - Top Center */}
                    <div className="flex flex-col items-center space-y-4 py-4">
                      <Label className="text-lg font-medium">Profile Picture</Label>
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={selectedCustomer?.imageUrl || '/placeholder-customer.svg'} />
                        <AvatarFallback className="text-xl">
                          {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                        <Button variant="outline" size="sm">
                          <Camera className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="orders">Orders</TabsTrigger>
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editName">Full Name</Label>
                          <Input
                            id="editName"
                            value={editForm.name}
                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editEmail">Email</Label>
                          <Input
                            id="editEmail"
                            type="email"
                            value={editForm.email}
                            onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editPhone">Phone</Label>
                          <Input
                            id="editPhone"
                            value={editForm.phone}
                            onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editType">Customer Type</Label>
                          <Select
                            value={editForm.customerType}
                            onValueChange={v => setEditForm(f => ({ ...f, customerType: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Regular">Regular</SelectItem>
                              <SelectItem value="Premium">Premium</SelectItem>
                              <SelectItem value="VIP">VIP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="editOccupation">Occupation</Label>
                          <Input
                            id="editOccupation"
                            value={editForm.occupation}
                            onChange={e => setEditForm(f => ({ ...f, occupation: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editAge">Age</Label>
                          <Input
                            id="editAge"
                            type="number"
                            value={editForm.age}
                            onChange={e => setEditForm(f => ({ ...f, age: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="editBloodGroup">Blood Group</Label>
                          <Select
                            value={editForm.bloodGroup}
                            onValueChange={v => setEditForm(f => ({ ...f, bloodGroup: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="editMaritalStatus">Marital Status</Label>
                          <Select
                            value={editForm.maritalStatus}
                            onValueChange={v => setEditForm(f => ({ ...f, maritalStatus: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Single">Single</SelectItem>
                              <SelectItem value="Married">Married</SelectItem>
                              <SelectItem value="Divorced">Divorced</SelectItem>
                              <SelectItem value="Widowed">Widowed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="editBio">Bio</Label>
                        <Textarea
                          id="editBio"
                          value={editForm.bio}
                          onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                          rows={3}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="orders" className="space-y-4">
                      <div className="text-center py-8">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Order History</h3>
                        <p className="text-muted-foreground">Customer&apos;s order history will be displayed here</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="profile" className="space-y-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-muted rounded-lg">
                            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                            <p className="text-sm font-medium">Health Interests</p>
                            <p className="text-xs text-muted-foreground">Wellness products</p>
                          </div>
                          <div className="text-center p-4 bg-muted rounded-lg">
                            <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm font-medium">Activity Level</p>
                            <p className="text-xs text-muted-foreground">Moderate</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="space-y-4">
                      <div>
                        <Label htmlFor="editNotes">Notes</Label>
                        <Textarea id="editNotes" placeholder="Add notes about this customer" />
                      </div>
                    </TabsContent>
                  </Tabs>
                  </>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateCustomer} disabled={modalLoading}>
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Customer'
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

export default dynamic(() => Promise.resolve(CustomersPage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  )
})
