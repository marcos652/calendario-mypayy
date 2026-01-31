import { HTMLAttributes } from "react";
import { cn } from "@/utils/ui";

type SpinnerProps = HTMLAttributes<HTMLDivElement>;

export const Spinner = ({ className, ...props }: SpinnerProps) => (
  <div
    className={cn(
      "h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900",
      className
    )}
    {...props}
  />
);
