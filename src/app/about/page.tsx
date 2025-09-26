import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Info } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header onPostClick={() => {}} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Info className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold">About Mavazi Hub</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-lg text-muted-foreground">
            <p>
              Welcome to Mavazi Hub, your number one source for finding rental properties in Machakos. We're dedicated to giving you the very best of rental listings, with a focus on dependability, customer service, and uniqueness.
            </p>
            <p>
              Founded in 2024, Mavazi Hub has come a long way from its beginnings. When we first started out, our passion for helping people find their next home drove us to do intense research, and gave us the impetus to turn hard work and inspiration into a booming online platform.
            </p>
            <p>
              We now serve customers all over Machakos and are thrilled to be a part of the fair-trade wing of the real estate industry. We hope you enjoy our platform as much as we enjoy offering it to you. If you have any questions or comments, please don't hesitate to contact us.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
