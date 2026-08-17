import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1434CB]/35 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 active:translate-y-px",
  { variants: {
      variant: {
        default: "border border-[#1029A4] bg-[#1434CB] text-white shadow-[0_12px_28px_-18px_rgba(20,52,203,.9),inset_0_1px_0_rgba(255,255,255,.18)] hover:-translate-y-px hover:bg-[#1029A4]",
        outline: "border border-white/15 bg-white/[.06] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] hover:border-white/25 hover:bg-white/[.1] hover:text-white",
        ghost: "text-white/50 hover:bg-white/[.06] hover:text-white",
        destructive: "bg-destructive text-destructive-foreground hover:bg-red-600",
      },
      size: { default: "h-11 px-5 py-2", sm: "h-9 rounded-[8px] px-3", lg: "h-12 px-6 text-[15px]", icon: "h-10 w-10" },
    }, defaultVariants: { variant: "default", size: "default" } }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, buttonVariants };
