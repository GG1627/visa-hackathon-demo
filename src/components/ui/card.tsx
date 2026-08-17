import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("rounded-none border border-white/10 bg-[linear-gradient(150deg,rgba(22,29,65,.92),rgba(10,14,39,.9))] text-white shadow-[0_34px_80px_-44px_rgba(0,0,0,.85),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-xl", className)} {...props} />);
Card.displayName = "Card";
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />);
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => <h3 ref={ref} className={cn("maya-card-title text-xl font-semibold leading-none", className)} {...props} />);
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm text-white/45", className)} {...props} />);
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />);
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />);
CardFooter.displayName = "CardFooter";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
