import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Zap, Shield, BarChart3, Code, Mail, Star } from "lucide-react";
import dashboardMockup from "@/assets/dashboard-mockup.png";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Delivery",
      description: "Send emails in milliseconds with 99.9% uptime guarantee",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance with SOC 2, GDPR",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track opens, clicks, bounces, and conversions instantly",
    },
    {
      icon: Code,
      title: "Developer-First API",
      description: "Simple REST API with SDKs for all major languages",
    },
  ];

  const trustedBrands = [
    "Stripe", "Shopify", "Slack", "GitHub", "Notion", "Figma"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar transparent />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-32 h-32 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8 animate-fade-in-up">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 w-fit">
                ✨ 3,000 free emails — no credit card required
              </Badge>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Deliver Smarter Emails.{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Track Every Click.
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                  Send bulk transactional and marketing emails effortlessly. Built for developers,
                  trusted by marketing teams.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="font-bold text-base group transition-all hover:shadow-hover hover:-translate-y-0.5"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="font-semibold text-base transition-all hover:shadow-card"
                >
                  Log In
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/contact")}
                  className="font-semibold text-base transition-all hover:shadow-card"
                >
                  Contact Sales
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  No credit card needed
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Setup in 5 minutes
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Cancel anytime
                </div>
              </div>
            </div>

            {/* Right: Dashboard Mockup */}
            <div className="relative animate-fade-in-up delay-200">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
              <img
                src={dashboardMockup}
                alt="Email analytics dashboard"
                className="relative w-full rounded-xl shadow-hover border border-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 px-4 border-y border-border bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by 10,000+ developers and teams worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {trustedBrands.map((brand) => (
              <div
                key={brand}
                className="text-2xl font-bold text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything you need to send emails at scale
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Fast. Reliable. Developer-friendly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 bg-card rounded-xl border border-border shadow-card hover:shadow-hover transition-all hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 bg-card rounded-xl border border-border">
              <div className="text-left space-y-4">
                <h3 className="text-xl font-bold">Free</h3>
                <div className="text-4xl font-bold">$0</div>
                <p className="text-sm text-muted-foreground">3,000 emails/month</p>
                <ul className="space-y-3 pt-4">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    All core features
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    API access
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Basic analytics
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 bg-gradient-primary rounded-xl border-2 border-primary relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-white text-primary">Popular</Badge>
              </div>
              <div className="text-left space-y-4">
                <h3 className="text-xl font-bold text-white">Pro</h3>
                <div className="text-4xl font-bold text-white">$49</div>
                <p className="text-sm text-white/80">50,000 emails/month</p>
                <ul className="space-y-3 pt-4">
                  <li className="flex items-center gap-2 text-sm text-white">
                    <Check className="w-4 h-4" />
                    Everything in Free
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white">
                    <Check className="w-4 h-4" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2 text-sm text-white">
                    <Check className="w-4 h-4" />
                    Priority support
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-8 bg-card rounded-xl border border-border">
              <div className="text-left space-y-4">
                <h3 className="text-xl font-bold">Enterprise</h3>
                <div className="text-4xl font-bold">Custom</div>
                <p className="text-sm text-muted-foreground">Unlimited emails</p>
                <ul className="space-y-3 pt-4">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Dedicated support
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Custom SLA
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="font-bold transition-all hover:shadow-hover hover:-translate-y-0.5"
          >
            Start Free Trial
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-primary rounded-2xl p-12 text-center space-y-6 shadow-hover">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to scale your emails?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of developers and teams sending millions of emails every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/auth")}
                className="font-bold text-base bg-white text-primary hover:bg-white/90"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/contact")}
                className="font-semibold text-base border-white text-white hover:bg-white/10"
              >
                Talk to Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">MailFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The modern email delivery platform for developers and teams.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#docs" className="hover:text-foreground transition-colors">API Docs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/contact")} className="hover:text-foreground transition-colors">Contact</button></li>
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 MailFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
