'use client';
import { ListingsView } from '@/components/listings-view';
import { FirebaseClientProvider }from '@/firebase/client-provider'

export default function Home() {
  return (
    <FirebaseClientProvider>
      <ListingsView />
    </FirebaseClientProvider>
  );
}
