export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  batchNumber: string;
  barcode: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate: string;
}

export type InventoryActionType = 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';

export interface InventoryTransaction {
  id: string;
  date: string;
  medicineId: string;
  medicineName: string;
  type: InventoryActionType;
  quantity: number;
  reason: string;
  performer: string;
  reference?: string;
}
