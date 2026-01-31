import { LabelHTMLAttributes } from "react";
import { cn } from "@/utils/ui";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = ({ className, ...props }: LabelProps) => (
  <label className={cn("text-sm font-medium text-slate-700", className)} {...props} />
);
