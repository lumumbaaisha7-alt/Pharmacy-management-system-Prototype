import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { CartItem } from "./index";
import { format } from "date-fns";
import { Printer } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  paymentMethod: string;
  change: number;
  amountGiven: number;
}

export function ReceiptModal({ 
  open, 
  onOpenChange, 
  cart, 
  total, 
  subtotal, 
  tax, 
  paymentMethod, 
  change,
  amountGiven
}: Props) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] print:max-w-none print:w-full print:m-0 print:p-0 print:shadow-none print:border-none my-paper-receipt">
        <DialogHeader className="print:hidden">
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>
        
        {/* Printable Receipt Area */}
        <div className="p-6 bg-white text-black font-mono text-sm print:p-0" id="print-area">
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest">MediCare Pharmacy</h2>
            <p className="text-xs">123 Health Ave, Medical District</p>
            <p className="text-xs">Tel: +255 123 456 789</p>
            <p className="text-xs">TIN: 123-456-789</p>
          </div>

          <div className="flex justify-between text-xs mb-4 pb-4 border-b border-dashed border-gray-300">
            <div>
              <p>RCPT: #R-{Math.floor(Math.random() * 100000)}</p>
              <p>CASHIER: Admin</p>
            </div>
            <div className="text-right">
              <p>{format(new Date(), 'dd/MM/yy HH:mm')}</p>
              <p>POS 1</p>
            </div>
          </div>

          <table className="w-full text-xs mb-4">
            <thead>
              <tr className="border-b border-dashed border-gray-300">
                <th className="text-left pb-1">ITEM</th>
                <th className="text-center pb-1">QTY</th>
                <th className="text-right pb-1">PRICE</th>
                <th className="text-right pb-1">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, i) => (
                <tr key={i} className="align-top">
                  <td className="pt-2 pr-1">{item.medicine.name}</td>
                  <td className="pt-2 text-center">{item.quantity}</td>
                  <td className="pt-2 text-right">{formatCurrency(item.medicine.sellingPrice)}</td>
                  <td className="pt-2 text-right">{formatCurrency(item.medicine.sellingPrice * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-gray-300 pt-2 space-y-1 mb-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (18%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-300">
              <span>TOTAL</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 pt-4 space-y-1 text-sm mb-8">
            <div className="flex justify-between">
              <span>Payment ({paymentMethod})</span>
              <span>{formatCurrency(paymentMethod === "Cash" ? amountGiven : total)}</span>
            </div>
            {paymentMethod === "Cash" && (
              <div className="flex justify-between">
                <span>Change</span>
                <span>{formatCurrency(change)}</span>
              </div>
            )}
          </div>

          <div className="text-center text-xs space-y-1 pb-4">
            <p>Thank you for shopping with us!</p>
            <p>Keep your receipt for returns.</p>
            <BarcodeMock />
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const BarcodeMock = () => (
  <div className="mt-4 flex flex-col items-center justify-center opacity-70">
    <div className="flex h-8 w-40">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="h-full bg-black" style={{ width: `${Math.max(1, Math.random() * 4)}px`, marginRight: `${Math.random() * 3}px`}}></div>
      ))}
    </div>
    <span className="mt-1 font-mono text-[10px] tracking-widest text-black">89012345678</span>
  </div>
);
