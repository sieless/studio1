"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { houseTypes, locations } from "@/lib/constants";

type FilterPanelProps = {
  filters: {
    location: string;
    type: string;
    maxPrice: number;
  };
  onFilterChange: (name: string, value: string | number) => void;
};

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  return (
    <div className="bg-card p-6 rounded-xl shadow-lg mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
            Location / Estate
          </Label>
          <Select
            name="location"
            value={filters.location}
            onValueChange={(value) => onFilterChange("location", value)}
          >
            <SelectTrigger id="location" className="w-full">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">
            Type of House
          </Label>
          <Select
            name="type"
            value={filters.type}
            onValueChange={(value) => onFilterChange("type", value)}
          >
            <SelectTrigger id="type" className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {houseTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="maxPrice" className="block text-sm font-medium text-foreground mb-1">
            Max Price:{" "}
            <span className="font-bold text-primary">
              Ksh {Number(filters.maxPrice).toLocaleString()}
            </span>
          </Label>
          <Slider
            id="maxPrice"
            name="maxPrice"
            min={3000}
            max={30000}
            step={500}
            value={[filters.maxPrice]}
            onValueChange={(value) => onFilterChange("maxPrice", value[0])}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
