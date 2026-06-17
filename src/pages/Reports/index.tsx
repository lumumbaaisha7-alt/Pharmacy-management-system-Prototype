import { useState } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { FileDown, Printer, TrendingUp, AlertTriangle, Clock, CalendarDays } from "lucide-react";
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
import { 
  DAILY_SALES_DATA, 
  MONTHLY_SALES_DATA, 
  CATEGORY_SALES_DATA, 
  TOP_MEDICINES,
  LOW_STOCK_DATA,
  EXPIRING_SOON_DATA
} from "./data";

export function Reports() {
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
            <Button variant="outline" className="flex items-center gap-2 print:hidden">
              <FileDown className="h-4 w-4" /> Export PDF
            </Button>
            <Button className="flex items-center gap-2 print:hidden">
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
                  <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={DAILY_SALES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Sales by Category</CardTitle>
                </CardHeader>
                <CardContent>
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
                  <div className="h-[250px] w-full mt-4">
                     <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MONTHLY_SALES_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                    {TOP_MEDICINES.map((item, index) => (
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
                          {item.sold.toLocaleString()}
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
                    <span className="text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-2 py-1 rounded-full">{LOW_STOCK_DATA.length} Items</span>
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
                       {LOW_STOCK_DATA.map((item) => (
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
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-1 rounded-full">{EXPIRING_SOON_DATA.length} Items</span>
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
                       {EXPIRING_SOON_DATA.map((item) => (
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
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Inventory Valuation Report</CardTitle>
                <CardDescription>Current stock value across all categories.</CardDescription>
              </CardHeader>
              <CardContent className="h-40 flex items-center justify-center text-gray-400">
                <p>Data visualization for inventory valuation would appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </AppLayout>
  );
}
