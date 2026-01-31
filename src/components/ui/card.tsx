import { HTMLAttributes } from "react";
import { cn } from "@/utils/ui";

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => (
  <div className={cn("rounded-xl border-2 border-green-200 bg-white p-6 shadow-sm", className)} {...props} />
);
