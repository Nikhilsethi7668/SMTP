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
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        transparent ? "bg-transparent" : "bg-background/95 backdrop-blur-sm border-b border-border"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">MailFlow</span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#docs" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              API Docs
            </a>
            <button
              onClick={() => navigate("/contact")}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
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
