'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, LogOut, PlusCircle, LayoutGrid, Menu, Info, Mail } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { ModeToggle } from './mode-toggle';

type HeaderProps = {
  onPostClick: () => void;
};

export function Header({ onPostClick }: HeaderProps) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  };

  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-headline">
            Key 2 Rent
          </h1>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            onClick={onPostClick}
            className="font-semibold shadow-md hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-0.5 hidden sm:flex"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Post a Listing
          </Button>
          
          <div className="hidden sm:flex items-center gap-2">
             <Button variant="ghost" asChild>
                <Link href="/all-properties">All Properties</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/about">About</Link>
              </Button>
               <Button variant="ghost" asChild>
                <Link href="/contact">Contact</Link>
              </Button>
          </div>

           <ModeToggle />

          {isUserLoading ? (
             <Skeleton className="h-10 w-10 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage
                      src={user.photoURL || undefined}
                      alt={user.displayName || 'User'}
                    />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/my-listings">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span>My Listings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          )}

           <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuItem onClick={onPostClick}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Post Listing</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/all-properties">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span>All Properties</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about">
                    <Info className="mr-2 h-4 w-4" />
                    <span>About Us</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Contact</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  );
}
