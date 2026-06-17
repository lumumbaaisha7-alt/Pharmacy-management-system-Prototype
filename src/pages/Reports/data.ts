export const DAILY_SALES_DATA = [
  { time: "08:00", sales: 120000, orders: 4 },
  { time: "10:00", sales: 350000, orders: 12 },
  { time: "12:00", sales: 420000, orders: 15 },
  { time: "14:00", sales: 280000, orders: 10 },
  { time: "16:00", sales: 580000, orders: 20 },
  { time: "18:00", sales: 850000, orders: 28 },
  { time: "20:00", sales: 450000, orders: 14 },
];

export const MONTHLY_SALES_DATA = [
  { name: "Jan", revenue: 8500000 },
  { name: "Feb", revenue: 9200000 },
  { name: "Mar", revenue: 10500000 },
  { name: "Apr", revenue: 9800000 },
  { name: "May", revenue: 11200000 },
  { name: "Jun", revenue: 12500000 },
];

export const CATEGORY_SALES_DATA = [
  { name: "Antibiotics", value: 45 },
  { name: "Painkillers", value: 25 },
  { name: "Vitamins", value: 15 },
  { name: "First Aid", value: 10 },
  { name: "Others", value: 5 },
];

export const TOP_MEDICINES = [
  { name: "Amoxicillin 500mg", category: "Antibiotics", sold: 12450, revenue: 31125000 },
  { name: "Paracetamol 500mg", category: "Analgesics", sold: 8500, revenue: 4250000 },
  { name: "Vitamin C 1000mg", category: "Vitamins", sold: 6200, revenue: 11160000 },
  { name: "Cough Syrup 100ml", category: "Respiratory", sold: 4100, revenue: 16400000 },
  { name: "Ibuprofen 400mg", category: "NSAIDs", sold: 3800, revenue: 3420000 },
  { name: "Azithromycin 500mg", category: "Antibiotics", sold: 2100, revenue: 8400000 },
];

export const LOW_STOCK_DATA = [
  { id: "MED-012", name: "Insulin Glargine 100IU", stock: 2, minStr: 10, supplier: "PharmaCorp Inc." },
  { id: "MED-045", name: "Losartan 50mg", stock: 5, minStr: 20, supplier: "HealthCare Ltd" },
  { id: "MED-089", name: "Omeprazole 20mg", stock: 8, minStr: 50, supplier: "Generic Meds" },
  { id: "MED-102", name: "Ceftriaxone 1g Injection", stock: 12, minStr: 30, supplier: "PharmaCorp Inc." },
];

export const EXPIRING_SOON_DATA = [
  { id: "MED-067", name: "Amoxicillin Suspension 125mg", batch: "B-8821", expiry: "2026-07-15", stock: 45 },
  { id: "MED-023", name: "Cough Syrup Pediatric", batch: "C-1120", expiry: "2026-07-28", stock: 22 },
  { id: "MED-091", name: "Multivitamin Drops", batch: "M-4451", expiry: "2026-08-05", stock: 18 },
  { id: "MED-110", name: "Salbutamol Inhaler", batch: "S-9912", expiry: "2026-08-20", stock: 12 },
];
