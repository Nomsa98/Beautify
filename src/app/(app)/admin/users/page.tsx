'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from '@/lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
    Plus, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    UserPlus, 
    Users, 
    Shield, 
    Phone, 
    Mail,
    Calendar,
    DollarSign,
    Key,
    Eye,
    EyeOff,
    MoreHorizontal,
    ArrowUpDown
} from 'lucide-react'

interface User {
    id: number
    name: string
    email: string
    phone: string
    specialization?: string
    hire_date?: string
    salary?: number
    commission_rate?: number
    is_active: boolean
    roles: Array<{
        id: number
        name: string
    }>
    tenant: {
        id: number
        name: string
    }
    created_at: string
    updated_at: string
}

interface Role {
    id: number
    name: string
}

interface UserFormData {
    name: string
    email: string
    password: string
    password_confirmation: string
    phone: string
    role: string
    specialization: string
    hire_date: string
    salary: string
    commission_rate: string
}

export default function UsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        role: '',
        specialization: '',
        hire_date: '',
        salary: '',
        commission_rate: ''
    })
    const [errors, setErrors] = useState<any>({})

    useEffect(() => {
        fetchUsers()
        fetchRoles()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users', {
                params: {
                    search: searchTerm || undefined,
                    role: selectedRole !== 'all' ? selectedRole : undefined
                }
            })
            setUsers(response.data.users)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const response = await axios.get('/api/users/roles')
            setRoles(response.data.roles)
        } catch (error) {
            console.error('Error fetching roles:', error)
        }
    }

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchUsers()
        }, 300)

        return () => clearTimeout(debounceTimer)
    }, [searchTerm, selectedRole])

    const handleAddUser = () => {
        setEditingUser(null)
        setFormData({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            phone: '',
            role: '',
            specialization: '',
            hire_date: new Date().toISOString().split('T')[0],
            salary: '',
            commission_rate: ''
        })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleEditUser = (user: User) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            phone: user.phone,
            role: user.roles[0]?.name || '',
            specialization: user.specialization || '',
            hire_date: user.hire_date ? user.hire_date.split('T')[0] : '',
            salary: user.salary?.toString() || '',
            commission_rate: user.commission_rate?.toString() || ''
        })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        try {
            const submitData = {
                ...formData,
                salary: formData.salary ? parseFloat(formData.salary) : null,
                commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : null
            }

            if (editingUser) {
                // Remove password fields if not changing password
                if (!formData.password) {
                    const { password, password_confirmation, ...dataWithoutPassword } = submitData
                    await axios.put(`/api/users/${editingUser.id}`, dataWithoutPassword)
                } else {
                    await axios.put(`/api/users/${editingUser.id}`, submitData)
                }
            } else {
                await axios.post('/api/users', submitData)
            }

            setIsModalOpen(false)
            fetchUsers()
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors)
            } else {
                console.error('Error saving user:', error)
            }
        }
    }

    const handleDeleteUser = async (userId: number) => {
        if (confirm('Are you sure you want to deactivate this staff member?')) {
            try {
                await axios.delete(`/api/users/${userId}`)
                fetchUsers()
            } catch (error) {
                console.error('Error deleting user:', error)
            }
        }
    }

    const handleResetPassword = async (userId: number) => {
        const newPassword = prompt('Enter new password:')
        const confirmPassword = prompt('Confirm new password:')
        
        if (newPassword && confirmPassword && newPassword === confirmPassword) {
            try {
                await axios.patch(`/api/users/${userId}/reset-password`, {
                    password: newPassword,
                    password_confirmation: confirmPassword
                })
                alert('Password reset successfully')
            } catch (error) {
                console.error('Error resetting password:', error)
                alert('Failed to reset password')
            }
        }
    }

    const formatPrice = (amount: number | null) => {
        if (!amount) return 'Not set'
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA')
    }

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName) {
            case 'Manager': return 'bg-blue-100 text-blue-800'
            case 'Staff': return 'bg-green-100 text-green-800'
            case 'Receptionist': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = selectedRole === 'all' || user.roles.some(role => role.name === selectedRole)
        return matchesSearch && matchesRole
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-1">Manage your salon staff and team members</p>
                </div>
                <Button onClick={handleAddUser} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff Member
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Managers</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter(u => u.roles.some(r => r.name === 'Manager')).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Staff</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter(u => u.roles.some(r => r.name === 'Staff')).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <Phone className="h-8 w-8 text-pink-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Receptionists</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter(u => u.roles.some(r => r.name === 'Receptionist')).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search staff members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger>
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.name}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Specialization</TableHead>
                                <TableHead>Hire Date</TableHead>
                                <TableHead>Salary</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>
                                        <Badge className={getRoleBadgeColor(user.roles[0]?.name || '')}>
                                            {user.roles[0]?.name || 'No Role'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.specialization || '-'}</TableCell>
                                    <TableCell>
                                        {user.hire_date ? formatDate(user.hire_date) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {user.salary ? formatPrice(user.salary) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.is_active ? "default" : "secondary"}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                                                    <Key className="mr-2 h-4 w-4" />
                                                    Reset Password
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Deactivate
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {filteredUsers.length === 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
                            <p className="text-gray-600 mb-4">Get started by adding your first staff member.</p>
                            <Button onClick={handleAddUser}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Staff Member
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add/Edit User Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser 
                                ? 'Update the staff member information below.'
                                : 'Fill in the details to add a new staff member to your salon.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter full name"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Enter email address"
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="password">
                                    Password {editingUser ? '(leave blank to keep current)' : '*'}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder="Enter password"
                                        required={!editingUser}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">
                                    Confirm Password {editingUser ? '(if changing)' : '*'}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.password_confirmation}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                                        placeholder="Confirm password"
                                        required={!editingUser || formData.password !== ''}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Enter phone number"
                                    required
                                />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone[0]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="role">Role *</Label>
                                <Select 
                                    value={formData.role} 
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role[0]}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input
                                    id="specialization"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                                    placeholder="e.g., Hair Stylist, Nail Technician"
                                />
                            </div>

                            <div>
                                <Label htmlFor="hire_date">Hire Date</Label>
                                <Input
                                    id="hire_date"
                                    type="date"
                                    value={formData.hire_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="salary">Monthly Salary (ZAR)</Label>
                                <Input
                                    id="salary"
                                    type="number"
                                    step="0.01"
                                    value={formData.salary}
                                    onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                                <Input
                                    id="commission_rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.commission_rate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: e.target.value }))}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                            >
                                {editingUser ? 'Update Staff Member' : 'Add Staff Member'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
