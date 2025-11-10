import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ArrowLeft } from "lucide-react";
interface AppHeaderProps {
  onClickAction?: () => void;
  headings: string;
  icon?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onClickAction, headings }) => {
  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-card px-4 py-3 shadow-sm">
      {/* Left: Title & Icon */}
      <div onClick={onClickAction} className="flex cursor-pointer items-center gap-3">
        <ArrowLeft className="h-5 w-5" />
        <h1 className="text-xl font-semibold text-foreground">{headings}</h1>
      </div>
    </header>
  );
};
