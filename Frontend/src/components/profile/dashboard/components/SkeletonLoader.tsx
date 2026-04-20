import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
}) => {
  const baseClass = "bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse";

  const variantClass =
    variant === "circular"
      ? "rounded-full"
      : variant === "text"
        ? "rounded"
        : "rounded-lg";

  return <div className={cn(baseClass, variantClass, className)} />;
};

export const SkeletonCard: React.FC = () => (
  <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-8 w-24 rounded" />
      <Skeleton className="h-8 w-24 rounded" />
    </div>
  </div>
);

export const SkeletonCircular: React.FC = () => (
  <Skeleton variant="circular" className="mx-auto h-32 w-32" />
);

export const SkeletonChip: React.FC = () => (
  <Skeleton className="h-8 w-24 rounded-full" />
);
