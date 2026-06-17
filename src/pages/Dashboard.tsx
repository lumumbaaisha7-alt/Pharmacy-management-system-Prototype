import { useEffect, useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingCart, 
  Package, 
  Users, 
  AlertTriangle,
  Clock,
  TrendingUp,
  MoreVertical,
  Building2,
  Activity,
  Loader2
} from "lucide-react";
import { AppLayout } from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ScrollArea } from "../components/ui/scroll-area";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import Swal from "sweetalert2";
import api from "../lib/api";

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    todaySales: 0,
    monthlySales: 0,
    totalMedicines: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
    suppliersCount: 15, // Mocked for now
    customersCount: 1248, // Mocked for now
    recentSales: [],
    lowStockAlerts: [],
    expiryAlerts: [],
    chartDataSales: [
      { day: 'Mon', sales: 400000 },
      { day: 'Tue', sales: 300000 },
      { day: 'Wed', sales: 550000 },
      { day: 'Thu', sales: 450000 },
      { day: 'Fri', sales: 700000 },
      { day: 'Sat', sales: 900000 },
      { day: 'Sun', sales: 845000 },
    ],
    inventoryStatus: [
      { name: 'In Stock', value: 300 },
      { name: 'Low Stock', value: 45 },
      { name: 'Out of Stock', value: 11 }
    ],
    topMedicines: [
      { name: 'Paracetamol', sales: 400 },
      { name: 'Amoxicillin', sales: 300 },
      { name: 'Vitamin C', sales: 200 },
      { name: 'Diclofenac', sales: 150 },
    ]
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats((prev: any) => ({
        ...prev,
        todaySales: res.data.todaySales,
        monthlySales: res.data.monthlySales,
        totalMedicines: res.data.totalMedicines,
        lowStockCount: res.data.lowStockCount,
        recentSales: res.data.recentSales,
        lowStockAlerts: res.data.lowStockAlerts,
        topMedicines: res.data.topMedicines || prev.topMedicines
      }));
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleTestAlert = () => {
    Swal.fire({
      title: 'Generate Report?',
      text: "Do you want to generate the end of day summary?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary)',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, generate it!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Generated!',
          'Your report is ready to download.',
          'success'
        )
      }
    });
  };

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
  const INVENTORY_STATUS = stats.inventoryStatus;

  const TOP_MEDICINES = stats.topMedicines;

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back, Admin! 👋
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Here is what's happening at your pharmacy today.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Compact KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          
          <Card className="col-span-2 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">Today's Sales</p>
                <h3 className="text-xl font-bold font-mono tracking-tight text-gray-900 dark:text-white truncate">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : formatCurrency(stats.todaySales)}
                </h3>
                {!loading && (
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-green-600 dark:text-green-400">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>+18%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
               <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-gray-500">Monthly</p>
                 <TrendingUp className="h-4 w-4 text-emerald-500" />
               </div>
               <h3 className="text-base font-bold font-mono truncate">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : formatCurrency(stats.monthlySales)}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
               <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-gray-500">Medicines</p>
                 <Package className="h-4 w-4 text-blue-500" />
               </div>
               <h3 className="text-lg font-bold">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.totalMedicines}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
               <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-gray-500">Customers</p>
                 <Users className="h-4 w-4 text-purple-500" />
               </div>
               <h3 className="text-lg font-bold">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.customersCount}</h3>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
               <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-gray-500">Suppliers</p>
                 <Building2 className="h-4 w-4 text-indigo-500" />
               </div>
               <h3 className="text-lg font-bold">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.suppliersCount}</h3>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200">
            <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
               <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-orange-600">Low Stock</p>
                 <AlertTriangle className="h-4 w-4 text-orange-500" />
               </div>
               <h3 className="text-lg font-bold text-orange-700">{loading ? <Loader2 className="h-4 w-4 animate-spin text-orange-500" /> : stats.lowStockCount}</h3>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
            <CardContent className="p-4 flex flex-col justify-center h-full gap-2">
               <div className="flex justify-between items-start">
                 <p className="text-xs font-medium text-red-600">Expiring</p>
                 <Clock className="h-4 w-4 text-red-500" />
               </div>
               <h3 className="text-lg font-bold text-red-700">{loading ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : stats.expiringSoonCount}</h3>
            </CardContent>
          </Card>

        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart Section */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold">Sales Trend</CardTitle>
                <p className="text-xs text-gray-500 mt-1">Daily revenue performance</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                This Week
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartDataSales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${value / 1000}k`}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                      formatter={(value: number) => [formatCurrency(value), 'Sales']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="var(--color-primary)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                      activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-primary)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Inventory Pie */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={INVENTORY_STATUS}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {INVENTORY_STATUS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {INVENTORY_STATUS.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-[10px] text-gray-500">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleTestAlert} className="h-auto py-2 flex flex-col gap-1 border-primary/20 hover:bg-primary/5 hover:border-primary">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-[10px]">Generate</span>
                </Button>
                <Button variant="outline" className="h-auto py-2 flex flex-col gap-1 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20">
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                  <span className="text-[10px]">New POS</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Tables & Top Selling */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
          
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Recent Sales</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-primary">View All &rarr;</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentSales.map((sale: any) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium text-xs">{sale.id}</TableCell>
                      <TableCell className="text-xs">{sale.customer}</TableCell>
                      <TableCell className="text-right text-xs font-mono">{formatCurrency(sale.total)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <CardTitle className="text-sm font-semibold">Low Stock Alerts</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <ScrollArea className="h-[140px] px-4">
                  <div className="space-y-3">
                    {stats.lowStockAlerts.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-300 truncate pr-4 text-xs">{item.name}</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-500 shrink-0 text-xs">{item.stock} left</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Top Medicines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {TOP_MEDICINES.map((med, i) => (
                    <div key={med.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-400">0{i+1}</span>
                        <span className="text-sm">{med.name}</span>
                      </div>
                      <span className="text-xs font-medium">{med.sales} Qty</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
