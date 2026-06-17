import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useState, useEffect } from "react";
import { Receipt, CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  paymentMethod: "Cash" | "Card" | "Mobile";
  onComplete: (data: any) => void;
}

export function CheckoutModal({ open, onOpenChange, total, paymentMethod, onComplete }: Props) {
  const [amountGiven, setAmountGiven] = useState<number | "">("");
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(amount);
  };

  const change = (typeof amountGiven === 'number' ? amountGiven : 0) - total;
  const isSufficient = (typeof amountGiven === 'number' ? amountGiven : 0) >= total;

  useEffect(() => {
    if (open) {
      if (paymentMethod === "Cash") {
        setAmountGiven("");
      } else {
        setAmountGiven(total);
      }
    }
  }, [open, paymentMethod, total]);

  const handleComplete = () => {
    if (paymentMethod === "Cash" && !isSufficient) return;
    onComplete({ success: true, method: paymentMethod, total, change, amountGiven: typeof amountGiven === 'number' ? amountGiven : total });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex justify-center flex-col items-center gap-2 pt-4">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span className="text-xl">Checkout</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-500">Amount Due ({paymentMethod})</p>
            <h2 className="text-4xl font-mono font-bold text-primary">{formatCurrency(total)}</h2>
          </div>

          {paymentMethod === "Cash" && (
            <div className="bg-gray-50 dark:bg-gray-900 border rounded-xl p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount_received">Amount Received (TZS)</Label>
                <Input 
                  id="amount_received" 
                  type="number" 
                  className="h-12 text-lg font-mono placeholder:text-gray-300"
                  placeholder="0.00"
                  value={amountGiven}
                  onChange={(e) => setAmountGiven(e.target.value ? Number(e.target.value) : "")}
                  autoFocus
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-950 rounded-lg border shadow-sm">
                <span className="text-sm font-medium text-gray-500">Change Due</span>
                <span className={`text-xl font-mono font-bold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {change >= 0 ? formatCurrency(change) : "-"}
                </span>
              </div>
            </div>
          )}

          {paymentMethod !== "Cash" && (
            <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-center text-sm border border-blue-100 dark:border-blue-900">
              <p>Awaiting payment confirmation via <strong>{paymentMethod}</strong> terminal...</p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2 relative z-10">
          <Button 
            className="w-full h-12 text-base shadow-xl" 
            size="lg"
            onClick={handleComplete}
            disabled={paymentMethod === "Cash" && !isSufficient}
          >
            <Receipt className="mr-2 h-5 w-5" />
            Complete & Print Receipt
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-gray-500"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
