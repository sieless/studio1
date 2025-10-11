'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, Phone, MessageSquare, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VacancyPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyType: string;
  onPaymentConfirmed: () => void;
  isLoading?: boolean;
}

// Pricing structure based on property type
const getPaymentAmount = (propertyType: string): number => {
  const type = propertyType.toLowerCase();
  
  if (type.includes('single') || type.includes('hostel') || type.includes('bedsitter')) {
    return 300;
  }
  
  if (type.includes('1 bedroom') || type.includes('2 bedroom')) {
    return 500;
  }
  
  // All other types (3BR+, houses, commercial, etc.)
  return 800;
};

export function VacancyPaymentModal({
  open,
  onOpenChange,
  propertyType,
  onPaymentConfirmed,
  isLoading = false,
}: VacancyPaymentModalProps) {
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  
  const amount = getPaymentAmount(propertyType);
  const tillNumber = "6046866";
  const accountName = "TITUS KIPKIRUI";
  const contactNumber = "0708674665";

  const handleCopyTillNumber = async () => {
    try {
      await navigator.clipboard.writeText(tillNumber);
      toast({
        title: "Till number copied!",
        description: "M-Pesa Till number has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the till number: " + tillNumber,
        variant: "destructive",
      });
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi, I'm paying KES ${amount} for vacancy listing on Key-2-Rent. Property type: ${propertyType}. M-Pesa transaction code will follow.`
    );
    const url = `https://wa.me/254${contactNumber.slice(1)}?text=${message}`;
    window.open(url, '_blank');
  };

  const handleSMS = () => {
    const message = encodeURIComponent(
      `Hi, I'm paying KES ${amount} for vacancy listing on Key-2-Rent. Property type: ${propertyType}. M-Pesa transaction code will follow.`
    );
    const url = `sms:${contactNumber}?body=${message}`;
    window.open(url);
  };

  const handleCall = () => {
    window.open(`tel:${contactNumber}`);
  };

  const handlePaymentConfirmed = async () => {
    setIsConfirming(true);
    try {
      await onPaymentConfirmed();
      onOpenChange(false);
      toast({
        title: "Payment confirmed!",
        description: "Your listing is now pending admin verification. You'll be notified once approved.",
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Error",
        description: "Failed to confirm payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Vacancy Listing Payment
          </DialogTitle>
          <DialogDescription>
            To list your property as vacant, please complete the payment below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Property Type and Amount */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <span className="text-sm font-medium">Property Type:</span>
              <div>
                <Badge variant="secondary">{propertyType}</Badge>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Amount to pay:</span>
              <div className="text-2xl font-bold text-primary">KES {amount.toLocaleString()}</div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Payment Instructions:</h3>
            
            {/* M-Pesa Till Details */}
            <div className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">M-Pesa Till Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold">{tillNumber}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyTillNumber}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Name:</span>
                <span className="font-medium">{accountName}</span>
              </div>
            </div>

            {/* Steps */}
            <div className="text-sm space-y-2">
              <div className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Go to M-Pesa on your phone</span>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Select "Pay Bill"</span>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Enter Till Number: <strong>{tillNumber}</strong></span>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Enter Amount: <strong>KES {amount}</strong></span>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <span>Complete the transaction</span>
              </div>
            </div>
          </div>

          {/* Contact Options */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Send payment confirmation:</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsApp}
                className="flex flex-col gap-1 h-auto py-2"
              >
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSMS}
                className="flex flex-col gap-1 h-auto py-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">SMS</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCall}
                className="flex flex-col gap-1 h-auto py-2"
              >
                <Phone className="h-4 w-4" />
                <span className="text-xs">Call</span>
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Contact: {contactNumber}
            </p>
          </div>

          {/* Important Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              After making payment, send the M-Pesa transaction code via WhatsApp, SMS, or call. 
              Your listing will be approved within 24 hours of payment verification.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming || isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePaymentConfirmed}
            disabled={isConfirming || isLoading}
          >
            {isConfirming ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                I've Made Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}