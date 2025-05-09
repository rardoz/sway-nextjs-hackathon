import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { InputProps } from "./types";

export default function Input({ className, autoFocus, ...props }: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <input
      ref={inputRef}
      data-testid="input"
      className={cn(
        "flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      autoFocus={autoFocus}
      {...props}
    />
  );
}
