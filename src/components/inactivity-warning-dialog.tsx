/**
 * Inactivity Warning Dialog
 * Shows when user has been inactive for 18 minutes
 */

'use client';

import { useAutoLogout } from '@/hooks/use-auto-logout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle } from 'lucide-react';

export function InactivityWarningDialog() {
  const { showWarning, secondsRemaining, dismissWarning, logoutNow } = useAutoLogout();

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <AlertDialog open={showWarning} onOpenChange={(open) => !open && dismissWarning()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Inactivity Warning
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have been inactive for a while. For your security, you will be automatically logged out in:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <p className="text-sm text-muted-foreground mt-2">minutes remaining</p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={dismissWarning}>
            Stay Logged In
          </AlertDialogCancel>
          <AlertDialogAction onClick={logoutNow}>
            Logout Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
