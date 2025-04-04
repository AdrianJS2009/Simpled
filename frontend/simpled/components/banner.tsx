import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BannerProps {
  children: ReactNode;
  className?: string;
}

export default function Banner({ children, className }: BannerProps) {
  return (
    <section
      className={cn(
        "bg-gradient-to-r from-purple-600 to-indigo-600 py-16 px-4 text-center text-white",
        className
      )}
    >
      <div className="container mx-auto max-w-4xl">{children}</div>
    </section>
  );
}
