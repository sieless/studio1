
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  amount: number;
  description: string;
  title: string;
};

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  description,
  title,
}: PaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (phoneNumber.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number.',
      });
      return;
    }

    setIsPaying(true);

    // --- M-PESA API INTEGRATION POINT ---
    // In a real application, you would make a call to your backend here.
    // Your backend would then securely call the M-Pesa STK Push API.
    // For this prototype, we'll just simulate the process.
    console.log(`Initiating STK push to ${phoneNumber} for KSh ${amount}`);

    // Simulate waiting for the user to complete the transaction on their phone.
    await new Promise(resolve => setTimeout(resolve, 3000));

    // In a real app, your backend would get a callback from M-Pesa.
    // Here, we'll just assume it was successful.
    console.log('M-Pesa transaction successful (simulated).');

    setIsPaying(false);
    onPaymentSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-4xl font-extrabold">
              KSh {amount.toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">M-Pesa Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0712345678"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              disabled={isPaying}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPaying}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={isPaying}>
            {isPaying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
