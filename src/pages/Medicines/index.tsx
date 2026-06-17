import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../../components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Edit, Eye, Trash, Download, Filter } from "lucide-react";
import { Medicine } from "../../types";
import { MedicineFormModal } from "./MedicineFormModal";
import { MedicineViewModal } from "./MedicineViewModal";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Checkbox } from "../../components/ui/checkbox";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import api from "../../lib/api";

export function Medicines() {
  const [data, setData] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentMedicine, setCurrentMedicine] = downToNull();

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination simple state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await api.get('/medicines');
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  function downToNull() {
    return useState<Medicine | null>(null);
  }

  // Derived state
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.genericName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleAdd = () => {
    setCurrentMedicine(null);
    setIsFormOpen(true);
  };

  const handleEdit = (medicine: Medicine) => {
    setCurrentMedicine(medicine);
    setIsFormOpen(true);
  };

  const handleView = (medicine: Medicine) => {
    setCurrentMedicine(medicine);
    setIsViewOpen(true);
  };

  const handleDelete = (medicine: Medicine) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${medicine.name}. This is irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'var(--color-primary)',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/medicines/${medicine.id}`);
          toast.success("Medicine deleted successfully");
          fetchMedicines();
        } catch (err) {
          toast.error("Failed to delete medicine");
        }
      }
    });
  };

  const handleSave = async (savedMedicine: Medicine) => {
    try {
      if (currentMedicine) {
        // Edit
        await api.put(`/medicines/${savedMedicine.id}`, savedMedicine);
        toast.success("Medicine updated successfully");
      } else {
        // Add
        await api.post('/medicines', savedMedicine);
        toast.success("Medicine added successfully");
      }
      setIsFormOpen(false);
      fetchMedicines();
    } catch (err) {
      toast.error("An error occurred while saving");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map(d => d.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newHeaders = new Set(selectedIds);
    if (newHeaders.has(id)) {
      newHeaders.delete(id);
    } else {
      newHeaders.add(id);
    }
    setSelectedIds(newHeaders);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(amount);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    
    Swal.fire({
      title: 'Delete Multiple?',
      text: `Are you sure you want to delete ${selectedIds.size} medicines?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'var(--color-primary)',
      confirmButtonText: 'Yes, delete them!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Promise.all(Array.from(selectedIds).map(id => api.delete(`/medicines/${id}`)));
          toast.success(`${selectedIds.size} medicines deleted successfully`);
          setSelectedIds(new Set());
          fetchMedicines();
        } catch(err) {
          toast.error("Failed to delete some medicines");
        }
      }
    });
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/exports/medicines/excel', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `medicines_inventory.xlsx`;
      link.click();
    } catch (error) {
      toast.error("Export failed");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Medicines</h2>
            <p className="text-gray-500 mt-1">Manage pharmacy inventory, pricing, and stock alerts.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="hidden sm:flex items-center gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Medicine
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 border-b">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Search by name, generic, or ID..." 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {selectedIds.size} selected
                  </span>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                    <TableHead className="w-[50px] pl-4">
                      <Checkbox 
                        checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Medicine Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} className="p-0"><TableSkeleton rows={5} cols={7} /></TableCell></TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((medicine) => (
                      <TableRow key={medicine.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <TableCell className="pl-4">
                          <Checkbox 
                            checked={selectedIds.has(medicine.id)}
                            onCheckedChange={() => toggleSelect(medicine.id)}
                            aria-label={`Select ${medicine.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{medicine.name}</div>
                          <div className="text-xs text-gray-500">{medicine.genericName}</div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary/50 text-secondary-foreground">
                            {medicine.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-mono font-medium ${medicine.stock < 50 ? 'text-orange-500' : 'text-gray-900 dark:text-gray-100'}`}>
                            {medicine.stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatCurrency(medicine.sellingPrice)}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {medicine.expiryDate}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 relative" />}>
                              <MoreVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleView(medicine)}>
                                <Eye className="h-4 w-4 mr-2 text-gray-500" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(medicine)}>
                                <Edit className="h-4 w-4 mr-2 text-blue-500" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(medicine)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                              >
                                <Trash className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                        No medicines found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MedicineFormModal 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        medicine={currentMedicine} 
        onSave={handleSave} 
      />
      <MedicineViewModal 
        open={isViewOpen} 
        onOpenChange={setIsViewOpen} 
        medicine={currentMedicine} 
      />

    </AppLayout>
  );
}
