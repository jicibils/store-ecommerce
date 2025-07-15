// src/components/CategoryCard.tsx
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import capitalize from "lodash.capitalize";

interface Props {
  icon: LucideIcon;
  label: string;
}

export default function CategoryCard({ icon: Icon, label }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white shadow-md",
        "hover:scale-105 hover:shadow-xl transition-all cursor-pointer"
      )}
    >
      <Icon className="w-6 h-6 text-orange-600" />
      <span className="text-sm truncate font-medium">{capitalize(label)}</span>
    </div>
  );
}
