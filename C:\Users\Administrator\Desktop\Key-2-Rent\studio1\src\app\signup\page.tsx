
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Home, Mail, Phone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [activeTab, setActiveTab] = useState('email');

  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  const handlePhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier!;
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, `+${phone}`, appVerifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      toast({ title: "OTP Sent", description: "Please check your phone for the OTP." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sign Up Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpAndCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const confirmationResult = window.confirmationResult;
      if (!confirmationResult) throw new Error("Could not verify OTP. Please try again.");

      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      if (!user) throw new Error("User not found after OTP verification.");
      
      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: user.email, 
        phone: user.phoneNumber,
        id: user.uid,
        listings: [],
        canViewContacts: false,
        role: 'user',
      });

      toast({ title: 'Account Created', description: 'You have been successfully signed up.' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sign Up Failed', description: error.message });
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: user.email,
        phone: null,
        id: user.uid,
        listings: [],
        canViewContacts: false,
        role: user.email === 'sieleseyontech@gmail.com' ? 'admin' : 'user',
      });

      toast({ title: 'Account Created', description: 'You have been successfully signed up.' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sign Up Failed', description: error.message });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
           <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground font-headline">
              Key 2 Rent
            </h1>
          </div>
          <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
          <CardDescription className="text-center">
            Create an account to start listing properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4" /> Email</TabsTrigger>
              <TabsTrigger value="phone"><Phone className="mr-2 h-4 w-4" /> Phone</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <form onSubmit={handleEmailSignUp} className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="name-email">Name</Label>
                  <Input id="name-email" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create an account'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="phone">
              {!otpSent ? (
                <form onSubmit={handlePhoneSignUp} className="grid gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name-phone">Name</Label>
                    <Input id="name-phone" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="254712345678" required value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={verifyOtpAndCreateUser} className="grid gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input id="otp" type="number" placeholder="123456" required value={otp} onChange={(e) => setOtp(e.target.value)} disabled={isLoading} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify OTP & Sign Up'}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
      <div id="recaptcha-container"></div>
    </div>
  );
}
