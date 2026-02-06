import React, { useState } from 'react';
// import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users as UsersIcon,
  Mail,
  Building2,
  Calendar,
} from 'lucide-react';
import type { Role } from '@/types/types';

type UserStatus = 'active' | 'suspended';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role[];
  status: UserStatus;
  refaccionariaId?: string;
  refaccionariaName?: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string | null;
}

interface UserForm {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  refaccionariaId?: string;
  refaccionariaName?: string;
  avatar?: string;
  createdAt: string;
  lastLogin: string | null;
}

// Mock users data
const mockUsers: UserForm[] = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    email: 'admin@promotors.com',
    role: 'super-admin',
    status: 'active',
    createdAt: '2023-01-15',
    lastLogin: '2024-01-22',
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@refac-central.com',
    role: 'manager',
    status: 'active',
    refaccionariaId: 'ref-001',
    refaccionariaName: 'Refaccionaria Central',
    createdAt: '2023-03-20',
    lastLogin: '2024-01-21',
  },
];

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  refaccionaria_admin: 'Admin Refaccionaria',
  refaccionaria_user: 'Usuario',
};

const refaccionarias = [
  { id: 'ref-001', name: 'Refaccionaria Central' },
  { id: 'ref-002', name: 'AutoPartes Plus' },
  { id: 'ref-003', name: 'Distribuidora Norte' },
];

const Users: React.FC = () => {
//   const { user: currentUser, hasPermission } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserForm[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
    status: 'active' as UserStatus,
    refaccionariaId: '',
  });

//   const canManage = hasPermission('manage_users');
//   const isSuperAdmin = currentUser?.role === 'super_admin';
  const canManage = true;
  const isSuperAdmin = true;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.refaccionariaName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || true;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success border-success/30 gap-1"><UserCheck className="w-3 h-3" /> Activo</Badge>;
      case 'suspended':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30 gap-1"><UserX className="w-3 h-3" /> Suspendido</Badge>;
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role.name) {
      case 'super_admin':
        return <Badge className="bg-primary/20 text-primary border-primary/30 gap-1"><ShieldCheck className="w-3 h-3" /> {roleLabels[role.name]}</Badge>;
      case 'refaccionaria_admin':
        return <Badge className="bg-info/20 text-info border-info/30 gap-1"><Shield className="w-3 h-3" /> {roleLabels[role.name]}</Badge>;
      case 'refaccionaria_user':
        return <Badge variant="outline" className="gap-1"><UsersIcon className="w-3 h-3" /> {roleLabels[role.name]}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleCreate = () => {
    const refac = refaccionarias.find(r => r.id === formData.refaccionariaId);
    
    const newUser: UserForm = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      refaccionariaId: formData.refaccionariaId || undefined,
      refaccionariaName: refac?.name,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null,
    };
    
    setUsers(prev => [newUser, ...prev]);
    setShowCreateDialog(false);
    resetForm();
    toast({ title: 'Usuario creado', description: `El usuario "${formData.name}" ha sido creado exitosamente.` });
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    
    const refac = refaccionarias.find(r => r.id === formData.refaccionariaId);
    
    // setUsers(prev => prev.map(user => 
    //   user.id === selectedUser.id 
    //     ? {
    //         ...user,
    //         name: formData.name,
    //         email: formData.email,
    //         role: formData.role,
    //         status: formData.status,
    //         refaccionariaId: formData.refaccionariaId || undefined,
    //         refaccionariaName: refac?.name,
    //       }
    //     : user
    // ));
    
    setShowEditDialog(false);
    setSelectedUser(null);
    resetForm();
    toast({ title: 'Usuario actualizado', description: 'Los cambios han sido guardados.' });
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    
    setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
    setShowDeleteDialog(false);
    setSelectedUser(null);
    toast({ title: 'Usuario eliminado', description: 'El usuario ha sido eliminado del sistema.' });
  };

  const handleToggleStatus = (user: AppUser) => {
    const newStatus: UserStatus = user.status === 'active' ? 'suspended' : 'active';
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    toast({ 
      title: newStatus === 'active' ? 'Usuario activado' : 'Usuario suspendido',
      description: `El usuario "${user.name}" ha sido ${newStatus === 'active' ? 'activado' : 'suspendido'}.`,
    });
  };

  const openEditDialog = (user: AppUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role[0].name,
      status: user.status,
      refaccionariaId: user.refaccionariaId || '',
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'refaccionaria_user',
      status: 'active',
      refaccionariaId: '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Administra usuarios, roles y permisos</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <UsersIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-success/10">
                <UserCheck className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-info/10">
                <Shield className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'refaccionaria_admin').length}</p>
                <p className="text-sm text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-destructive/10">
                <UserX className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'suspended').length}</p>
                <p className="text-sm text-muted-foreground">Suspendidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | 'all')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="refaccionaria_admin">Admin Refaccionaria</SelectItem>
                <SelectItem value="refaccionaria_user">Usuario</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UserStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usuarios</CardTitle>
          <CardDescription>{filteredUsers.length} usuarios encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Refaccionaria</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    {/* <TableCell>{getRoleBadge(user.role[0].name)}</TableCell> */}
                    <TableCell></TableCell>
                    <TableCell>
                      {user.refaccionariaName ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Building2 className="w-3 h-3 text-muted-foreground" />
                          {user.refaccionariaName}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {user.lastLogin}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canManage && (
                              <>
                                {/* <DropdownMenuItem onClick={() => openEditDialog(user)}> */}
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem onClick={() => handleToggleStatus(user)}> */}
                                <DropdownMenuItem>
                                  {user.status === 'active' ? (
                                    <>
                                      <UserX className="w-4 h-4 mr-2" />
                                      Suspender
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-4 h-4 mr-2" />
                                      Activar
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                //   onClick={() => { setSelectedUser(user); setShowDeleteDialog(true); }}
                                  className="text-destructive focus:text-destructive"
                                //   disabled={user.id === currentUser?.id}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 border rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(user.status)}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* {getRoleBadge(user.role)} */}
                  {user.refaccionariaName && (
                    <Badge variant="outline" className="gap-1">
                      <Building2 className="w-3 h-3" />
                      {user.refaccionariaName}
                    </Badge>
                  )}
                </div>

                {canManage && (
                  <div className="flex gap-2 pt-2 border-t">
                    {/* <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEditDialog(user)}> */}
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Edit className="w-3 h-3" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                    //   onClick={() => handleToggleStatus(user)}
                    >
                      {user.status === 'active' ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                    //   onClick={() => { setSelectedUser(user); setShowDeleteDialog(true); }}
                    //   disabled={user.id === currentUser?.id}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron usuarios
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>Crea un nuevo usuario en el sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Ej: juan@empresa.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* <div>
                <Label htmlFor="role">Rol</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData(prev => ({ ...prev, role: v as UserRole }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                    <SelectItem value="refaccionaria_admin">Admin Refaccionaria</SelectItem>
                    <SelectItem value="refaccionaria_user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as UserStatus }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="suspended">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.role !== 'super_admin' && (
              <div>
                <Label htmlFor="refaccionaria">Refaccionaria</Label>
                <Select value={formData.refaccionariaId} onValueChange={(v) => setFormData(prev => ({ ...prev, refaccionariaId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar refaccionaria" />
                  </SelectTrigger>
                  <SelectContent>
                    {refaccionarias.map(refac => (
                      <SelectItem key={refac.id} value={refac.id}>{refac.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.email}>
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica la información del usuario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Nombre completo</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Correo electrónico</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* <div>
                <Label htmlFor="edit-role">Rol</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData(prev => ({ ...prev, role: v as UserRole }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                    <SelectItem value="refaccionaria_admin">Admin Refaccionaria</SelectItem>
                    <SelectItem value="refaccionaria_user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}
              <div>
                <Label htmlFor="edit-status">Estado</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as UserStatus }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="suspended">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.role !== 'super_admin' && (
              <div>
                <Label htmlFor="edit-refaccionaria">Refaccionaria</Label>
                <Select value={formData.refaccionariaId} onValueChange={(v) => setFormData(prev => ({ ...prev, refaccionariaId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar refaccionaria" />
                  </SelectTrigger>
                  <SelectContent>
                    {refaccionarias.map(refac => (
                      <SelectItem key={refac.id} value={refac.id}>{refac.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setSelectedUser(null); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al usuario "{selectedUser?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedUser(null); }}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
