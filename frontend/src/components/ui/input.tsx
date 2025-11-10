import * as React from "react";
import { cn } from "@/lib/utils";

interface EmailInputProps extends React.ComponentProps<"input"> {
  onChangeEvent?: (email: string) => void;
  onChangeEvent?: (email: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ className, type = "text", onChangeEvent, value, onChange, ...props }, ref) => {
    const [email, setEmail] = React.useState<string>(
      typeof value === "string" ? value : ""
    );

    // Sync internal state with value prop changes
    React.useEffect(() => {
      if (value !== undefined) {
        const newValue = typeof value === "string" ? value : "";
        if (newValue !== email) {
          setEmail(newValue);
        }
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setEmail(newValue);
      
      // Call standard onChange if provided
      if (onChange) {
        onChange(e);
      }
      
      // Call custom onChangeEvent if provided (for backward compatibility)
      if (onChangeEvent) {
        onChangeEvent(newValue);
      }
    };

    return (
      <input
        ref={ref}
        ref={ref}
        type={type}
        value={isControlled ? (value as string) : internalValue}
        value={isControlled ? (value as string) : internalValue}
        onChange={handleChange}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
