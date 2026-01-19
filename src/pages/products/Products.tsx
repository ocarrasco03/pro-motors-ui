import React, { useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: number;
  partNumber: string;
  brand: string;
  name: string;
  line: string;
  stock: number;
  price: number;
  cost?: number;
  status: 'active' | 'inactive' | 'low_stock';
}

const mockProducts: Product[] = [
  { id: 1, partNumber: 'FO-5W30-1L', brand: 'Mobil', name: 'Aceite de motor 5W-30', line: 'Lubricantes', stock: 45, price: 289.99, cost: 185.50, status: 'active' },
  { id: 2, partNumber: 'PF-BRM-001', brand: 'Brembo', name: 'Pastillas de freno delanteras', line: 'Frenos', stock: 12, price: 1250.00, cost: 890.00, status: 'active' },
  { id: 3, partNumber: 'BA-12V-60A', brand: 'LTH', name: 'Batería 12V 60Ah', line: 'Eléctrico', stock: 3, price: 2150.00, cost: 1650.00, status: 'low_stock' },
  { id: 4, partNumber: 'AM-K&N-001', brand: "K&N", name: 'Filtro de aire alto flujo', line: 'Filtros', stock: 15, price: 980.00, cost: 720.00, status: 'active' },
  { id: 5, partNumber: 'SU-TOY-001', brand: 'KYB', name: 'Amortiguador trasero', line: 'Suspensión', stock: 6, price: 1450.00, cost: 1050.00, status: 'low_stock' },
  { id: 6, partNumber: 'CL-NGK-001', brand: 'NGK', name: 'Bujía de iridio', line: 'Ignición', stock: 100, price: 189.00, cost: 120.00, status: 'active' },
  { id: 7, partNumber: 'RA-WAL-001', brand: 'Walker', name: 'Radiador de aluminio', line: 'Enfriamiento', stock: 0, price: 3200.00, cost: 2400.00, status: 'inactive' },
  { id: 8, partNumber: 'EM-AC-001', brand: 'ACDelco', name: 'Bomba de agua', line: 'Motor', stock: 22, price: 850.00, cost: 580.00, status: 'active' },
];

const Products: React.FC = () => {
//   const { canViewCosts, hasPermission } = useAuth();
//   const canEdit = hasPermission('edit_products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const lines = [...new Set(mockProducts.map((p) => p.line))];

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLine = !selectedLine || product.line === selectedLine;
    return matchesSearch && matchesLine;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge-success px-2 py-1 rounded-full text-xs font-medium">Activo</span>;
      case 'low_stock':
        return <span className="badge-warning px-2 py-1 rounded-full text-xs font-medium">Stock Bajo</span>;
      case 'inactive':
        return <span className="badge-danger px-2 py-1 rounded-full text-xs font-medium">Inactivo</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu catálogo de autopartes
          </p>
        </div>
        {/* {canEdit && ( */}
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        {/* )} */}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="h-11 rounded-xl border-2 border-input bg-background px-4 text-sm min-w-[180px]"
          >
            <option value="">Todas las líneas</option>
            {lines.map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Más filtros
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: '100ms' }}>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-sm">Producto</th>
                <th className="text-left p-4 font-medium text-sm">Línea</th>
                <th className="text-center p-4 font-medium text-sm">Stock</th>
                <th className="text-center p-4 font-medium text-sm">Estado</th>
                {/* {canViewCosts && ( */}
                  <th className="text-right p-4 font-medium text-sm">Costo</th>
                {/* )} */}
                <th className="text-right p-4 font-medium text-sm">Precio</th>
                <th className="text-center p-4 font-medium text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0 table-row-hover"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                            {product.partNumber}
                          </span>
                          <span className="text-xs text-muted-foreground">{product.brand}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{product.line}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={cn(
                        'font-medium',
                        product.stock === 0 && 'text-destructive',
                        product.stock > 0 && product.stock <= 10 && 'text-warning',
                        product.stock > 10 && 'text-success'
                      )}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-center">{getStatusBadge(product.status)}</td>
                  {/* {canViewCosts && ( */}
                    <td className="p-4 text-right text-cost">{formatPrice(product.cost!)}</td>
                  {/* )} */}
                  <td className="p-4 text-right text-money font-semibold">{formatPrice(product.price)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {/* {canEdit && ( */}
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      {/* )} */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-border">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                        {product.partNumber}
                      </span>
                      <span className="text-xs text-muted-foreground">{product.brand}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {getStatusBadge(product.status)}
                      <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  {openMenuId === product.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-40 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-20 animate-fade-in">
                        <button className="flex items-center gap-2 w-full p-3 hover:bg-muted text-sm">
                          <Eye className="w-4 h-4" /> Ver detalles
                        </button>
                        {/* {canEdit && ( */}
                          <>
                            <button className="flex items-center gap-2 w-full p-3 hover:bg-muted text-sm">
                              <Edit className="w-4 h-4" /> Editar
                            </button>
                            <button className="flex items-center gap-2 w-full p-3 hover:bg-muted text-sm text-destructive">
                              <Trash2 className="w-4 h-4" /> Eliminar
                            </button>
                          </>
                        {/* )} */}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                {/* {canViewCosts && ( */}
                  <div>
                    <span className="text-xs text-muted-foreground">Costo</span>
                    <p className="text-cost">{formatPrice(product.cost!)}</p>
                  </div>
                {/* )} */}
                {/* <div className={cn(!canViewCosts && 'ml-auto')}> */}
                <div className="ml-auto">
                  <span className="text-xs text-muted-foreground">Precio</span>
                  <p className="text-money text-lg font-semibold">{formatPrice(product.price)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredProducts.length} de {mockProducts.length} productos
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
