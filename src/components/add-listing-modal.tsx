'use client';

import { useState, useTransition, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { uploadImage } from '@/firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { analyzeListingImage } from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { houseTypes, locations, featureOptions } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Wand2, UploadCloud } from 'lucide-react';
import { updateDocumentNonBlocking } from '@/firebase';


const listingSchema = z.object({
  type: z.string().min(1, 'House type is required.'),
  location: z.string().min(1, 'Location is required.'),
  price: z.coerce.number().min(1, 'Price is required.'),
  contact: z.string().min(10, 'A valid contact number is required.'),
  images: z.any().refine((files) => files?.length > 0, 'At least one image is required.'),
  features: z.array(z.string()).optional(),
});

type AddListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, startTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<{
    suggestedTags: string[];
    suggestedImprovements: string;
  } | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  

  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const form = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: 'Bedsitter',
      location: 'Mjini',
      price: 5000,
      contact: '',
      features: [],
    },
  });

  const imageFiles = form.watch('images');

  const selectedFileNames = useMemo(() => {
    if (!imageFiles || imageFiles.length === 0) {
      return 'Click to upload images';
    }
    return Array.from(imageFiles).map(file => file.name).join(', ');
  }, [imageFiles]);


  const handleAnalyzeImage = async () => {
    if (!imageFiles || imageFiles.length === 0) {
      setAnalysisError('Please select an image file first.');
      return;
    }
    setAnalysisError(null);
    setAnalysisResult(null);

    const firstImage = imageFiles[0];
    const reader = new FileReader();
    reader.readAsDataURL(firstImage);
    reader.onload = () => {
      const dataUri = reader.result as string;
      const formData = new FormData();
      formData.append('image', dataUri);
      
      startTransition(async () => {
        const result = await analyzeListingImage(formData);
        if (result.error) {
          setAnalysisError(result.error);
        } else if (result.analysis) {
          setAnalysisResult(result.analysis);
        }
      });
    }
  };

  const onSubmit = async (data: z.infer<typeof listingSchema>) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not authenticated',
        description: 'You must be logged in to create a listing.',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Create listing with placeholder images
      const listingData = {
        ...data,
        images: [], // Start with an empty array
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'listings'), listingData);

      // 2. Start image uploads in the background (non-blocking)
      const uploadPromises = Array.from(data.images).map(file => 
        uploadImage(file, user.uid, (progress) => {
          console.log(`Upload is ${progress}% done`);
        })
      );

      Promise.all(uploadPromises).then(async (imageUrls) => {
        // 3. Once all uploads are complete, update the document with the real URLs
        updateDocumentNonBlocking(doc(db, "listings", docRef.id), { images: imageUrls });
        
        // Add listing to user's profile
        const userRef = doc(db, 'users', user.uid);
        updateDocumentNonBlocking(userRef, {
            listings: arrayUnion(docRef.id),
        });

      }).catch(error => {
        console.error("Image uploads failed:", error);
        toast({
            variant: "destructive",
            title: "Image upload failed",
            description: "Your listing was created, but the images failed to upload. You may need to edit the listing to add them again.",
        });
      });


      toast({
        title: 'Success!',
        description: 'Your listing is being created. The images will appear shortly.',
      });

      form.reset();
      onClose();

    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Failed to create listing. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const imagesField = form.register('images');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pr-6">
          <DialogTitle className="text-2xl font-bold">
            Add a New Rental Property
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to post a listing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6 pl-6 -mr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of House</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a house type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {houseTypes
                            .filter(t => t !== 'All')
                            .map(type => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location / Estate</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations
                            .filter(l => l !== 'All')
                            .map(loc => (
                              <SelectItem key={loc} value={loc}>
                                {loc}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rent per Month (Ksh)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 8500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="e.g. 0712345678"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="images"
                render={() => (
                  <FormItem>
                    <FormLabel>Property Images</FormLabel>
                     <FormControl>
                        <div className="relative flex items-center gap-2">
                           <label htmlFor="image-upload" className="flex-grow h-10 flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground ring-offset-background cursor-pointer hover:bg-accent hover:text-accent-foreground truncate">
                             <UploadCloud className="mr-2 flex-shrink-0" />
                             <span className="truncate">{selectedFileNames}</span>
                           </label>
                           <Input
                              id="image-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              multiple
                              {...imagesField}
                            />
                            <Button type="button" variant="outline" onClick={handleAnalyzeImage} disabled={isAnalyzing || !imageFiles || imageFiles.length === 0}>
                              {isAnalyzing ? <Loader2 className="animate-spin" /> : <Wand2 />}
                              <span className="ml-2 hidden md:inline">Analyze Image</span>
                            </Button>
                        </div>
                      </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(isAnalyzing || analysisResult || analysisError) && (
                <Alert
                  variant={analysisError ? 'destructive' : 'default'}
                  className="bg-muted/50"
                >
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>
                    {isAnalyzing
                      ? 'Analyzing...'
                      : analysisError
                      ? 'Analysis Failed'
                      : 'AI Suggestions'}
                  </AlertTitle>
                  <AlertDescription>
                    {isAnalyzing &&
                      'Our AI is looking at your image. Please wait a moment.'}
                    {analysisError && analysisError}
                    {analysisResult && (
                      <div className="space-y-3">
                        <p>{analysisResult.suggestedImprovements}</p>
                        <p className="font-semibold">Suggested Tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.suggestedTags.map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => {
                                const currentFeatures =
                                  form.getValues('features') || [];
                                if (
                                  !currentFeatures.includes(tag) &&
                                  featureOptions.includes(tag)
                                ) {
                                  form.setValue('features', [
                                    ...currentFeatures,
                                    tag,
                                  ]);
                                }
                              }}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="features"
                render={() => (
                  <FormItem>
                    <FormLabel>Features (Select all that apply)</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {featureOptions.map(item => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="features"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={checked => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            item,
                                          ])
                                        : field.onChange(
                                            (field.value || []).filter(
                                              value => value !== item
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-6 mt-6 border-t -mb-6 pb-6 -mx-6 px-6 bg-background sticky bottom-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Listing'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
