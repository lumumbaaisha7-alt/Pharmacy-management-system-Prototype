import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Medicine, InventoryActionType, InventoryTransaction } from "../../types";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicines: Medicine[];
  onSave: (transaction: Omit<InventoryTransaction, "id" | "date" | "performer">) => void;
}

export function StockActionModal({ open, onOpenChange, medicines, onSave }: Props) {
  const [type, setType] = useState<InventoryActionType>("IN");
  const [medicineId, setMedicineId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (open) {
      setType("IN");
      setMedicineId("");
      setQuantity(1);
      setReason("");
      setReference("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineId) return;

    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;

    onSave({
      type,
      medicineId,
      medicineName: med.name,
      quantity,
      reason,
      reference
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Stock Action</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          <div className="space-y-2">
            <Label>Action Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {(["IN", "OUT", "ADJUST", "TRANSFER"] as InventoryActionType[]).map((t) => (
                <div 
                  key={t}
                  onClick={() => setType(t)}
                  className={`text-center py-2 px-1 rounded-md border cursor-pointer text-xs font-medium transition-colors ${
                    type === t 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicineId">Select Medicine</Label>
            <Select value={medicineId} onValueChange={setMedicineId}>
              <SelectTrigger>
                <SelectValue placeholder="Search or select medicine..." />
              </SelectTrigger>
              <SelectContent>
                {medicines.map((med) => (
                  <SelectItem key={med.id} value={med.id}>
                    {med.name} - (Stock: {med.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input 
                id="reference" 
                value={reference} 
                onChange={(e) => setReference(e.target.value)} 
                placeholder={type === 'IN' ? 'PO-12345' : 'INV-67890'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason / Remarks</Label>
            <Input 
              id="reason" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder="E.g., New delivery, Damages, Expiry"
              required 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Action</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
