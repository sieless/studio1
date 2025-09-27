'use client';

import { useState, useTransition, useMemo, ChangeEvent } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { useFirestore, useUser, useFirebaseApp } from '@/firebase';
import { uploadImage } from '@/firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { analyzeListingImage } from '@/app/actions';
import Image from 'next/image';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { houseTypes, locations, featureOptions } from '@/lib/constants';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Wand2, UploadCloud, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const listingSchema = z.object({
  type: z.string().min(1, 'House type is required.'),
  location: z.string().min(1, 'Location is required.'),
  price: z.coerce.number().min(1, 'Price is required.'),
  deposit: z.coerce.number().optional().or(z.literal('')),
  contact: z.string().min(10, 'A valid contact number is required.'),
  images: z
    .any()
    .refine(files => files?.length >= 1, 'At least one image is required.'),
  features: z.array(z.string()).optional(),
});

type AddListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ListingData = z.infer<typeof listingSchema>;

export function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, startTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<{
    suggestedTags: string[];
    suggestedImprovements: string;
  } | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analyzedImageIndex, setAnalyzedImageIndex] = useState<number | null>(null);

  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const form = useForm<ListingData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: 'Bedsitter',
      location: 'Mjini',
      price: 5000,
      contact: '',
      features: [],
      images: [],
      deposit: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  const imageFiles = form.watch('images');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const newFiles = files.filter(
        file => !imageFiles.some(existingFile => existingFile.name === file.name)
      );
      if (newFiles.length > 0) {
        append(newFiles);
      }
    }
  };

  const handleAnalyzeImage = async (imageFile: File, index: number) => {
    setAnalysisError(null);
    setAnalysisResult(null);
    setAnalyzedImageIndex(index);

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
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
    };
    reader.onerror = () => {
      setAnalysisError('Could not read the image file.');
    };
  };

  const onSubmit = async (data: ListingData) => {
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
      const { images: imageFiles, ...restOfData } = data;
      
      const listingPayload: any = {
        ...restOfData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        images: [], // Will be populated after upload
      };

      // Ensure deposit is a number or not present at all
      if (listingPayload.deposit === '' || listingPayload.deposit === undefined || isNaN(listingPayload.deposit)) {
        delete listingPayload.deposit;
      } else {
        listingPayload.price = Number(listingPayload.price);
        listingPayload.deposit = Number(listingPayload.deposit);
      }


      // 1. Create the document in Firestore first to get a docRef
      const docRef = await addDoc(collection(db, 'listings'), listingPayload);

      // 2. Upload images in the background (non-blocking)
      const uploadPromises = imageFiles.map((file: File) =>
        uploadImage(file, user.uid, docRef.id, progress => {
          // You can use this callback to update UI with upload progress
          console.log(`Image ${file.name} upload is ${progress}% done`);
        })
      );

      // We get the URLs and update the document, also non-blockingly.
      Promise.all(uploadPromises).then(imageUrls => {
        updateDocumentNonBlocking(doc(db, 'listings', docRef.id), { images: imageUrls });
      }).catch(error => {
        console.error("One or more image uploads failed:", error);
        // Optionally, update the listing to indicate an image upload issue
      });
      
      // 3. Update the user's listings array (non-blocking)
      const userRef = doc(db, 'users', user.uid);
      updateDocumentNonBlocking(userRef, { listings: arrayUnion(docRef.id) });


      toast({
        title: 'Success!',
        description:
          'Your listing has been created. Images will appear shortly.',
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="pr-6">
            <DialogTitle className="text-2xl font-bold">
              Add a New Rental Property
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to post your property. All listings are currently free.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 pl-6 -mr-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                          onValuechange={field.onChange}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rent per Month (Ksh)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 8500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rent Deposit (Ksh, Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 8500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                <FormItem>
                  <FormLabel>Property Images</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="relative group aspect-square"
                      >
                        <Image
                          src={URL.createObjectURL(imageFiles[index])}
                          alt={`Preview ${index}`}
                          fill
                          className="object-cover rounded-md"
                        />
                        <div className="absolute top-1 right-1 flex items-center gap-1">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 opacity-80 group-hover:opacity-100"
                            onClick={() => remove(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 h-7 opacity-80 group-hover:opacity-100"
                          onClick={() =>
                            handleAnalyzeImage(imageFiles[index], index)
                          }
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing && analyzedImageIndex === index ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Wand2 className="mr-1 h-4 w-4" />
                          )}
                          Analyze
                        </Button>
                      </div>
                    ))}
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-input bg-transparent cursor-pointer hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    >
                      <UploadCloud className="h-8 w-8" />
                      <span className="mt-2 text-sm text-center">
                        Add photos
                      </span>
                    </label>
                    <Input
                      id="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                    />
                  </div>
                  <FormMessage>
                    {form.formState.errors.images &&
                      (form.formState.errors.images.message as string)}
                  </FormMessage>
                </FormItem>

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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : 'Post Listing'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
