// Demo Dashboard Data

export const TODAY_SALES = 845000;
export const MONTHLY_SALES = 4250000;
export const TOTAL_MEDICINES = 356;
export const LOW_STOCK_COUNT = 23;
export const EXPIRING_SOON_COUNT = 12;
export const SUPPLIERS_COUNT = 15;
export const CUSTOMERS_COUNT = 1248;

export const RECENT_SALES = [
  { id: 'INV-0001', customer: 'John Doe', items: 3, total: 45000, payment: 'Cash', time: '10:30 AM' },
  { id: 'INV-0002', customer: 'Alice Smith', items: 2, total: 28000, payment: 'Card', time: '10:15 AM' },
  { id: 'INV-0003', customer: 'Robert Johnson', items: 5, total: 72000, payment: 'Cash', time: '09:50 AM' },
  { id: 'INV-0004', customer: 'Mary Williams', items: 1, total: 15000, payment: 'Mobile', time: '09:20 AM' },
  { id: 'INV-0005', customer: 'James Brown', items: 4, total: 63000, payment: 'Card', time: '08:45 AM' },
];

export const LOW_STOCK_ALERTS = [
  { id: '1', name: 'Amoxicillin 500mg', stock: 8 },
  { id: '2', name: 'Paracetamol 500mg', stock: 5 },
  { id: '3', name: 'Cotrimoxazole', stock: 6 },
  { id: '4', name: 'Diclofenac 50mg', stock: 7 },
  { id: '5', name: 'ORS', stock: 9 },
];

export const EXPIRY_ALERTS = [
  { id: '1', name: 'Amoxicillin 500mg', expireDate: '25/05/2026', daysLeft: 7 },
  { id: '2', name: 'Paracetamol 500mg', expireDate: '28/05/2026', daysLeft: 10 },
  { id: '3', name: 'Cotrimoxazole', expireDate: '30/05/2026', daysLeft: 12 },
  { id: '4', name: 'Metronidazole 400mg', expireDate: '02/06/2026', daysLeft: 15 },
  { id: '5', name: 'Vitamin C 1000mg', expireDate: '05/06/2026', daysLeft: 18 },
];

export const CHART_DATA_SALES = [
  { day: 'Mon', sales: 400000 },
  { day: 'Tue', sales: 300000 },
  { day: 'Wed', sales: 550000 },
  { day: 'Thu', sales: 450000 },
  { day: 'Fri', sales: 700000 },
  { day: 'Sat', sales: 900000 },
  { day: 'Sun', sales: 845000 },
];
