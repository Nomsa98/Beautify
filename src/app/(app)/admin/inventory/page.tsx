'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Building2,
  Edit,
  Trash2,
  BarChart3,
  DollarSign
} from 'lucide-react'
import axios from '@/lib/axios'

interface Product {
  id: number
  name: string
  sku: string
  category: string
  brand: string
  cost_price: number
  selling_price: number
  current_stock: number
  minimum_stock: number
  maximum_stock: number
  unit: string
  supplier: { id: number; name: string } | null
  stock_status: string
  is_active: boolean
  expiry_date: string | null
  location: string | null
  notes: string | null
}

interface Supplier {
  id: number
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  is_active: boolean
  products_count: number
}

interface StockMovement {
  id: number
  type: string
  quantity: number
  reason: string
  reference: string | null
  notes: string | null
  created_at: string
  product: { name: string; sku: string }
  user: { name: string }
}

interface InventoryStats {
  total_products: number
  low_stock_products: number
  out_of_stock_products: number
  total_suppliers: number
  total_inventory_value: number
  recent_movements: StockMovement[]
}

export default function Inventory() {
  const { user } = useAuth({ middleware: 'auth' })
  const [activeTab, setActiveTab] = useState('products')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [categories, setCategories] = useState<string[]>([])
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockStatusFilter, setStockStatusFilter] = useState('')
  
  // Modals
  const [showProductModal, setShowProductModal] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const canManage = user?.permissions?.includes('manage inventory') || 
                   user?.permissions?.includes('manage salon') ||
                   user?.roles?.some((role: any) => ['owner', 'manager'].includes(role.name))

  useEffect(() => {
    if (canManage) {
      fetchStats()
      fetchCategories()
    }
  }, [canManage])

  useEffect(() => {
    if (canManage) {
      switch (activeTab) {
        case 'products':
          fetchProducts()
          break
        case 'suppliers':
          fetchSuppliers()
          break
        case 'movements':
          fetchStockMovements()
          break
      }
    }
  }, [activeTab, searchTerm, categoryFilter, stockStatusFilter, canManage])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/inventory/statistics')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching inventory stats:', error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (categoryFilter) params.append('category', categoryFilter)
      if (stockStatusFilter) params.append('stock_status', stockStatusFilter)
      
      const response = await axios.get(`/api/inventory/products?${params}`)
      setProducts(response.data.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await axios.get(`/api/inventory/suppliers?${params}`)
      setSuppliers(response.data.data || [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStockMovements = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/inventory/stock-movements')
      setStockMovements(response.data.data || [])
    } catch (error) {
      console.error('Error fetching stock movements:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/inventory/categories')
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>
      case 'low_stock':
        return <Badge variant="secondary">Low Stock</Badge>
      case 'overstocked':
        return <Badge variant="outline">Overstocked</Badge>
      default:
        return <Badge variant="default">Normal</Badge>
    }
  }

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case 'in':
        return <Badge variant="default" className="bg-green-100 text-green-800">Stock In</Badge>
      case 'out':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Stock Out</Badge>
      case 'adjustment':
        return <Badge variant="outline">Adjustment</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  if (!canManage) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">You don't have permission to manage inventory.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-gray-600">Track products, supplies, and inventory levels</p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.total_products}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Low Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.low_stock_products}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Out of Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.out_of_stock_products}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.total_suppliers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Inventory Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  R{stats.total_inventory_value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="movements">Stock Movements</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              {activeTab === 'products' && (
                <Button 
                  onClick={() => {
                    setEditingProduct(null)
                    setShowProductModal(true)
                  }}
                  className="bg-gradient-to-r from-pink-600 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              )}
              {activeTab === 'suppliers' && (
                <Button 
                  onClick={() => {
                    setEditingSupplier(null)
                    setShowSupplierModal(true)
                  }}
                  className="bg-gradient-to-r from-pink-600 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {activeTab === 'products' && (
                  <>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="stockStatus">Stock Status</Label>
                      <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Status</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="low_stock">Low Stock</SelectItem>
                          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your inventory products</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading products...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.brand && (
                                <div className="text-sm text-gray-500">{product.brand}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                          <TableCell>{product.category || '-'}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{product.current_stock} {product.unit}</div>
                              <div className="text-gray-500">Min: {product.minimum_stock}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStockStatusBadge(product.stock_status)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>R{product.selling_price}</div>
                              <div className="text-gray-500">Cost: R{product.cost_price}</div>
                            </div>
                          </TableCell>
                          <TableCell>{product.supplier?.name || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedProduct(product)
                                  setShowStockModal(true)
                                }}
                              >
                                <BarChart3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingProduct(product)
                                  setShowProductModal(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suppliers</CardTitle>
                <CardDescription>Manage your suppliers</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading suppliers...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell className="font-medium">{supplier.name}</TableCell>
                          <TableCell>{supplier.contact_person || '-'}</TableCell>
                          <TableCell>{supplier.email || '-'}</TableCell>
                          <TableCell>{supplier.phone || '-'}</TableCell>
                          <TableCell>{supplier.products_count}</TableCell>
                          <TableCell>
                            <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                              {supplier.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingSupplier(supplier)
                                setShowSupplierModal(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Movements Tab */}
          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Movements</CardTitle>
                <CardDescription>Track all inventory movements</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading stock movements...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>User</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {new Date(movement.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{movement.product.name}</div>
                              <div className="text-sm text-gray-500">{movement.product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getMovementTypeBadge(movement.type)}</TableCell>
                          <TableCell className="font-mono">{movement.quantity}</TableCell>
                          <TableCell>{movement.reason}</TableCell>
                          <TableCell>{movement.user.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
