import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "../../components/ui/sheet";
import { Search, Barcode, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Receipt, Printer, X, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Medicine } from "../../types";
import { CheckoutModal } from "./CheckoutModal";
import { ReceiptModal } from "./ReceiptModal";
import Swal from "sweetalert2";
import api from "../../lib/api";

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [barcode, setBarcode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastReceiptData, setLastReceiptData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "Mobile">("Cash");

  const [medicinesData, setMedicinesData] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/medicines').then(res => {
      setMedicinesData(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      toast.error("Failed to load medicines");
      setLoading(false);
    });
  }, []);

  const categories = ["All", ...Array.from(new Set(medicinesData.map(m => m.category)))];

  const filteredMedicines = useMemo(() => {
    return medicinesData.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (m.genericName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
      const matchesBarcode = barcode === "" || m.barcode === barcode;
      return matchesSearch && matchesCategory && matchesBarcode;
    });
  }, [searchTerm, selectedCategory, barcode, medicinesData]);

  // Pricing
  const subtotal = cart.reduce((sum, item) => sum + item.medicine.sellingPrice * item.quantity, 0);
  const taxRate = 0.18; // 18% VAT included or separated, let's treat it as separated for demo
  const discount = 0;
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(amount);
  };

  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.medicine.id === medicine.id);
      if (existing) {
        if (existing.quantity >= medicine.stock) {
          toast.error(`Only ${medicine.stock} units available in stock.`);
          return prev;
        }
        return prev.map(item => item.medicine.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { medicine, quantity: 1 }];
    });
    // Little feedback
    toast.success(`Added ${medicine.name}`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.medicine.id === id) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return item; // Don't drop to 0 here, use remove
        if (newQuantity > item.medicine.stock) {
          toast.error(`Only ${item.medicine.stock} units available.`);
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.medicine.id !== id));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode) return;
    
    const medicine = medicinesData.find(m => m.barcode === barcode);
    if (medicine) {
      addToCart(medicine);
      setBarcode("");
    } else {
      toast.error("Product with this barcode not found");
    }
  };

  const clearCart = () => {
    Swal.fire({
      title: 'Clear Cart?',
      text: "Are you sure you want to remove all items?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'var(--color-primary)',
      confirmButtonText: 'Yes, clear it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setCart([]);
        toast.info("Cart cleared");
      }
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckoutOpen(true);
  };

  // Reusable components
  const CartItemsList = () => (
    <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl p-3 border border-gray-200 dark:border-gray-800">
      {cart.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <ShoppingBag className="h-12 w-12 mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium">Cart is empty</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cart.map(item => (
            <div key={item.medicine.id} className="bg-white dark:bg-gray-950 p-3 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 flex gap-4 relative group animate-in fade-in zoom-in-95 duration-200">
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg shrink-0 border border-emerald-100 dark:border-emerald-800">
                {item.medicine.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="font-semibold text-sm truncate pr-6 text-gray-900 dark:text-gray-100">{item.medicine.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono text-sm font-bold">{formatCurrency(item.medicine.sellingPrice)}</span>
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                    <button onClick={() => updateQuantity(item.medicine.id, -1)} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm transition active:scale-95 text-gray-600 dark:text-gray-300">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center text-gray-900 dark:text-gray-100">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.medicine.id, 1)} className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md shadow-sm transition active:scale-95 text-gray-600 dark:text-gray-300">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => removeFromCart(item.medicine.id)}
                className="absolute -top-2 -right-2 p-1.5 text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full opacity-0 group-hover:opacity-100 transition-all md:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const CheckoutSummaryPanel = () => (
    <Card className="flex flex-col h-full shadow-lg rounded-2xl border-primary/20 bg-white dark:bg-gray-900">
      <CardHeader className="pb-4 px-5 pt-5 border-b bg-primary/5 rounded-t-2xl">
        <CardTitle className="text-lg flex justify-between items-center font-bold">
          <span>Order Summary</span>
          <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono px-2 py-0.5 rounded-full">{cart.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col mt-2">
        <div className="space-y-4 flex-1 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Discount</span>
            <span className="font-mono font-medium text-gray-900 dark:text-gray-100">-{formatCurrency(discount)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>VAT (18%)</span>
            <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{formatCurrency(tax)}</span>
          </div>
          <Separator className="my-4 border-gray-200 dark:border-gray-800 text-gray-100 dark:text-gray-800" />
          <div className="flex justify-between font-bold text-xl px-2 py-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 items-center shadow-inner">
            <span className="text-gray-700 dark:text-gray-300">Total</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 text-2xl">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Method</h4>
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant={paymentMethod === "Cash" ? "default" : "outline"}
                className={`h-20 flex flex-col gap-2 rounded-xl transition-all ${paymentMethod === 'Cash' ? 'shadow-md shadow-primary/20 ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900' : 'hover:border-primary/50 text-gray-500'}`}
                onClick={() => setPaymentMethod("Cash")}
              >
                <Banknote className="h-6 w-6" />
                <span className="text-xs font-semibold tracking-wide">Cash</span>
              </Button>
              <Button 
                variant={paymentMethod === "Card" ? "default" : "outline"}
                className={`h-20 flex flex-col gap-2 rounded-xl transition-all ${paymentMethod === 'Card' ? 'shadow-md shadow-primary/20 ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900' : 'hover:border-primary/50 text-gray-500'}`}
                onClick={() => setPaymentMethod("Card")}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-xs font-semibold tracking-wide">Card</span>
              </Button>
              <Button 
                variant={paymentMethod === "Mobile" ? "default" : "outline"}
                className={`h-20 flex flex-col gap-2 rounded-xl transition-all ${paymentMethod === 'Mobile' ? 'shadow-md shadow-primary/20 ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900' : 'hover:border-primary/50 text-gray-500'}`}
                onClick={() => setPaymentMethod("Mobile")}
              >
                <Smartphone className="h-6 w-6" />
                <span className="text-xs font-semibold tracking-wide">Mobile</span>
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="icon" className="w-14 h-14 rounded-xl items-center justify-center shrink-0 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:hover:bg-red-950 dark:hover:border-red-800 transition shadow-sm" onClick={clearCart} disabled={cart.length === 0}>
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button 
              className="flex-1 h-12 text-lg font-bold shadow-lg shadow-primary/25"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Pay {formatCurrency(total)}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      {/* Container optimized for max space. Adjusting padding to be slightly less on large screens for POS */}
      <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-4 lg:gap-6 w-full -mt-2 md:-mt-4">
        
        {/* LEFT COLUMN: Search & Products (6/12 on large screens) */}
        <div className="flex-1 lg:w-1/2 xl:w-7/12 flex flex-col min-h-[50vh]">
          {/* Controls Header */}
          <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border shadow-sm mb-4 space-y-3 shrink-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search medicines..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-gray-50 dark:bg-gray-900 border-transparent focus-visible:ring-1"
                />
              </div>
              <form onSubmit={handleBarcodeSubmit} className="relative w-1/3 min-w-[120px]">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Barcode..." 
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="pl-9 bg-gray-50 dark:bg-gray-900 border-transparent focus-visible:ring-1 font-mono text-xs"
                />
              </form>
            </div>
            
            {/* Categories Rail */}
            <ScrollArea className="w-full whitespace-nowrap pb-2 -mb-2">
              <div className="flex w-max space-x-2 p-1">
                {categories.map(cat => (
                  <Badge 
                    key={cat} 
                    variant={selectedCategory === cat ? "default" : "secondary"}
                    className={`cursor-pointer px-3 py-1.5 transition-all text-xs font-semibold ${selectedCategory === cat ? 'shadow-md shadow-primary/20' : 'hover:bg-primary/10'}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-auto min-h-0 pr-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-20 lg:pb-4">
              {filteredMedicines.map(medicine => (
                <Card 
                  key={medicine.id} 
                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-95 group overflow-hidden flex flex-col h-[150px]"
                  onClick={() => addToCart(medicine)}
                >
                  <CardContent className="p-3 flex flex-col h-full relative">
                    {medicine.stock < 10 && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                        Low Stock: {medicine.stock}
                      </div>
                    )}
                    <div className="h-10 w-10 bg-gray-50 dark:bg-gray-900 rounded-lg mb-2 flex items-center justify-center text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                      <Barcode className="h-5 w-5 opacity-50" />
                    </div>
                    <h3 className="font-semibold text-xs leading-tight line-clamp-2 mb-1 flex-1">{medicine.name}</h3>
                    <div className="text-primary font-mono font-bold text-sm mt-auto">
                      {formatCurrency(medicine.sellingPrice)}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredMedicines.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400">
                  <p>No medicines found matching criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DESKTOP RIGHT COLUMNS: Center (Cart) & Right (Summary) */}
        <div className="hidden lg:flex w-1/2 xl:w-5/12 gap-4 xl:gap-6 min-h-[50vh]">
          {/* Cart Column */}
          <div className="flex flex-col flex-1 h-full">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <ShoppingBag className="h-4 w-4" /> Selected Items ({cart.length})
            </h3>
            <CartItemsList />
          </div>

          {/* Summary Column */}
          <div className="w-[280px] xl:w-[320px] shrink-0 h-full">
            <CheckoutSummaryPanel />
          </div>
        </div>

        {/* MOBILE FLOATING CART BUTTON */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40">
            <Sheet>
              <SheetTrigger render={<Button className="w-full h-14 rounded-full shadow-2xl shadow-primary/40 flex justify-between px-6 text-lg" />}>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>View Cart ({cart.reduce((s,i)=>s+i.quantity, 0)})</span>
                </div>
                <span className="font-mono">{formatCurrency(total)}</span>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col rounded-t-3xl border-t shadow-2xl">
                <SheetHeader className="p-4 border-b pt-6">
                  <SheetTitle className="text-left flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Current Order
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-auto p-4 bg-gray-50/50">
                  <CartItemsList />
                </div>
                <div className="p-4 bg-white dark:bg-gray-950 border-t pb-8">
                  <CheckoutSummaryPanel />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

      </div>

      <CheckoutModal 
        open={isCheckoutOpen} 
        onOpenChange={setIsCheckoutOpen}
        total={total}
        paymentMethod={paymentMethod}
        onComplete={async (receiptData) => {
          setIsCheckoutOpen(false);
          try {
            const res = await api.post('/sales', {
              cashierId: 'current-user', 
              subtotal, 
              tax, 
              discount: 0, 
              total, 
              paymentMethod: receiptData.method, 
              amountGiven: receiptData.amountGiven || total, 
              changeGiven: receiptData.change || 0,
              items: cart.map(item => ({
                medicineId: item.medicine.id,
                medicineName: item.medicine.name,
                quantity: item.quantity,
                unitPrice: item.medicine.sellingPrice,
                totalPrice: item.medicine.sellingPrice * item.quantity
              }))
            });

            setLastReceiptData({
              receiptNumber: res.data.receiptNumber || `INV-${Math.floor(Math.random() * 10000)}`,
              cart: [...cart],
              total,
              subtotal,
              tax,
              paymentMethod: receiptData.method,
              change: receiptData.change,
              amountGiven: receiptData.amountGiven || total
            });
            setCart([]);
            toast.success("Transaction Complete");
            setIsReceiptOpen(true);
          } catch(err) {
            toast.error("Checkout failed, try again");
          }
        }}
      />

      {lastReceiptData && (
        <ReceiptModal
          open={isReceiptOpen}
          onOpenChange={setIsReceiptOpen}
          {...lastReceiptData}
        />
      )}

    </AppLayout>
  );
}

const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
    <circle cx="8" cy="21" r="1"/>
    <circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);
