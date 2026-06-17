import { useState, useMemo } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Plus, Search, Filter, History, PackageOpen, ArrowRightLeft, ShieldAlert } from "lucide-react";
import { INVENTORY_HISTORY_DATA } from "./data";
import { InventoryTransaction, InventoryActionType } from "../../types";
import { MEDICINES_DATA } from "../Medicines/data";
import { StockActionModal } from "./StockActionModal";
import { toast } from "sonner";
import { format } from "date-fns";

export function Inventory() {
  const [history, setHistory] = useState<InventoryTransaction[]>(INVENTORY_HISTORY_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [isStockActionOpen, setIsStockActionOpen] = useState(false);

  // Pagination for history
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredHistory = useMemo(() => {
    return history.filter(item => 
      item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [history, searchTerm]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(start, start + itemsPerPage);
  }, [filteredHistory, currentPage]);

  const handleStockActionSave = (data: Omit<InventoryTransaction, "id" | "date" | "performer">) => {
    const newTxn: InventoryTransaction = {
      ...data,
      id: `TXN-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      performer: "System Admin"
    };

    setHistory(prev => [newTxn, ...prev]);
    setIsStockActionOpen(false);
    toast.success(`Successfully processed ${data.type} action for ${data.medicineName}`);
  };

  const getActionColor = (type: InventoryActionType) => {
    switch(type) {
      case 'IN': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'OUT': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
      case 'ADJUST': return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
      case 'TRANSFER': return 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
            <p className="text-gray-500 mt-1">Manage stock levels, perform adjustments, and track history.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsStockActionOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Stock Action
            </Button>
          </div>
        </div>

        {/* Inventory Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
               <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-gray-500">Total Movements</p>
                 <History className="h-4 w-4 text-primary" />
               </div>
               <h3 className="text-xl font-bold font-mono">{history.length}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
               <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-gray-500">Stock In (Monthly)</p>
                 <PackageOpen className="h-4 w-4 text-emerald-500" />
               </div>
               <h3 className="text-xl font-bold font-mono">1,240</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
               <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-gray-500">Stock Out (Monthly)</p>
                 <ArrowRightLeft className="h-4 w-4 text-blue-500" />
               </div>
               <h3 className="text-xl font-bold font-mono">850</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
               <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-gray-500">Value Adjusted</p>
                 <ShieldAlert className="h-4 w-4 text-amber-500" />
               </div>
               <h3 className="text-xl font-bold font-mono">12</h3>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card>
          <CardHeader className="p-4 border-b">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
              <CardTitle className="text-lg">Inventory History</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Search history..." 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                    <TableHead className="w-[180px]">Date</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Reason / Ref</TableHead>
                    <TableHead>Performer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHistory.length > 0 ? (
                    paginatedHistory.map((txn) => (
                      <TableRow key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                          {format(new Date(txn.date), 'dd MMM yyyy, HH:mm')}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{txn.id}</TableCell>
                        <TableCell>
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{txn.medicineName}</div>
                          <div className="text-xs text-gray-500">{txn.medicineId}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] uppercase font-bold border ${getActionColor(txn.type)}`}>
                            {txn.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          <span className={txn.type === 'OUT' ? 'text-blue-600' : txn.type === 'IN' ? 'text-emerald-600' : txn.type === 'ADJUST' && txn.quantity < 0 ? 'text-red-500' : ''}>
                            {txn.type === 'OUT' || (txn.type === 'ADJUST' && txn.quantity < 0) ? '-' : '+'}{Math.abs(txn.quantity)}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">
                          <div className="text-gray-900 dark:text-gray-100" title={txn.reason}>{txn.reason}</div>
                          {txn.reference && <div className="text-gray-500 mt-0.5">Ref: {txn.reference}</div>}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                          {txn.performer}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                        No inventory history found.
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length}
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

      <StockActionModal 
        open={isStockActionOpen} 
        onOpenChange={setIsStockActionOpen} 
        medicines={MEDICINES_DATA}
        onSave={handleStockActionSave}
      />

    </AppLayout>
  );
}
