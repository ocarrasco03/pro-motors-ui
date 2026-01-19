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
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface PreviewData {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
  fileType: 'csv' | 'xlsx';
  totalRows: number;
}

interface ImportHistory {
  id: string;
  fileName: string;
  type: 'products' | 'price-list';
  date: string;
  status: 'success' | 'partial' | 'error';
  rowsImported: number;
  rowsFailed: number;
}

// Mock import history
const mockImportHistory: ImportHistory[] = [
  { id: '1', fileName: 'productos_enero.xlsx', type: 'products', date: '2024-01-15', status: 'success', rowsImported: 1250, rowsFailed: 0 },
  { id: '2', fileName: 'precios_proveedor_a.csv', type: 'price-list', date: '2024-01-14', status: 'partial', rowsImported: 890, rowsFailed: 12 },
  { id: '3', fileName: 'catalogo_frenos.xlsx', type: 'products', date: '2024-01-10', status: 'success', rowsImported: 456, rowsFailed: 0 },
  { id: '4', fileName: 'lista_marzo.csv', type: 'price-list', date: '2024-01-08', status: 'error', rowsImported: 0, rowsFailed: 234 },
];

const ImportExport: React.FC = () => {
//   const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState('import');
  const [importType, setImportType] = useState<'products' | 'price-list'>('products');
  const [exportType, setExportType] = useState<'products' | 'price-list'>('products');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');
  
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [importHistory] = useState<ImportHistory[]>(mockImportHistory);

  const canImport = true;
  const canExport = true; // All authenticated users can export

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
      const rows = jsonData.slice(1, 11).map((row: unknown) => {
        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowData[header] = String((row as string[])[index] || '');
        });
        return rowData;
      });

      setPreviewData({
        headers,
        rows,
        fileName: file.name,
        fileType,
        totalRows: jsonData.length - 1,
      });
    } catch (error) {
      toast({
        title: 'Error al leer archivo',
        description: 'No se pudo procesar el archivo. Verifica que sea un CSV o Excel válido.',
        variant: 'destructive',
      });
    }
  }, [toast]);

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

  const handleImport = async () => {
    setShowConfirmDialog(false);
    setIsImporting(true);
    setImportProgress(0);

    // Simulate import process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setImportProgress(i);
    }

    setIsImporting(false);
    setPreviewData(null);
    
    toast({
      title: 'Importación completada',
      description: `Se importaron ${previewData?.totalRows} registros exitosamente.`,
    });
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

  const getStatusBadge = (status: ImportHistory['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Exitoso</Badge>;
      case 'partial':
        return <Badge className="bg-warning/20 text-warning border-warning/30"><AlertTriangle className="w-3 h-3 mr-1" /> Parcial</Badge>;
      case 'error':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="w-3 h-3 mr-1" /> Error</Badge>;
    }
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
                        <Button variant="ghost" size="icon" onClick={clearPreview}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Preview Table */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Vista previa (primeros 10 registros)</span>
                        </div>
                        <div className="border rounded-xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {previewData.headers.map((header, index) => (
                                    <TableHead key={index} className="whitespace-nowrap">
                                      {header}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {previewData.rows.map((row, rowIndex) => (
                                  <TableRow key={rowIndex}>
                                    {previewData.headers.map((header, cellIndex) => (
                                      <TableCell key={cellIndex} className="whitespace-nowrap">
                                        {row[header] || '-'}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>

                      {/* Import Button */}
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={clearPreview}>
                          Cancelar
                        </Button>
                        <Button onClick={() => setShowConfirmDialog(true)} className="gap-2">
                          <ArrowRight className="w-4 h-4" />
                          Importar {previewData.totalRows.toLocaleString()} registros
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Import Progress */}
                  {isImporting && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Importando datos...
                        </span>
                        <span>{importProgress}%</span>
                      </div>
                      <Progress value={importProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Import History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historial de importaciones</CardTitle>
                  <CardDescription>Últimas importaciones realizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Archivo</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Registros</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {item.fileName.endsWith('.xlsx') ? (
                                  <FileSpreadsheet className="w-4 h-4 text-success" />
                                ) : (
                                  <FileText className="w-4 h-4 text-info" />
                                )}
                                {item.fileName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {item.type === 'products' ? 'Productos' : 'Lista de Precios'}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell className="text-right">
                              <span className="text-success">{item.rowsImported.toLocaleString()}</span>
                              {item.rowsFailed > 0 && (
                                <span className="text-destructive"> / {item.rowsFailed}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-3">
                    {importHistory.map((item) => (
                      <div key={item.id} className="p-4 border rounded-xl space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {item.fileName.endsWith('.xlsx') ? (
                              <FileSpreadsheet className="w-5 h-5 text-success" />
                            ) : (
                              <FileText className="w-5 h-5 text-info" />
                            )}
                            <span className="font-medium text-sm">{item.fileName}</span>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{item.date}</span>
                          <span>
                            <span className="text-success">{item.rowsImported.toLocaleString()}</span>
                            {item.rowsFailed > 0 && (
                              <span className="text-destructive"> / {item.rowsFailed} errores</span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
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
                  <p>Incluye: Número de parte, marca, línea, stock, precio{true && ', costo'}</p>
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
    </div>
  );
};

export default ImportExport;
