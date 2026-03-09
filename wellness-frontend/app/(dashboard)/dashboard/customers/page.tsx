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
  Camera,
  User,
  Mail,
  Phone,
  Shield,
  StickyNote,
  Briefcase,
  MapPin,
  Clock,
  Globe,
  Hash,
  HeartPulse,
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customers</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your customers and client relationships</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0">
                  <UserPlus className="w-4 h-4" />
                  Add Customer
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-emerald-500 shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all bg-white dark:bg-slate-950">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Total Customers</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{customers.length}</p>
                      <p className="text-sm text-emerald-600 flex items-center gap-1 mt-2 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        +15% from last month
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                      <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500 shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all bg-white dark:bg-slate-950">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Active Customers</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{customers.filter(c => c.status === 'active').length}</p>
                      <p className="text-sm text-blue-600 flex items-center gap-1 mt-2 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        {customers.length > 0
                          ? Math.round((customers.filter(c => c.status === 'active').length / customers.length) * 100)
                          : 0
                        }% of total
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                      <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500 shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all bg-white dark:bg-slate-950">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Customer Types</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{new Set(customers.map(c => c.customerType)).size}</p>
                      <p className="text-sm text-purple-600 flex items-center gap-1 mt-2 font-medium">
                        <Award className="w-3 h-3" />
                        Registered tiers
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                      <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-500 shadow-[0_2px_10px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all bg-white dark:bg-slate-950">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">₹{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}</p>
                      <p className="text-sm text-orange-600 flex items-center gap-1 mt-2 font-medium">
                        <Star className="w-3 h-3" />
                        Customer value
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-full">
                      <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            {/* Filters and Search */}
            <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search customers by name, email, phone, or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 focus:border-blue-500 transition-all shadow-[0_2px_4px_rgb(0,0,0,0.01)]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800">
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
                      <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800">
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
                      <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800">
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
                      size="icon"
                      className="h-11 w-11 shrink-0 bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>

                    {/* View Toggle */}
                    <div className="flex bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden p-1 gap-1 shadow-[0_2px_4px_rgb(0,0,0,0.01)] transition-all shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('grid')}
                            className="rounded-lg h-9 w-9"
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
                            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => setViewMode('table')}
                            className="rounded-lg h-9 w-9"
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
                  <Card className="border-none shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden rounded-xl">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
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
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-colors" onClick={() => handleEditCustomer(customer)}>
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View Details</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-lg transition-colors" onClick={() => handleEditCustomer(customer)}>
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit Customer</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-colors" onClick={() => handleDeleteCustomer(customer.id)}>
                                        <Trash2 className="w-4 h-4" />
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
                      <Card key={customer.id} className="flex flex-col h-full hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                        <CardContent className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar className="w-12 h-12 border-2 border-white dark:border-slate-900 shadow-sm">
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
                              <Button variant="ghost" size="sm" className="flex-1 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-lg transition-colors border-0" onClick={() => handleEditCustomer(customer)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="flex-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 rounded-lg transition-colors border-0" onClick={() => handleEditCustomer(customer)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="flex-1 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors border-0" onClick={() => handleDeleteCustomer(customer.id)}>
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
              <DialogContent className="max-w-[1000px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="px-8 py-6 border-b bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <UserPlus className="w-6 h-6 text-primary" />
                      </div>
                      Customer Procurement - Node Activation
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                      Initialize a new consumer node within the Wellness Fuel neural network.
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                  <div className="p-8">
                    {/* Avatar Selection */}
                    <div className="mb-10 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 py-10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
                      <div className="relative group">
                        <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800 shadow-2xl transition-all group-hover:scale-105 duration-300 ring-4 ring-primary/5">
                          <AvatarFallback className="text-3xl bg-primary/10 text-primary font-black">
                            {addForm.name ? addForm.name.split(' ').map(n => n[0]).join('') : <User className="w-10 h-10" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-x-0 bottom-0 flex justify-center translate-y-1/2">
                          <button className="p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 group/btn border-2 border-white dark:border-slate-900">
                            <Camera className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-10 text-center space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Visualizer</Label>
                        <p className="text-xs text-slate-500 font-medium">Upload a professional photo for consumer recognition</p>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <Button variant="outline" size="sm" className="h-9 px-6 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
                          <Upload className="w-3.5 h-3.5 mr-2" /> Assign Image
                        </Button>
                        <Button variant="ghost" size="sm" className="h-9 px-6 rounded-xl font-bold text-xs text-destructive hover:bg-red-50 dark:hover:bg-red-950/30">
                          Reset Node
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Basic Information */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div className="p-1.5 bg-primary/10 rounded-lg">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">Identity Metadata</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Legal Name</Label>
                            <Input
                              placeholder="e.g. Jane Cooper"
                              className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                              value={addForm.name}
                              onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Digital Mail (Email)</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                type="email"
                                placeholder="jane.c@example.com"
                                className="h-12 pl-10 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                value={addForm.email}
                                onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Connectivity (Phone)</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                placeholder="+1 (555) 000-0000"
                                className="h-12 pl-10 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                value={addForm.phone}
                                onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Membership Classification</Label>
                            <Select
                              value={addForm.customerType}
                              onValueChange={v => setAddForm(f => ({ ...f, customerType: v }))}
                            >
                              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm font-bold">
                                <SelectValue placeholder="Select tier" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="Regular" className="rounded-lg font-bold">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-400" /> Standard Access
                                  </div>
                                </SelectItem>
                                <SelectItem value="Premium" className="rounded-lg font-bold">
                                  <div className="flex items-center gap-2 text-blue-600">
                                    <div className="w-2 h-2 rounded-full bg-blue-600" /> Premium Wellness
                                  </div>
                                </SelectItem>
                                <SelectItem value="VIP" className="rounded-lg font-bold">
                                  <div className="flex items-center gap-2 text-amber-600">
                                    <Star className="w-3.5 h-3.5 fill-amber-600" /> VIP Elite Status
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </section>

                      {/* Profile & Demographics */}
                      <section className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                            <Activity className="w-5 h-5 text-emerald-600" />
                          </div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">Biometric Parameters</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Biological Age</Label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                  type="number"
                                  placeholder="25"
                                  className="h-12 pl-10 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                  value={addForm.age}
                                  onChange={e => setAddForm(f => ({ ...f, age: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender Node</Label>
                              <Select>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 font-bold">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="Male" className="rounded-lg font-bold">Male</SelectItem>
                                  <SelectItem value="Female" className="rounded-lg font-bold">Female</SelectItem>
                                  <SelectItem value="Other" className="rounded-lg font-bold">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Structural Role (Occupation)</Label>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                placeholder="e.g. Product Designer"
                                className="h-12 pl-10 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                value={addForm.occupation}
                                onChange={e => setAddForm(f => ({ ...f, occupation: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sanguine Group</Label>
                              <Select
                                value={addForm.bloodGroup}
                                onValueChange={v => setAddForm(f => ({ ...f, bloodGroup: v }))}
                              >
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 font-bold">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                    <SelectItem key={type} value={type} className="rounded-lg font-bold">{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Social State</Label>
                              <Select
                                value={addForm.maritalStatus}
                                onValueChange={v => setAddForm(f => ({ ...f, maritalStatus: v }))}
                              >
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 font-bold">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {['Single', 'Married', 'Divorced', 'Widowed'].map(s => (
                                    <SelectItem key={s} value={s} className="rounded-lg font-bold">{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Observational Highlights (Bio)</Label>
                            <Textarea
                              placeholder="Brief highlights about life preferences, allergies, or health goals..."
                              className="min-h-[100px] rounded-2xl border-slate-200 bg-white dark:bg-slate-900 shadow-inner focus:ring-primary/20 p-4 font-medium resize-none"
                              value={addForm.bio}
                              onChange={e => setAddForm(f => ({ ...f, bio: e.target.value }))}
                            />
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>

                <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 dark:bg-slate-900/50 gap-3 sticky bottom-0 z-10 backdrop-blur-sm">
                  <Button variant="outline" className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-800" onClick={() => setIsAddModalOpen(false)}>
                    Abort Onboarding
                  </Button>
                  <Button
                    onClick={handleAddCustomer}
                    disabled={modalLoading}
                    className="h-11 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Finalize Procurement'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Customer Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="max-w-[1000px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="px-8 py-6 border-b bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      Customer Intelligence - 360° Matrix
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                      Calibrate identity parameters and monitor wellness transformation trajectory.
                    </DialogDescription>
                  </div>
                </DialogHeader>

                {selectedCustomer && (
                  <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="p-8">
                      {/* Avatar & Key Metrics Section */}
                      <div className="mb-8 flex flex-col md:flex-row items-center gap-8 bg-slate-50/50 dark:bg-slate-900/30 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner">
                        <div className="relative group">
                          <Avatar className="w-28 h-28 border-4 border-white dark:border-slate-800 shadow-2xl transition-all ring-4 ring-primary/5">
                            <AvatarImage src={selectedCustomer?.imageUrl} className="object-cover" />
                            <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">
                              {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-x-0 bottom-0 flex justify-center translate-y-1/2 md:translate-y-0 md:translate-x-1/2 md:right-0 md:left-auto">
                            <button className="p-2.5 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 border-2 border-white dark:border-slate-900">
                              <Camera className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-2">
                          <h3 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                            {selectedCustomer.firstName} {selectedCustomer.lastName}
                          </h3>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{editForm.customerType || 'Regular'} Node</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                              <Calendar className="w-4 h-4" />
                              Acquired {new Date(selectedCustomer.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                            <Button variant="outline" size="sm" className="h-9 px-6 rounded-xl font-bold text-xs bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
                              <Upload className="w-3.5 h-3.5 mr-2" /> Shift Identity Visual
                            </Button>
                            <Button variant="ghost" size="sm" className="h-9 px-6 rounded-xl font-bold text-xs text-destructive hover:bg-red-50 dark:hover:bg-red-950/30">
                              Nullify Photo
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 px-8 py-2 border-l border-slate-200 dark:border-slate-800 hidden lg:grid">
                          <div className="text-center">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Redemption Count</p>
                            <div className="flex items-center justify-center gap-2">
                              <ShoppingBag className="w-5 h-5 text-emerald-500" />
                              <p className="text-2xl font-black text-slate-900 dark:text-slate-50">{(selectedCustomer as any).totalOrders || 0}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Lifetime Value</p>
                            <div className="flex items-center justify-center gap-2">
                              <CreditCard className="w-5 h-5 text-primary" />
                              <p className="text-2xl font-black text-slate-900 dark:text-slate-50">₹{((selectedCustomer as any).totalSpent || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 h-14 p-1.5 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl mb-8 border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
                          <TabsTrigger value="details" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-xl transition-all font-black uppercase tracking-widest text-[10px]">
                            <User className="w-4 h-4 mr-2" /> Mapping
                          </TabsTrigger>
                          <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-xl transition-all font-black uppercase tracking-widest text-[10px]">
                            <ShoppingBag className="w-4 h-4 mr-2" /> Logs
                          </TabsTrigger>
                          <TabsTrigger value="profile" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-xl transition-all font-black uppercase tracking-widest text-[10px]">
                            <Activity className="w-4 h-4 mr-2" /> Wellness
                          </TabsTrigger>
                          <TabsTrigger value="notes" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-xl transition-all font-black uppercase tracking-widest text-[10px]">
                            <StickyNote className="w-4 h-4 mr-2" /> Notes
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                          {/* Account Identity */}
                          <section className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                              <div className="p-1.5 bg-primary/10 rounded-lg">
                                <Shield className="w-5 h-5 text-primary" />
                              </div>
                              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">Identity Calibrator</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Entity Name</Label>
                                <Input
                                  className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                  value={editForm.name}
                                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Communication Uplink (Email)</Label>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input
                                    type="email"
                                    className="h-12 pl-10 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                    value={editForm.email}
                                    onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Link (Phone)</Label>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input
                                    className="h-12 pl-10 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                    value={editForm.phone}
                                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Membership Stratum</Label>
                                <Select
                                  value={editForm.customerType}
                                  onValueChange={v => setEditForm(f => ({ ...f, customerType: v }))}
                                >
                                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm font-bold">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                    <SelectItem value="Regular" className="rounded-lg font-bold">Standard Access</SelectItem>
                                    <SelectItem value="Premium" className="rounded-lg font-bold">Premium Wellness</SelectItem>
                                    <SelectItem value="VIP" className="rounded-lg font-bold">VIP Elite Status</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </section>

                          {/* Demographic Info */}
                          <section className="space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                              <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                <Globe className="w-5 h-5 text-emerald-600" />
                              </div>
                              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">Biological Profile</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Classification</Label>
                                <div className="relative">
                                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input
                                    className="h-12 pl-10 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                    value={editForm.occupation}
                                    onChange={e => setEditForm(f => ({ ...f, occupation: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Age</Label>
                                  <Input
                                    type="number"
                                    className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                    value={editForm.age}
                                    onChange={e => setEditForm(f => ({ ...f, age: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sanguine Type</Label>
                                  <Select
                                    value={editForm.bloodGroup}
                                    onValueChange={v => setEditForm(f => ({ ...f, bloodGroup: v }))}
                                  >
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm font-bold">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                                        <SelectItem key={t} value={t} className="rounded-lg font-bold">{t}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Social Synchronicity</Label>
                                <Select
                                  value={editForm.maritalStatus}
                                  onValueChange={v => setEditForm(f => ({ ...f, maritalStatus: v }))}
                                >
                                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm font-bold">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                    {['Single', 'Married', 'Divorced', 'Widowed'].map(s => (
                                      <SelectItem key={s} value={s} className="rounded-lg font-bold">{s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Geospatial Coordinates</Label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input
                                    className="h-12 pl-10 rounded-xl border-slate-200 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary/20 font-bold"
                                    defaultValue={selectedCustomer.location || 'Pending Validation'}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Observational Intelligence (Bio)</Label>
                              <Textarea
                                className="min-h-[100px] rounded-2xl border-slate-200 bg-white dark:bg-slate-900 shadow-inner focus:ring-primary/20 p-4 font-medium resize-none shadow-sm"
                                value={editForm.bio}
                                onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                              />
                            </div>
                          </section>
                        </TabsContent>

                        <TabsContent value="orders" className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-2xl mb-6 transform -rotate-3 transition-transform hover:rotate-0 ring-4 ring-primary/5">
                              <ShoppingBag className="w-12 h-12 text-primary" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-2 uppercase tracking-tighter">
                              Transaction Intelligence
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm px-4 text-xs font-medium leading-relaxed">
                              Unified tracking of purchase velocity, lifetime value analytics, and supply chain interactions.
                            </p>
                            <Button variant="outline" className="mt-8 px-10 rounded-xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] shadow-sm">
                              Interrogate Logs
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="profile" className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all rounded-3xl bg-white dark:bg-slate-900">
                              <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                  <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-2xl">
                                    <HeartPulse className="w-6 h-6 text-red-500" />
                                  </div>
                                  <div>
                                    <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest text-[10px] mb-1">Wellness Objectives</h4>
                                    <p className="text-xs text-slate-500 font-bold">Standard Optimization Target</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all rounded-3xl bg-white dark:bg-slate-900">
                              <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl">
                                    <Activity className="w-6 h-6 text-blue-500" />
                                  </div>
                                  <div>
                                    <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest text-[10px] mb-1">Metabolic Output</h4>
                                    <p className="text-xs text-slate-500 font-bold">Moderate Activity Matrix</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          <section className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner">
                            <h4 className="font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-[10px] text-slate-400">
                              <Shield className="w-3.5 h-3.5" />
                              Psychographic Attributes
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              {['Vegetarian-Focused', 'Gluten Sensitivity', 'Early Market Adopter', 'High Loyalty Index'].map(tag => (
                                <Badge key={tag} variant="secondary" className="px-5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none font-bold text-[10px] shadow-sm transition-all hover:scale-105 active:scale-95">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </section>
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                                <StickyNote className="w-5 h-5 text-amber-500" />
                              </div>
                              <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Administrative Intel</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Tactical Notes</p>
                              </div>
                            </div>
                            <Textarea
                              placeholder="Document internal feedback, support interactions, or membership adjustments. Precise documentation is critical..."
                              className="min-h-[250px] rounded-3xl border-slate-200 dark:border-slate-800 p-8 focus:ring-primary/20 bg-slate-50/50 dark:bg-slate-900/50 shadow-inner resize-none leading-relaxed font-medium"
                            />
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl w-fit">
                              <Shield className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Confidential: Clearance Level 2 Access Required</span>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                )}
                <DialogFooter className="px-8 py-6 border-t bg-slate-50/50 dark:bg-slate-900/50 gap-3 sticky bottom-0 z-10 backdrop-blur-sm">
                  <Button variant="outline" className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-800" onClick={() => setIsEditModalOpen(false)}>
                    Abort Interaction
                  </Button>
                  <Button
                    onClick={handleUpdateCustomer}
                    disabled={modalLoading}
                    className="h-11 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {modalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Calibrating...
                      </>
                    ) : (
                      'Commit Matrix Updates'
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
