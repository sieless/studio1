'use client';
import { Bed, Building, School, Store } from "lucide-react";
import { getPropertyIcon } from "@/lib/utils";

type Props = {
    type: string;
};

export function DefaultPlaceholder({ type }: Props) {
    return (
        <div className="flex flex-col items-center justify-center text-muted-foreground/50 h-full">
            {getPropertyIcon(type, "w-16 h-16")}
            <span className="mt-2 font-bold text-lg">{type}</span>
        </div>
    );
}
