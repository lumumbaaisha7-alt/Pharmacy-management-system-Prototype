import { InventoryTransaction } from '../../types';

export const INVENTORY_HISTORY_DATA: InventoryTransaction[] = [
  {
    id: "TXN-1001",
    date: "2026-06-17T09:30:00",
    medicineId: "MED-001",
    medicineName: "Amoxicillin 500mg",
    type: "IN",
    quantity: 500,
    reason: "New Stock Received",
    performer: "System Admin",
    reference: "PO-2026-06-001"
  },
  {
    id: "TXN-1002",
    date: "2026-06-16T14:20:00",
    medicineId: "MED-002",
    medicineName: "Paracetamol 500mg",
    type: "OUT",
    quantity: 50,
    reason: "Bulk Sale",
    performer: "System Admin",
    reference: "INV-0005"
  },
  {
    id: "TXN-1003",
    date: "2026-06-15T11:15:00",
    medicineId: "MED-003",
    medicineName: "Vitamin C 1000mg",
    type: "ADJUST",
    quantity: -5,
    reason: "Damaged Items Discarded",
    performer: "John Doe",
  },
  {
    id: "TXN-1004",
    date: "2026-06-14T08:45:00",
    medicineId: "MED-004",
    medicineName: "Diclofenac 50mg",
    type: "TRANSFER",
    quantity: 100,
    reason: "Transfer to Branch B",
    performer: "System Admin",
    reference: "TRF-001"
  },
  {
    id: "TXN-1005",
    date: "2026-06-14T16:10:00",
    medicineId: "MED-005",
    medicineName: "Metronidazole 400mg",
    type: "IN",
    quantity: 200,
    reason: "Supplier Delivery",
    performer: "Alice Smith",
    reference: "PO-2026-06-002"
  }
];
