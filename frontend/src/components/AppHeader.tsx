import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ArrowLeft } from 'lucide-react';
interface AppHeaderProps {
  onClickAction?: () => void;
  headings: string;
  icon?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onClickAction,
  headings,
}) => {
  return (
    <header className="flex items-center justify-between bg-card border-b border-border px-4 py-3 shadow-sm h-20">
      {/* Left: Title & Icon */}
      <div onClick={onClickAction} className="flex items-center gap-3 cursor-pointer">
        <ArrowLeft className="h-5 w-5" />
        <h1 className="text-xl font-semibold text-foreground">{headings}</h1>
      </div>

    </header>
  );
};
