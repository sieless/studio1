import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header onPostClick={() => {}} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-4">
                <Mail className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl font-bold">Contact Us</CardTitle>
            </div>
            <p className="text-muted-foreground pt-2">
                Have questions? We'd love to hear from you.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 text-lg">
            <div className="flex items-center gap-4">
              <Phone className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <a href="tel:+254712345678" className="text-muted-foreground hover:text-primary transition-colors">+254 712 345 678</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <a href="mailto:info@mavazihub.com" className="text-muted-foreground hover:text-primary transition-colors">info@mavazihub.com</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Office</h3>
                <p className="text-muted-foreground">123 Mjini Street, Machakos, Kenya</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
