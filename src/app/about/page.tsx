
import { type Metadata } from 'next';
import { AboutClientPage } from './about-client-page';

export const metadata: Metadata = {
  title: 'About Key 2 Rent',
  description: 'Learn about Key 2 Rent, your number one source for finding rental properties in Machakos. Discover our mission and dedication to simplifying your housing search.',
};

export default function AboutPage() {
  return <AboutClientPage />;
}
