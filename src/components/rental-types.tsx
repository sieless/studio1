'use client';
import { Card } from '@/components/ui/card';
import { houseTypes } from '@/lib/constants';
import { Bed, Building } from 'lucide-react';

type RentalTypesProps = {
  onTypeSelect: (type: string) => void;
  selectedType: string;
};

export function RentalTypes({ onTypeSelect, selectedType }: RentalTypesProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Browse by Category
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {houseTypes.map(type => (
          <Card
            key={type}
            className={`p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              selectedType === type
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card hover:bg-muted'
            }`}
            onClick={() => onTypeSelect(type)}
          >
            {type.toLowerCase().includes('bedroom') || type.toLowerCase().includes('bedsitter') ? (
              <Bed className="w-8 h-8 mb-2" />
            ) : (
              <Building className="w-8 h-8 mb-2" />
            )}
            <p className="font-semibold">{type}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
