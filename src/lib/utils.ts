import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getSubscriptionFee = (type: string) => {
    switch (type) {
      case 'Single Room':
        return 500;
      case '1 Bedroom':
      case 'Double Room':
        return 1000;
      case '2 Bedroom':
        return 2000;
      case '3 Bedroom':
      case 'House':
        return 3000;
      default: // Bedsitter and others
        return 500; 
    }
};
