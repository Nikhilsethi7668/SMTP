import * as React from "react";
import { cn } from "@/lib/utils";

interface EmailInputProps extends React.ComponentProps<"input"> {
  onEmailChange?: (email: string) => void; // Optional callback to notify parent
}

const Input = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ className, type = "text", onEmailChange, value, ...props }, ref) => {
    const [email, setEmail] = React.useState<string>(
      typeof value === "string" ? value : ""
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setEmail(newValue);
      if (onEmailChange) onEmailChange(newValue); // notify parent
    };

    return (
      <input
        type={type}
        value={email}
        onChange={handleChange}
        ref={ref}
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
