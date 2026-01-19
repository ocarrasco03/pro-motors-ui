import React, { useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Car,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: number;
  partNumber: string;
  brand: string;
  productName: string;
  application: string;
  price: number;
  cost?: number;
  stock: number;
}

const mockResults: SearchResult[] = [
  {
    id: 1,
    partNumber: 'FO-5W30-1L',
    brand: 'Mobil',
    productName: 'Aceite de motor 5W-30 Sintético',
    application: 'Universal - Todos los vehículos',
    price: 289.99,
    cost: 185.50,
    stock: 45,
  },
  {
    id: 2,
    partNumber: 'PF-BRM-001',
    brand: 'Brembo',
    productName: 'Pastillas de freno delanteras',
    application: 'Honda Civic 2016-2023',
    price: 1250.00,
    cost: 890.00,
    stock: 12,
  },
  {
    id: 3,
    partNumber: 'BA-12V-60A',
    brand: 'LTH',
    productName: 'Batería 12V 60Ah',
    application: 'Sedanes y compactos',
    price: 2150.00,
    cost: 1650.00,
    stock: 8,
  },
  {
    id: 4,
    partNumber: 'AM-K&N-001',
    brand: "K&N",
    productName: 'Filtro de aire alto flujo',
    application: 'Ford Mustang 2015-2023',
    price: 980.00,
    cost: 720.00,
    stock: 15,
  },
  {
    id: 5,
    partNumber: 'SU-TOY-001',
    brand: 'KYB',
    productName: 'Amortiguador trasero',
    application: 'Toyota Corolla 2018-2023',
    price: 1450.00,
    cost: 1050.00,
    stock: 6,
  },
];

const SearchParts: React.FC = () => {
//   const { canViewCosts } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    setHasSearched(true);
    // Simulate search with mock data
    if (searchQuery.trim()) {
      const filtered = mockResults.filter(
        (r) =>
          r.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults(mockResults);
    }
  };

  const toggleRowExpand = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-bold">Búsqueda de Autopartes</h1>
        <p className="text-muted-foreground mt-1">
          Busca por número de parte, marca o aplicación vehicular
        </p>
      </div>

      {/* Search Section */}
      <div className="glass-card rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '50ms' }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de parte, nombre o marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-12"
            />
          </div>
          <Button variant="gradient" onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {showFilters ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            <div>
              <label className="text-sm font-medium mb-2 block">Marca de vehículo</label>
              <select className="w-full h-11 rounded-xl border-2 border-input bg-background px-4 text-sm">
                <option value="">Todas las marcas</option>
                <option value="honda">Honda</option>
                <option value="toyota">Toyota</option>
                <option value="ford">Ford</option>
                <option value="chevrolet">Chevrolet</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Modelo</label>
              <select className="w-full h-11 rounded-xl border-2 border-input bg-background px-4 text-sm">
                <option value="">Todos los modelos</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Año</label>
              <select className="w-full h-11 rounded-xl border-2 border-input bg-background px-4 text-sm">
                <option value="">Todos los años</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Marca de parte</label>
              <select className="w-full h-11 rounded-xl border-2 border-input bg-background px-4 text-sm">
                <option value="">Todas</option>
                <option value="brembo">Brembo</option>
                <option value="mobil">Mobil</option>
                <option value="kyb">KYB</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium text-sm">Número de Parte</th>
                  <th className="text-left p-4 font-medium text-sm">Marca</th>
                  <th className="text-left p-4 font-medium text-sm">Producto</th>
                  <th className="text-left p-4 font-medium text-sm">Aplicación</th>
                  <th className="text-right p-4 font-medium text-sm">Stock</th>
                  {/* {canViewCosts && ( */}
                    <th className="text-right p-4 font-medium text-sm">Costo</th>
                {/* )} */}
                  <th className="text-right p-4 font-medium text-sm">Precio</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr
                    key={result.id}
                    className="border-b border-border last:border-0 table-row-hover"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {result.partNumber}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{result.brand}</td>
                    <td className="p-4">{result.productName}</td>
                    <td className="p-4 text-sm text-muted-foreground">{result.application}</td>
                    <td className="p-4 text-right">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          result.stock > 10 ? 'badge-success' : result.stock > 5 ? 'badge-warning' : 'badge-danger'
                        )}
                      >
                        {result.stock}
                      </span>
                    </td>
                    {/* {canViewCosts && ( */}
                      <td className="p-4 text-right text-cost">{formatPrice(result.cost!)}</td>
                    {/* )} */}
                    <td className="p-4 text-right text-money">{formatPrice(result.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleRowExpand(result.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{result.productName}</p>
                      <p className="text-sm text-muted-foreground">{result.partNumber}</p>
                    </div>
                  </div>
                  {expandedRows.includes(result.id) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {expandedRows.includes(result.id) && (
                  <div className="px-4 pb-4 space-y-3 animate-fade-in border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Marca</span>
                      <span className="font-medium">{result.brand}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Aplicación</span>
                      <span className="text-sm text-right max-w-[60%]">{result.application}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Stock</span>
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          result.stock > 10 ? 'badge-success' : result.stock > 5 ? 'badge-warning' : 'badge-danger'
                        )}
                      >
                        {result.stock} unidades
                      </span>
                    </div>
                    {/* {canViewCosts && ( */}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Costo</span>
                        <span className="text-cost">{formatPrice(result.cost!)}</span>
                      </div>
                    {/* )} */}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Precio de venta</span>
                      <span className="text-money text-lg">{formatPrice(result.price)}</span>
                    </div>
                    <Button variant="gradient" className="w-full mt-2">
                      Ver detalles
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {results.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="p-4 rounded-full bg-muted inline-block mb-4">
                <Car className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
              <p className="text-muted-foreground">
                Intenta con otros términos de búsqueda o ajusta los filtros
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial state */}
      {!hasSearched && (
        <div className="glass-card rounded-2xl p-12 text-center animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="p-4 rounded-full bg-gradient-primary inline-block mb-4">
            <Search className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Comienza tu búsqueda</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ingresa el número de parte, nombre del producto o utiliza los filtros de aplicación vehicular para encontrar las autopartes que necesitas.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchParts;
