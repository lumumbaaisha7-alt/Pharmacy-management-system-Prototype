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
import { useEffect, useRef } from "react";
import { useSettings } from "../../hooks/useSettings";

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
  receiptNumber: string;
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
  amountGiven,
  receiptNumber
}: Props) {
  const { settings } = useSettings();
  const barcodeRef = useRef<SVGSVGElement>(null);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (open && receiptNumber && (window as any).JsBarcode) {
      setTimeout(() => {
        if (barcodeRef.current) {
          (window as any).JsBarcode(barcodeRef.current, receiptNumber, {
            format: "CODE128",
            width: 1.5,
            height: 40,
            displayValue: true,
            fontSize: 10,
            margin: 0
          });
        }
      }, 100);
    }
  }, [open, receiptNumber]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] print:max-w-none print:w-full print:m-0 print:p-0 print:shadow-none print:border-none my-paper-receipt">
        <DialogHeader className="print:hidden">
          <DialogTitle>Receipt Preview</DialogTitle>
        </DialogHeader>
        
        {/* Printable Receipt Area */}
        <div className="p-6 bg-white text-black font-mono text-sm print:p-0" id="print-area">
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest">{settings.pharmacy_name || 'PharmaFlow'}</h2>
            <p className="text-xs">{settings.pharmacy_address || ''}</p>
            <p className="text-xs">Tel: {settings.phone || ''}</p>
            <p className="text-xs">Email: {settings.email || ''}</p>
          </div>

          <div className="flex justify-between text-xs mb-4 pb-4 border-b border-dashed border-gray-300">
            <div>
              <p>RCPT: #{receiptNumber}</p>
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
            <div className="mt-4 flex justify-center">
              <svg ref={barcodeRef}></svg>
            </div>
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
