import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Medicine } from "../../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: Medicine | null;
}

export function MedicineViewModal({ open, onOpenChange, medicine }: Props) {
  if (!medicine) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Medicine Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xl">
              {medicine.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold">{medicine.name}</h3>
              <p className="text-sm text-gray-500">{medicine.genericName}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-gray-500">Medicine ID</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{medicine.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">Category</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{medicine.category}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-gray-500">Batch Number</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{medicine.batchNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">Expiry Date</p>
              <p className="font-medium text-red-600 dark:text-red-400">{medicine.expiryDate}</p>
            </div>

            <div className="space-y-1">
              <p className="text-gray-500">Purchase Price</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(medicine.purchasePrice)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">Selling Price</p>
              <p className="font-medium text-green-600 dark:text-green-500">{formatCurrency(medicine.sellingPrice)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-gray-500">Current Stock</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{medicine.stock}</p>
            </div>
            <div className="space-y-1">
              <p className="text-gray-500">Barcode</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 font-mono">{medicine.barcode}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
