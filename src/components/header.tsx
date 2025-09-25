"use client";

import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

type HeaderProps = {
  onPostClick: () => void;
};

export function Header({ onPostClick }: HeaderProps) {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-headline">
            Machakos Rentals
          </h1>
        </div>
        <Button
          onClick={onPostClick}
          className="font-semibold shadow-md hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Post a Listing
        </Button>
      </nav>
    </header>
  );
}
