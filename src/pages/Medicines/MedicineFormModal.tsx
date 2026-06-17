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
import { Medicine } from "../../types";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: Medicine | null;
  onSave: (medicine: Medicine) => void;
}

export function MedicineFormModal({ open, onOpenChange, medicine, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<Medicine>>({});

  useEffect(() => {
    if (medicine) {
      setFormData(medicine);
    } else {
      setFormData({
        id: "",
        name: "",
        genericName: "",
        category: "",
        batchNumber: "",
        barcode: "",
        stock: 0,
        purchasePrice: 0,
        sellingPrice: 0,
        expiryDate: ""
      });
    }
  }, [medicine, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // basic validation could go here
    onSave({
      ...(formData as Medicine),
      id: formData.id || `MED-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{medicine ? "Edit Medicine" : "Add New Medicine"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medicine Name</Label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genericName">Generic Name</Label>
              <Input id="genericName" name="genericName" value={formData.genericName || ''} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(val) => handleSelectChange(val, "category")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                  <SelectItem value="Analgesics">Analgesics</SelectItem>
                  <SelectItem value="Vitamins">Vitamins</SelectItem>
                  <SelectItem value="NSAIDs">NSAIDs</SelectItem>
                  <SelectItem value="Antacids">Antacids</SelectItem>
                  <SelectItem value="Antihistamines">Antihistamines</SelectItem>
                  <SelectItem value="Bronchodilators">Bronchodilators</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input id="batchNumber" name="batchNumber" value={formData.batchNumber || ''} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input id="barcode" name="barcode" value={formData.barcode || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Initial Stock</Label>
              <Input id="stock" name="stock" type="number" min="0" value={formData.stock || 0} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price (TZS)</Label>
              <Input id="purchasePrice" name="purchasePrice" type="number" min="0" value={formData.purchasePrice || 0} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price (TZS)</Label>
              <Input id="sellingPrice" name="sellingPrice" type="number" min="0" value={formData.sellingPrice || 0} onChange={handleChange} required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input id="expiryDate" name="expiryDate" type="date" value={formData.expiryDate || ''} onChange={handleChange} required />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{medicine ? "Update" : "Save"} Medicine</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
