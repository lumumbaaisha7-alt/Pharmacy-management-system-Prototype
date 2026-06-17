import { useState, useEffect } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { FileDown, Printer, TrendingUp, AlertTriangle, Clock, CalendarDays, Loader2 } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { TableSkeleton } from "../../components/ui/TableSkeleton";
import api from "../../lib/api";

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any>({ daily: [], monthly: [] });
  const [topMedicines, setTopMedicines] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [valData, setValData] = useState<any>({ categories: [], grand_total: 0 });

  const CATEGORY_SALES_DATA = [
    { name: "Antibiotics", value: 45 },
    { name: "Painkillers", value: 25 },
    { name: "Vitamins", value: 15 },
    { name: "First Aid", value: 10 },
    { name: "Others", value: 5 },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, topMedRes, lowStockRes, expiringRes, valRes] = await Promise.all([
        api.get('/reports/sales'),
        api.get('/reports/top-medicines'),
        api.get('/reports/low-stock'),
        api.get('/reports/expiring-soon'),
        api.get('/reports/inventory-valuation'),
      ]);

      setSalesData({
        daily: salesRes.data.daily.map((d: any) => ({ time: new Date(d.date).toLocaleDateString(), sales: d.sales })),
        monthly: salesRes.data.monthly.map((d: any) => ({ name: d.month, revenue: d.revenue }))
      });
      setTopMedicines(topMedRes.data.map((m: any) => ({ ...m, category: 'General' })));
      setLowStock(lowStockRes.data.map((m: any) => ({ ...m, minStr: 10, supplier: 'Various' })));
      setExpiringSoon(expiringRes.data.map((m: any) => ({ ...m, expiry: new Date(m.expiry_date).toLocaleDateString(), batch: m.batch_number })));
      setValData(valRes.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    const activeTab = document.querySelector('[data-state="active"][role="tab"]')?.getAttribute('value');
    let url = '/exports/medicines/pdf';
    if (activeTab === 'sales') url = '/exports/sales/pdf';
    if (activeTab === 'inventory') url = '/exports/inventory/pdf';
    
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${activeTab || 'report'}.pdf`;
      link.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const handleExportExcel = async () => {
    const activeTab = document.querySelector('[data-state="active"][role="tab"]')?.getAttribute('value');
    let url = '/exports/medicines/excel';
    if (activeTab === 'sales') url = '/exports/sales/excel';
    
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${activeTab || 'report'}.xlsx`;
      link.click();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(amount);
  };

  const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#64748b'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
            <p className="text-gray-500 mt-1">Pharmacy performance, inventory status, and sales metrics.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2 print:hidden" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="outline" className="flex items-center gap-2 print:hidden" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4" /> Export PDF
            </Button>
            <Button className="flex items-center gap-2 print:hidden" onClick={handleExportExcel}>
              <FileDown className="h-4 w-4" /> Export Excel
            </Button>
          </div>
        </div>

        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex md:grid-cols-4 mb-4">
            <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
            <TabsTrigger value="top-items">Top Medicines</TabsTrigger>
            <TabsTrigger value="alerts">Expiry & Alerts</TabsTrigger>
          </TabsList>

          {/* SALES TAB */}
          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Today's Sales Trend</CardTitle>
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[250px] w-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="h-[250px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 dark:opacity-10" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                          tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`${formatCurrency(value)}`, "Sales"]}
                          labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Sales by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[250px] w-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <div className="h-[250px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={CATEGORY_SALES_DATA}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {CATEGORY_SALES_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                               formatter={(value) => [`${value}%`, "Share"]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                        {CATEGORY_SALES_DATA.map((cat, i) => (
                          <div key={cat.name} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-gray-600 dark:text-gray-400">{cat.name} ({cat.value}%)</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                 <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Monthly Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[250px] w-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="h-[250px] w-full mt-4">
                       <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData.monthly} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                          tickFormatter={(value) => `${value / 1000000}M`}
                        />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`${formatCurrency(value)}`, "Revenue"]}
                          cursor={{ fill: 'currentColor', opacity: 0.05 }}
                        />
                        <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TOP ITEMS TAB */}
          <TabsContent value="top-items">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Top Performing Medicines</CardTitle>
                <CardDescription>Highest revenue generating items this month.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                      <TableHead className="pl-6">Medicine Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right pr-6">Revenue Generated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} className="p-0"><TableSkeleton rows={5} cols={4} /></TableCell></TableRow>
                    ) : topMedicines.map((item, index) => (
                      <TableRow key={item.name} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <TableCell className="pl-6 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-3">
                           <div className="w-6 text-center text-gray-400 font-mono text-xs">{index + 1}</div>
                           {item.name}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary/50 text-secondary-foreground">
                             {item.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-gray-600 dark:text-gray-400">
                          {Number(item.sold).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right pr-6 font-mono font-semibold text-primary">
                          {formatCurrency(item.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ALERTS TAB */}
          <TabsContent value="alerts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              <Card className="border-red-100 dark:border-red-900/30">
                <CardHeader className="pb-3 bg-red-50/50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                       <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
                    </CardTitle>
                    <span className="text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-2 py-1 rounded-full">{loading ? '...' : lowStock.length} Items</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Item</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right pr-4">Min Reorder</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {loading ? (
                         <TableRow><TableCell colSpan={3} className="p-0"><TableSkeleton rows={3} cols={3} /></TableCell></TableRow>
                       ) : lowStock.map((item) => (
                        <TableRow key={item.id} className="hover:bg-red-50/50 dark:hover:bg-red-950/20">
                          <TableCell className="pl-4">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.supplier}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-mono font-bold text-red-600 dark:text-red-400">{item.stock}</span>
                          </TableCell>
                          <TableCell className="text-right pr-4 text-gray-500 font-mono text-xs">
                             {item.minStr}
                          </TableCell>
                        </TableRow>
                       ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-amber-100 dark:border-amber-900/30">
                <CardHeader className="pb-3 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                       <Clock className="h-4 w-4" /> Expiring Soon (Next 90 Days)
                    </CardTitle>
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-1 rounded-full">{loading ? '...' : expiringSoon.length} Items</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-4">Item</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right pr-4">Expiry Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {loading ? (
                         <TableRow><TableCell colSpan={4} className="p-0"><TableSkeleton rows={3} cols={4} /></TableCell></TableRow>
                       ) : expiringSoon.map((item) => (
                        <TableRow key={item.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
                          <TableCell className="pl-4 font-medium text-sm text-gray-900 dark:text-gray-100">
                             {item.name}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-gray-500">
                             {item.batch}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {item.stock}
                          </TableCell>
                          <TableCell className="text-right pr-4 font-medium text-amber-600 dark:text-amber-500 text-sm">
                             {item.expiry}
                          </TableCell>
                        </TableRow>
                       ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* INVENTORY TAB */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Inventory Valuation by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[300px] w-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={valData.categories} layout="vertical" margin={{ left: 40, top: 10, right: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="opacity-10" />
                          <XAxis type="number" axisLine={false} tickLine={false} hide />
                          <YAxis 
                            dataKey="category" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fill: 'currentColor', opacity: 0.7, fontSize: 12 }}
                          />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [formatCurrency(value), "Value"]}
                          />
                          <Bar dataKey="total_value" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={25} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Valuation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider">Total Inventory Value</p>
                    <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(valData.grand_total)}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-500 lowercase first-letter:uppercase">Category Breakdown</h4>
                    {valData.categories.map((c: any) => (
                      <div key={c.category} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{c.category}</span>
                        <span className="font-mono font-medium">{formatCurrency(c.total_value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Stock Distribution</CardTitle>
                  <CardDescription>Number of items tracked per category.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                        <TableHead className="pl-6">Category</TableHead>
                        <TableHead className="text-right">Total Items</TableHead>
                        <TableHead className="text-right pr-6">Value Contribution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {valData.categories.map((c: any) => (
                        <TableRow key={c.category}>
                          <TableCell className="pl-6 font-medium">{c.category}</TableCell>
                          <TableCell className="text-right font-mono">{c.item_count}</TableCell>
                          <TableCell className="text-right pr-6 font-mono">{formatCurrency(c.total_value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </AppLayout>
  );
}
