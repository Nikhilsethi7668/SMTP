import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Mail, ChevronRight, BarChart3, Shield, Zap } from "lucide-react";

interface NavbarProps {
  transparent?: boolean;
}

export const Navbar = ({ transparent = false }: NavbarProps) => {
  const navigate = useNavigate();

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all ${
        transparent ? "bg-transparent" : "border-b border-border bg-background/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">MailFlow</span>
          </button>

          <div className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              Pricing
            </a>
            <a
              href="#docs"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              API Docs
            </a>
            <button
              onClick={() => navigate("/contact")}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              Contact
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="hidden sm:inline-flex"
          >
            Log In
          </Button>
          <Button onClick={() => navigate("/auth")} className="font-semibold">
            Get Started Free
          </Button>
        </div>
      </div>
    </nav>
  );
};
