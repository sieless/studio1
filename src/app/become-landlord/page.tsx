'use client';

// Force dynamic rendering (disable static generation)
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  query,
  where,
  FirestoreError,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, CheckCircle2, FileWarning, Loader2, ShieldCheck, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/image-upload';
import { useCurrentUserProfile } from '@/hooks/use-user-profile';
import type { LandlordApplication } from '@/types';

type ApplicationFormState = {
  propertyName: string;
  propertyLocation: string;
  propertyType: string;
  totalUnits: string;
  availableUnits: string;
  idDocumentUrls: string[];
  ownershipProofUrls: string[];
  additionalNotes: string;
};

const defaultForm: ApplicationFormState = {
  propertyName: '',
  propertyLocation: '',
  propertyType: '',
  totalUnits: '',
  availableUnits: '',
  idDocumentUrls: [],
  ownershipProofUrls: [],
  additionalNotes: '',
};

export default function BecomeLandlordPage() {
  const { user, isUserLoading } = useUser();
  const { profile, isLoading: profileLoading } = useCurrentUserProfile();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState<ApplicationFormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<LandlordApplication | null>(null);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'application'>('overview');

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!db || !user) {
      return;
    }

    const q = query(collection(db, 'landlord_applications'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setExistingApplication(null);
        } else {
          const docData = snapshot.docs[0];
          setExistingApplication({ id: docData.id, ...(docData.data() as LandlordApplication) });
        }
        setApplicationsLoading(false);
      },
      (error: FirestoreError) => {
        console.error('Failed to load landlord application', error);
        toast({
          title: 'Could not load application',
          description: error.message,
          variant: 'destructive',
        });
        setApplicationsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, user, toast]);

  useEffect(() => {
    if (!existingApplication) {
      resetForm();
      return;
    }

    setForm({
      propertyName: existingApplication.propertyName || '',
      propertyLocation: existingApplication.propertyLocation || '',
      propertyType: existingApplication.propertyType || '',
      totalUnits: existingApplication.totalUnits?.toString() || '',
      availableUnits: existingApplication.availableUnits?.toString() || '',
      idDocumentUrls: existingApplication.idDocumentUrl ? [existingApplication.idDocumentUrl] : [],
      ownershipProofUrls: existingApplication.ownershipProofUrl ? [existingApplication.ownershipProofUrl] : [],
      additionalNotes: existingApplication.additionalNotes || '',
    });
  }, [existingApplication]);

  const statusBadge = useMemo(() => {
    const status = existingApplication?.status || profile?.landlordApprovalStatus || 'none';

    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500 text-white">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Requires Changes</Badge>;
      default:
        return <Badge variant="outline">Not verified</Badge>;
    }
  }, [existingApplication, profile?.landlordApprovalStatus]);

  const resetForm = () => setForm(defaultForm);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!db || !user) {
      toast({
        title: 'You must be logged in',
        description: 'Please sign in before submitting your application.',
        variant: 'destructive',
      });
      return;
    }

    if (form.idDocumentUrls.length === 0 || form.ownershipProofUrls.length === 0) {
      toast({
        title: 'Supporting documents required',
        description: 'Upload both your ID and proof of property ownership.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        userId: user.uid,
        userEmail: user.email || profile?.email,
        userName: profile?.name || user.displayName || '',
        accountType: 'landlord' as const,
        status: 'pending' as const,
        propertyName: form.propertyName,
        propertyLocation: form.propertyLocation,
        propertyType: form.propertyType,
        totalUnits: form.totalUnits ? Number(form.totalUnits) : undefined,
        availableUnits: form.availableUnits ? Number(form.availableUnits) : undefined,
        idDocumentUrl: form.idDocumentUrls[0],
        ownershipProofUrl: form.ownershipProofUrls[0],
        additionalNotes: form.additionalNotes || undefined,
        submittedAt: serverTimestamp(),
      } satisfies Record<string, unknown>;

      let applicationId = existingApplication?.id;

      if (!existingApplication) {
        const applicationRef = await addDoc(collection(db, 'landlord_applications'), payload);
        applicationId = applicationRef.id;
      } else {
        const applicationRef = doc(db, 'landlord_applications', existingApplication.id);
        await updateDoc(applicationRef, {
          ...payload,
          reviewedAt: null,
          reviewerId: null,
          reviewerEmail: null,
          adminFeedback: null,
        });
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        accountType: 'landlord',
        landlordApprovalStatus: 'pending',
        landlordApplicationId: applicationId,
      });

      await addDoc(collection(db, 'admin_notifications'), {
        type: 'LANDLORD_APPLICATION',
        referenceId: applicationId,
        title: 'New landlord verification',
        message: `${profile?.name || user.email || 'A user'} submitted landlord documents`,
        status: 'pending',
        createdAt: serverTimestamp(),
        metadata: {
          userId: user.uid,
          userEmail: user.email || profile?.email,
          propertyName: form.propertyName,
          propertyLocation: form.propertyLocation,
        },
      });

      toast({
        title: 'Submitted for review',
        description: 'Our admin team will verify your documents shortly.',
      });

      resetForm();
      setActiveTab('overview');
    } catch (error: any) {
      console.error('Failed to submit landlord application', error);
      toast({
        title: 'Submission failed',
        description: error.message || 'Could not submit your application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusCard = () => {
    const status = existingApplication?.status || profile?.landlordApprovalStatus || 'none';
    const feedback = existingApplication?.adminFeedback;

    if (applicationsLoading || profileLoading || isUserLoading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading landlord status
            </CardTitle>
          </CardHeader>
        </Card>
      );
    }

    if (status === 'approved') {
      return (
        <Card className="border-green-600/40 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <ShieldCheck className="h-5 w-5" />
              Your landlord account is verified!
            </CardTitle>
            <CardDescription>
              You can now create and manage property listings. Visit the My Listings page to start posting vacancies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/my-listings')}>
              Go to My Listings
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (status === 'pending') {
      return (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Loader2 className="h-5 w-5 animate-spin" />
              Application under review
            </CardTitle>
            <CardDescription>
              Our admin team is reviewing your submission. We&apos;ll email you once verification is complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Submitted:</strong> {existingApplication?.submittedAt?.toDate?.().toLocaleString?.() || 'Just now'}</p>
              {existingApplication?.propertyName && (
                <p><strong>Property:</strong> {existingApplication.propertyName} ({existingApplication.propertyLocation})</p>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (status === 'rejected') {
      return (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <FileWarning className="h-5 w-5" />
              Additional details required
            </CardTitle>
            <CardDescription>
              Please review the feedback below and re-submit your documents when ready.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {feedback ? (
              <Alert>
                <AlertTitle>Admin feedback</AlertTitle>
                <AlertDescription>{feedback}</AlertDescription>
              </Alert>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific feedback provided. You can update details and submit a new request.
              </p>
            )}
            <Button className="mt-4" variant="outline" onClick={() => setActiveTab('application')}>
              Update application
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Become a verified landlord
          </CardTitle>
          <CardDescription>
            Submit your property and ownership details once to unlock landlord capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setActiveTab('application')}>Start application</Button>
        </CardContent>
      </Card>
    );
  };

  const canSubmit = profile && profile.landlordApprovalStatus !== 'pending' && profile.landlordApprovalStatus !== 'approved';

  return (
    <div className="flex flex-col min-h-screen">
      <Header onPostClick={() => router.push('/my-listings')} />
      <main className="flex-grow w-full bg-muted/20">
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-foreground">Landlord Verification</h1>
            <p className="text-muted-foreground max-w-2xl">
              Verify your identity and property ownership to start listing rentals on Key-2-Rent. This helps us maintain trust and safety for renters across Kenya.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Current status:</span>
              {statusBadge}
            </div>
          </div>

          {renderStatusCard()}

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="grid grid-cols-2 max-w-md">
              <TabsTrigger value="overview">Requirements</TabsTrigger>
              <TabsTrigger value="application">Verification form</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>What you&apos;ll need</CardTitle>
                  <CardDescription>
                    Prepare the information below before submitting your landlord verification request.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Property information</h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      <li>Property or estate name</li>
                      <li>Exact location / neighborhood</li>
                      <li>Property type (Apartment, Bedsitter, etc.)</li>
                      <li>Total units under your management</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Verification documents</h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      <li>National ID or passport scan</li>
                      <li>Proof of ownership or management authority</li>
                      <li>Optional supporting notes for the admin team</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="application" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submit verification details</CardTitle>
                  <CardDescription>
                    Provide accurate details. Our admin team will review submissions within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="property-name">Property or Business Name</Label>
                        <Input
                          id="property-name"
                          placeholder="e.g. Gilgal Apartments"
                          value={form.propertyName}
                          onChange={(event) => setForm((prev) => ({ ...prev, propertyName: event.target.value }))}
                          required
                          disabled={submitting || !canSubmit}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="property-location">Location / Estate</Label>
                        <Input
                          id="property-location"
                          placeholder="e.g. Machakos Town"
                          value={form.propertyLocation}
                          onChange={(event) => setForm((prev) => ({ ...prev, propertyLocation: event.target.value }))}
                          required
                          disabled={submitting || !canSubmit}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="property-type">Property Type</Label>
                        <Input
                          id="property-type"
                          placeholder="e.g. Apartment, Bedsitter, Business Space"
                          value={form.propertyType}
                          onChange={(event) => setForm((prev) => ({ ...prev, propertyType: event.target.value }))}
                          required
                          disabled={submitting || !canSubmit}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="total-units">Total Units</Label>
                          <Input
                            id="total-units"
                            type="number"
                            min={1}
                            value={form.totalUnits}
                            onChange={(event) => setForm((prev) => ({ ...prev, totalUnits: event.target.value }))}
                            required
                            disabled={submitting || !canSubmit}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="available-units">Units currently vacant</Label>
                          <Input
                            id="available-units"
                            type="number"
                            min={0}
                            value={form.availableUnits}
                            onChange={(event) => setForm((prev) => ({ ...prev, availableUnits: event.target.value }))}
                            required
                            disabled={submitting || !canSubmit}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Upload your ID</Label>
                        <ImageUpload
                          images={form.idDocumentUrls}
                          onChange={(urls) => setForm((prev) => ({ ...prev, idDocumentUrls: urls.slice(0, 1) }))}
                          maxImages={1}
                          className="bg-muted/40 p-4 rounded-md"
                        />
                        <p className="text-xs text-muted-foreground">
                          Clear photo or scan of your national ID or passport (JPEG/PNG).
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Proof of ownership / authorization</Label>
                        <ImageUpload
                          images={form.ownershipProofUrls}
                          onChange={(urls) => setForm((prev) => ({ ...prev, ownershipProofUrls: urls.slice(0, 1) }))}
                          maxImages={1}
                          className="bg-muted/40 p-4 rounded-md"
                        />
                        <p className="text-xs text-muted-foreground">
                          Upload a title deed, lease agreement, or authorization letter from the owner.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additional-notes">Additional notes (optional)</Label>
                      <Textarea
                        id="additional-notes"
                        placeholder="Share any helpful context for our admin team."
                        value={form.additionalNotes}
                        onChange={(event) => setForm((prev) => ({ ...prev, additionalNotes: event.target.value }))}
                        rows={4}
                        disabled={submitting || !canSubmit}
                      />
                    </div>

                    <Alert className="bg-muted">
                      <Upload className="h-4 w-4" />
                      <AlertTitle>Verification timeline</AlertTitle>
                      <AlertDescription>
                        Reviews typically take less than 24 hours. We&apos;ll email you as soon as your landlord account is approved.
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center gap-3">
                      <Button type="submit" disabled={submitting || !canSubmit}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Submit for review
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                        Reset form
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
