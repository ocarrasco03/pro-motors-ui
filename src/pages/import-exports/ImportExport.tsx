import React, { useState, useRef, useCallback } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  Eye,
  Package,
  ListOrdered,
  ArrowRight,
  RefreshCw,
  FileUp,
  FileDown,
  Play,
  Loader2,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Validation rules for different import types
interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message: string;
}

interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

interface PreviewData {
  headers: string[];
  rows: Record<string, string>[];
  allRows: Record<string, string>[];
  fileName: string;
  fileType: 'csv' | 'xlsx';
  totalRows: number;
  validationErrors: ValidationError[];
  invalidRowIndices: Set<number>;
}

type FileStatus = 'UPLOADED' | 'UPLOADING' | 'FAILED' | 'PROCESSING' | 'PROCESSED';

interface UploadedFile {
  id: string;
  fileName: string;
  company: string;
  totalRecords: number;
  totalAdded: number;
  totalModified: number;
  incrementPercentage: number;
  processedPercentage: number;
  status: FileStatus;
  type: 'products' | 'price-list';
  uploadedAt: string;
  validationErrors: ValidationError[];
  previewData?: PreviewData;
}

// Validation rules for products
const productValidationRules: ValidationRule[] = [
  { field: 'Número de Parte', required: true, minLength: 3, maxLength: 50, message: 'Número de parte es requerido (3-50 caracteres)' },
  { field: 'Marca', required: true, minLength: 2, message: 'Marca es requerida' },
  { field: 'Nombre', required: true, minLength: 3, message: 'Nombre es requerido' },
  { field: 'Precio', required: true, type: 'number', min: 0, message: 'Precio debe ser un número positivo' },
  { field: 'Stock', type: 'number', min: 0, message: 'Stock debe ser un número positivo' },
  { field: 'Costo', type: 'number', min: 0, message: 'Costo debe ser un número positivo' },
];

// Validation rules for price lists
const priceListValidationRules: ValidationRule[] = [
  { field: 'Número de Parte', required: true, minLength: 3, message: 'Número de parte es requerido' },
  { field: 'Precio Base', required: true, type: 'number', min: 0, message: 'Precio base debe ser un número positivo' },
  { field: 'Descuento', type: 'number', min: 0, max: 100, message: 'Descuento debe estar entre 0 y 100' },
];

// Mock uploaded files
const mockUploadedFiles: UploadedFile[] = [
  { 
    id: '1', 
    fileName: 'productos_enero.xlsx', 
    company: 'Refaccionaria Central',
    totalRecords: 1250, 
    totalAdded: 980, 
    totalModified: 270,
    incrementPercentage: 12.5,
    processedPercentage: 100,
    status: 'PROCESSED', 
    type: 'products',
    uploadedAt: '2024-01-15 10:30',
    validationErrors: []
  },
  { 
    id: '2', 
    fileName: 'precios_proveedor_a.csv', 
    company: 'AutoPartes Plus',
    totalRecords: 890, 
    totalAdded: 0, 
    totalModified: 0,
    incrementPercentage: 0,
    processedPercentage: 0,
    status: 'UPLOADED', 
    type: 'price-list',
    uploadedAt: '2024-01-14 14:20',
    validationErrors: []
  },
  { 
    id: '3', 
    fileName: 'catalogo_frenos.xlsx', 
    company: 'Refaccionaria Central',
    totalRecords: 456, 
    totalAdded: 350, 
    totalModified: 106,
    incrementPercentage: 8.3,
    processedPercentage: 100,
    status: 'PROCESSED', 
    type: 'products',
    uploadedAt: '2024-01-10 09:15',
    validationErrors: []
  },
  { 
    id: '4', 
    fileName: 'lista_marzo.csv', 
    company: 'Distribuidora Norte',
    totalRecords: 234, 
    totalAdded: 0, 
    totalModified: 0,
    incrementPercentage: 0,
    processedPercentage: 45,
    status: 'FAILED', 
    type: 'price-list',
    uploadedAt: '2024-01-08 16:45',
    validationErrors: [
      { row: 15, field: 'Precio Base', value: 'abc', message: 'Precio base debe ser un número positivo' },
      { row: 28, field: 'Número de Parte', value: '', message: 'Número de parte es requerido' },
    ]
  },
];

const ImportExport: React.FC = () => {
  // const { hasPermission } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState('import');
  const [importType, setImportType] = useState<'products' | 'price-list'>('products');
  const [exportType, setExportType] = useState<'products' | 'price-list'>('products');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');
  
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(mockUploadedFiles);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<UploadedFile | null>(null);

  // const canImport = hasPermission('canManageProducts');
  const canImport = true;

  // Validate a single row
  const validateRow = useCallback((row: Record<string, string>, rules: ValidationRule[], rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    rules.forEach(rule => {
      const value = row[rule.field]?.toString().trim() || '';
      
      // Required check
      if (rule.required && !value) {
        errors.push({ row: rowIndex, field: rule.field, value, message: rule.message });
        return;
      }
      
      if (!value) return; // Skip further validation if empty and not required
      
      // Type check
      if (rule.type === 'number') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          errors.push({ row: rowIndex, field: rule.field, value, message: rule.message });
          return;
        }
        if (rule.min !== undefined && numValue < rule.min) {
          errors.push({ row: rowIndex, field: rule.field, value, message: rule.message });
          return;
        }
        if (rule.max !== undefined && numValue > rule.max) {
          errors.push({ row: rowIndex, field: rule.field, value, message: rule.message });
          return;
        }
      }
      
      // String length checks
      if (rule.minLength && value.length < rule.minLength) {
        errors.push({ row: rowIndex, field: rule.field, value, message: rule.message });
        return;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push({ row: rowIndex, field: rule.field, value, message: rule.message });
        return;
      }
      
      // Pattern check
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({ row: rowIndex, field: rule.field, value, message: rule.message });
      }
    });
    
    return errors;
  }, []);

  // Validate all rows
  const validateData = useCallback((rows: Record<string, string>[], type: 'products' | 'price-list'): { errors: ValidationError[], invalidRowIndices: Set<number> } => {
    const rules = type === 'products' ? productValidationRules : priceListValidationRules;
    const allErrors: ValidationError[] = [];
    const invalidRowIndices = new Set<number>();
    
    rows.forEach((row, index) => {
      const rowErrors = validateRow(row, rules, index + 1); // 1-indexed for display
      if (rowErrors.length > 0) {
        invalidRowIndices.add(index);
        allErrors.push(...rowErrors);
      }
    });
    
    return { errors: allErrors, invalidRowIndices };
  }, [validateRow]);

  const parseFile = useCallback(async (file: File) => {
    const fileType = file.name.endsWith('.csv') ? 'csv' : 'xlsx';
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        toast({
          title: 'Archivo vacío',
          description: 'El archivo no contiene datos para importar.',
          variant: 'destructive',
        });
        return;
      }

      const headers = jsonData[0] as unknown as string[];
      const allRows = jsonData.slice(1).map((row: unknown) => {
        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowData[header] = String((row as string[])[index] || '');
        });
        return rowData;
      }).filter(row => Object.values(row).some(v => v.trim() !== ''));

      // Validate data
      const { errors, invalidRowIndices } = validateData(allRows, importType);

      const previewRows = allRows.slice(0, 10);

      setPreviewData({
        headers,
        rows: previewRows,
        allRows,
        fileName: file.name,
        fileType,
        totalRows: allRows.length,
        validationErrors: errors,
        invalidRowIndices,
      });

      // Add to uploaded files list
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        fileName: file.name,
        company: 'Mi Refaccionaria', // Default company
        totalRecords: allRows.length,
        totalAdded: 0,
        totalModified: 0,
        incrementPercentage: 0,
        processedPercentage: 0,
        status: 'UPLOADED',
        type: importType,
        uploadedAt: new Date().toLocaleString('es-MX'),
        validationErrors: errors,
        previewData: {
          headers,
          rows: previewRows,
          allRows,
          fileName: file.name,
          fileType,
          totalRows: allRows.length,
          validationErrors: errors,
          invalidRowIndices,
        },
      };

      setUploadedFiles(prev => [newFile, ...prev]);

      if (errors.length > 0) {
        toast({
          title: 'Validación completada',
          description: `Se encontraron ${errors.length} errores en ${invalidRowIndices.size} filas.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error al leer archivo',
        description: 'No se pudo procesar el archivo. Verifica que sea un CSV o Excel válido.',
        variant: 'destructive',
      });
    }
  }, [toast, importType, validateData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(f => 
      f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
    );
    
    if (validFile) {
      parseFile(validFile);
    } else {
      toast({
        title: 'Formato no válido',
        description: 'Por favor, sube un archivo CSV o Excel (.xlsx, .xls)',
        variant: 'destructive',
      });
    }
  }, [parseFile, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  const processFile = async (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    // Check for validation errors
    if (file.validationErrors.length > 0) {
      toast({
        title: 'Error de validación',
        description: `El archivo tiene ${file.validationErrors.length} errores. Corrígelos antes de procesar.`,
        variant: 'destructive',
      });
      return;
    }

    // Start processing
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'PROCESSING' as FileStatus, processedPercentage: 0 } : f
    ));

    // Simulate processing with progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, processedPercentage: i } : f
      ));
    }

    // Complete processing with mock results
    const totalAdded = Math.floor(file.totalRecords * 0.7);
    const totalModified = file.totalRecords - totalAdded;
    const incrementPercentage = Math.round((totalAdded / (file.totalRecords || 1)) * 100 * 10) / 10;

    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { 
        ...f, 
        status: 'PROCESSED' as FileStatus, 
        processedPercentage: 100,
        totalAdded,
        totalModified,
        incrementPercentage,
      } : f
    ));

    toast({
      title: 'Procesamiento completado',
      description: `${totalAdded} registros agregados, ${totalModified} modificados.`,
    });
  };

  const deleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (previewData && uploadedFiles.find(f => f.id === fileId)?.fileName === previewData.fileName) {
      setPreviewData(null);
    }
    toast({
      title: 'Archivo eliminado',
      description: 'El archivo ha sido eliminado de la lista.',
    });
  };

  const handleImport = async () => {
    setShowConfirmDialog(false);
    
    if (!previewData) return;
    
    const file = uploadedFiles.find(f => f.fileName === previewData.fileName && f.status === 'UPLOADED');
    if (file) {
      await processFile(file.id);
    }
    
    setPreviewData(null);
  };

  const handleExport = async () => {
    const mockData = exportType === 'products' 
      ? [
          { 'Número de Parte': 'BRK-001', 'Marca': 'Brembo', 'Línea': 'Frenos', 'Stock': 45, 'Precio': 1250.00, 'Costo': 875.00 },
          { 'Número de Parte': 'FLT-002', 'Marca': 'K&N', 'Línea': 'Filtros', 'Stock': 120, 'Precio': 450.00, 'Costo': 315.00 },
          { 'Número de Parte': 'SUS-003', 'Marca': 'Monroe', 'Línea': 'Suspensión', 'Stock': 30, 'Precio': 2100.00, 'Costo': 1470.00 },
        ]
      : [
          { 'Lista': 'Mayoreo', 'Número de Parte': 'BRK-001', 'Precio Base': 1250.00, 'Descuento': '10%', 'Precio Final': 1125.00 },
          { 'Lista': 'Mayoreo', 'Número de Parte': 'FLT-002', 'Precio Base': 450.00, 'Descuento': '10%', 'Precio Final': 405.00 },
          { 'Lista': 'Menudeo', 'Número de Parte': 'SUS-003', 'Precio Base': 2100.00, 'Descuento': '0%', 'Precio Final': 2100.00 },
        ];

    const worksheet = XLSX.utils.json_to_sheet(mockData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    const fileName = `${exportType === 'products' ? 'productos' : 'lista_precios'}_${new Date().toISOString().split('T')[0]}`;
    
    if (exportFormat === 'xlsx') {
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } else {
      XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: 'csv' });
    }

    toast({
      title: 'Exportación completada',
      description: `El archivo ${fileName}.${exportFormat} se ha descargado.`,
    });
  };

  const clearPreview = () => {
    setPreviewData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status: FileStatus) => {
    switch (status) {
      case 'UPLOADED':
        return <Badge className="bg-info/20 text-info border-info/30 gap-1"><Clock className="w-3 h-3" /> Subido</Badge>;
      case 'UPLOADING':
        return <Badge className="bg-warning/20 text-warning border-warning/30 gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Subiendo</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-primary/20 text-primary border-primary/30 gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Procesando</Badge>;
      case 'PROCESSED':
        return <Badge className="bg-success/20 text-success border-success/30 gap-1"><CheckCircle2 className="w-3 h-3" /> Procesado</Badge>;
      case 'FAILED':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30 gap-1"><XCircle className="w-3 h-3" /> Fallido</Badge>;
    }
  };

  const canProcess = (status: FileStatus) => status === 'UPLOADED' || status === 'FAILED';
  const canDelete = (status: FileStatus) => status === 'UPLOADED' || status === 'FAILED' || status === 'PROCESSED';

  const getErrorsForCell = (rowIndex: number, field: string): ValidationError | undefined => {
    return previewData?.validationErrors.find(e => e.row === rowIndex + 1 && e.field === field);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Importar / Exportar</h1>
          <p className="text-muted-foreground">Gestiona tus datos mediante archivos CSV o Excel</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="import" className="gap-2">
            <FileUp className="w-4 h-4" />
            Importar
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <FileDown className="w-4 h-4" />
            Exportar
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          {!canImport ? (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="py-8 text-center">
                <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Acceso restringido</h3>
                <p className="text-muted-foreground">No tienes permisos para importar datos. Contacta a tu administrador.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Import Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tipo de importación</CardTitle>
                  <CardDescription>Selecciona qué tipo de datos deseas importar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setImportType('products')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        importType === 'products'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Package className={`w-8 h-8 mb-2 ${importType === 'products' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h3 className="font-semibold">Productos</h3>
                      <p className="text-sm text-muted-foreground">Importa catálogo de productos, inventario y precios</p>
                    </button>
                    <button
                      onClick={() => setImportType('price-list')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        importType === 'price-list'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <ListOrdered className={`w-8 h-8 mb-2 ${importType === 'price-list' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h3 className="font-semibold">Lista de Precios</h3>
                      <p className="text-sm text-muted-foreground">Importa o actualiza listas de precios por proveedor</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* File Upload Zone */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subir archivo</CardTitle>
                  <CardDescription>Arrastra o selecciona un archivo CSV o Excel</CardDescription>
                </CardHeader>
                <CardContent>
                  {!previewData ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                        isDragging
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-4">
                        <div className={`p-4 rounded-2xl transition-colors ${isDragging ? 'bg-primary/20' : 'bg-muted'}`}>
                          <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-medium">
                            {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            o haz clic para seleccionar
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="gap-1">
                            <FileSpreadsheet className="w-3 h-3" /> .xlsx
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <FileSpreadsheet className="w-3 h-3" /> .xls
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <FileText className="w-3 h-3" /> .csv
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* File Info */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                        <div className="flex items-center gap-3">
                          {previewData.fileType === 'xlsx' ? (
                            <FileSpreadsheet className="w-8 h-8 text-success" />
                          ) : (
                            <FileText className="w-8 h-8 text-info" />
                          )}
                          <div>
                            <p className="font-medium">{previewData.fileName}</p>
                            <p className="text-sm text-muted-foreground">
                              {previewData.totalRows.toLocaleString()} registros encontrados
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {previewData.validationErrors.length > 0 && (
                            <Badge className="bg-destructive/20 text-destructive border-destructive/30 gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {previewData.validationErrors.length} errores
                            </Badge>
                          )}
                          {previewData.validationErrors.length === 0 && (
                            <Badge className="bg-success/20 text-success border-success/30 gap-1">
                              <Check className="w-3 h-3" />
                              Válido
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon" onClick={clearPreview}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Validation Errors Summary */}
                      {previewData.validationErrors.length > 0 && (
                        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-destructive">Errores de validación</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Se encontraron {previewData.validationErrors.length} errores en {previewData.invalidRowIndices.size} filas. 
                                Las filas con errores están resaltadas en rojo.
                              </p>
                              <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
                                {previewData.validationErrors.slice(0, 10).map((error, idx) => (
                                  <p key={idx} className="text-sm text-destructive">
                                    • Fila {error.row}: {error.field} - {error.message}
                                  </p>
                                ))}
                                {previewData.validationErrors.length > 10 && (
                                  <p className="text-sm text-muted-foreground">
                                    ... y {previewData.validationErrors.length - 10} errores más
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Preview Table */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Vista previa (primeros 10 registros)</span>
                        </div>
                        <div className="border rounded-xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <TooltipProvider>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-12 text-center">#</TableHead>
                                    {previewData.headers.map((header, index) => (
                                      <TableHead key={index} className="whitespace-nowrap">
                                        {header}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {previewData.rows.map((row, rowIndex) => {
                                    const hasError = previewData.invalidRowIndices.has(rowIndex);
                                    return (
                                      <TableRow 
                                        key={rowIndex}
                                        className={hasError ? 'bg-destructive/10 hover:bg-destructive/20' : ''}
                                      >
                                        <TableCell className="text-center text-muted-foreground">
                                          {rowIndex + 1}
                                        </TableCell>
                                        {previewData.headers.map((header, cellIndex) => {
                                          const error = getErrorsForCell(rowIndex, header);
                                          return (
                                            <TableCell 
                                              key={cellIndex} 
                                              className={`whitespace-nowrap ${error ? 'bg-destructive/20 text-destructive font-medium' : ''}`}
                                            >
                                              {error ? (
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <span className="flex items-center gap-1 cursor-help">
                                                      <AlertCircle className="w-3 h-3" />
                                                      {row[header] || '(vacío)'}
                                                    </span>
                                                  </TooltipTrigger>
                                                  <TooltipContent className="bg-destructive text-destructive-foreground">
                                                    {error.message}
                                                  </TooltipContent>
                                                </Tooltip>
                                              ) : (
                                                row[header] || '-'
                                              )}
                                            </TableCell>
                                          );
                                        })}
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>

                      {/* Import Button */}
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={clearPreview}>
                          Cancelar
                        </Button>
                        <Button 
                          onClick={() => setShowConfirmDialog(true)} 
                          className="gap-2"
                          disabled={previewData.validationErrors.length > 0}
                        >
                          <ArrowRight className="w-4 h-4" />
                          Importar {previewData.totalRows.toLocaleString()} registros
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Uploaded Files Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Archivos subidos</CardTitle>
                  <CardDescription>Lista de archivos cargados y su estado de procesamiento</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table */}
                  <div className="hidden lg:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre del Archivo</TableHead>
                          <TableHead>Compañía</TableHead>
                          <TableHead className="text-right">Total Registros</TableHead>
                          <TableHead className="text-right">Agregados</TableHead>
                          <TableHead className="text-right">Modificados</TableHead>
                          <TableHead className="text-right">% Incremento</TableHead>
                          <TableHead className="w-32">% Procesado</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadedFiles.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {file.fileName.endsWith('.xlsx') || file.fileName.endsWith('.xls') ? (
                                  <FileSpreadsheet className="w-4 h-4 text-success" />
                                ) : (
                                  <FileText className="w-4 h-4 text-info" />
                                )}
                                <span className="truncate max-w-[150px]">{file.fileName}</span>
                              </div>
                            </TableCell>
                            <TableCell>{file.company}</TableCell>
                            <TableCell className="text-right">{file.totalRecords.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-success">{file.totalAdded.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-info">{file.totalModified.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              {file.incrementPercentage > 0 ? (
                                <span className="text-success">+{file.incrementPercentage}%</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={file.processedPercentage} className="h-2 flex-1" />
                                <span className="text-xs text-muted-foreground w-10 text-right">
                                  {file.status === 'PROCESSING' && (
                                    <span className="flex items-center gap-1">
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                      {file.processedPercentage}%
                                    </span>
                                  )}
                                  {file.status !== 'PROCESSING' && `${file.processedPercentage}%`}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(file.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={!canProcess(file.status)}
                                        onClick={() => processFile(file.id)}
                                      >
                                        <Play className={`w-4 h-4 ${canProcess(file.status) ? 'text-success' : 'text-muted-foreground'}`} />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Procesar archivo</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={!canDelete(file.status)}
                                        onClick={() => deleteFile(file.id)}
                                      >
                                        <Trash2 className={`w-4 h-4 ${canDelete(file.status) ? 'text-destructive' : 'text-muted-foreground'}`} />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Eliminar archivo</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {uploadedFiles.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No hay archivos subidos
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="p-4 border rounded-xl space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {file.fileName.endsWith('.xlsx') || file.fileName.endsWith('.xls') ? (
                              <FileSpreadsheet className="w-5 h-5 text-success" />
                            ) : (
                              <FileText className="w-5 h-5 text-info" />
                            )}
                            <div>
                              <span className="font-medium text-sm block">{file.fileName}</span>
                              <span className="text-xs text-muted-foreground">{file.company}</span>
                            </div>
                          </div>
                          {getStatusBadge(file.status)}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Registros</p>
                            <p className="font-medium">{file.totalRecords.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Agregados</p>
                            <p className="font-medium text-success">{file.totalAdded.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Modificados</p>
                            <p className="font-medium text-info">{file.totalModified.toLocaleString()}</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progreso</span>
                            <span className="flex items-center gap-1">
                              {file.status === 'PROCESSING' && (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              )}
                              {file.processedPercentage}%
                            </span>
                          </div>
                          <Progress value={file.processedPercentage} className="h-2" />
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                            disabled={!canProcess(file.status)}
                            onClick={() => processFile(file.id)}
                          >
                            <Play className="w-3 h-3" />
                            Procesar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            disabled={!canDelete(file.status)}
                            onClick={() => deleteFile(file.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {uploadedFiles.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay archivos subidos
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Products */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Exportar Productos</CardTitle>
                    <CardDescription>Descarga tu catálogo de productos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Formato de archivo</label>
                  <Select value={exportFormat} onValueChange={(v: 'csv' | 'xlsx') => setExportFormat(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4" />
                          Excel (.xlsx)
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          CSV (.csv)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  {/* <p>Incluye: Número de parte, marca, línea, stock, precio{hasPermission('canViewCosts') && ', costo'}</p> */}
                  <p>Incluye: Número de parte, marca, línea, stock, precio</p>
                </div>
                <Button 
                  className="w-full gap-2" 
                  onClick={() => { setExportType('products'); handleExport(); }}
                >
                  <Download className="w-4 h-4" />
                  Descargar Productos
                </Button>
              </CardContent>
            </Card>

            {/* Export Price Lists */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-success/10">
                    <ListOrdered className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Exportar Listas de Precios</CardTitle>
                    <CardDescription>Descarga tus listas de precios</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Lista a exportar</label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las listas</SelectItem>
                      <SelectItem value="mayoreo">Mayoreo</SelectItem>
                      <SelectItem value="menudeo">Menudeo</SelectItem>
                      <SelectItem value="especial">Clientes Especiales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Formato de archivo</label>
                  <Select value={exportFormat} onValueChange={(v: 'csv' | 'xlsx') => setExportFormat(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlsx">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4" />
                          Excel (.xlsx)
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          CSV (.csv)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full gap-2" 
                  variant="outline"
                  onClick={() => { setExportType('price-list'); handleExport(); }}
                >
                  <Download className="w-4 h-4" />
                  Descargar Listas de Precios
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Export Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plantillas de importación</CardTitle>
              <CardDescription>Descarga plantillas vacías para facilitar la importación de datos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-success" />
                  <span>Plantilla Productos</span>
                  <span className="text-xs text-muted-foreground">.xlsx</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-info" />
                  <span>Plantilla Lista Precios</span>
                  <span className="text-xs text-muted-foreground">.xlsx</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <FileText className="w-6 h-6 text-warning" />
                  <span>Guía de Formato</span>
                  <span className="text-xs text-muted-foreground">.pdf</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirm Import Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar importación</DialogTitle>
            <DialogDescription>
              Estás a punto de importar {previewData?.totalRows.toLocaleString()} registros de {importType === 'products' ? 'productos' : 'lista de precios'}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Importante</p>
                  <p className="text-muted-foreground mt-1">
                    Los registros existentes con el mismo número de parte serán actualizados. Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImport}>
              Confirmar importación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={!!selectedFileForPreview} onOpenChange={() => setSelectedFileForPreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vista previa: {selectedFileForPreview?.fileName}</DialogTitle>
            <DialogDescription>
              {selectedFileForPreview?.totalRecords.toLocaleString()} registros en el archivo
            </DialogDescription>
          </DialogHeader>
          {selectedFileForPreview?.previewData && (
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectedFileForPreview.previewData.headers.map((header, idx) => (
                      <TableHead key={idx}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedFileForPreview.previewData.rows.map((row, rowIdx) => (
                    <TableRow key={rowIdx}>
                      {selectedFileForPreview.previewData!.headers.map((header, cellIdx) => (
                        <TableCell key={cellIdx}>{row[header] || '-'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFileForPreview(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImportExport;
