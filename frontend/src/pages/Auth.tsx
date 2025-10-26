import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mail, Github, ArrowLeft } from "lucide-react";
import emailIllustration from "@/assets/email-platform-illustration.png";
import api from "@/axiosInstance";
import { Spinner } from "@/components/ui/spinner";
const taglines = [
  "Deliver at scale. No limits.",
  "Trusted by developers and marketers alike.",
  "Start free — send your first 3,000 emails today!",
  "Deliver faster. Track better. Send smarter.",
];

const Auth = () => {
  const query = new URLSearchParams(useLocation().search);
  const activeAuth = query.get("auth") || "";
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentTagline, setCurrentTagline] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if(!email || !password){
        alert("Please fill all required fields");
        throw new Error("Please fill all required feilds");
      }
      const response = await api.post("/auth/login", {email,password});
      if(response.status === 200){
        console.log("Login successful");
        navigate("/app/dashboard/accounts");
      }
    } catch (error) {
      alert("Login failed. Please try again.");
      setIsLoading(false);
    }
    console.log("Login attempt");
  };

  const handleSignup = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    console.log("Signup attempt");
    if (!email || !password || !fullName || !username || !confirmPassword) {
      alert("Please fill all required fields");
      throw new Error("Please fill all required fields");
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      throw new Error("Passwords do not match");
    }
    try {
      const response = await api.post("/auth/signup", {
        fullName,
        username,
        email,
        companyName,
        password,
      });
      if (response.status === 201) {
        console.log("Signup successful, OTP sent to email");
        navigate(
  `/verify-email?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}`
);

      }
    } catch (error) {
      alert("Signup failed. Please try again.");
      console.error("Signup error:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex flex-col">
      {/* Simple header with back button */}
      <div className="p-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Brand Area */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    MailFlow
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Email Delivery Platform
                  </p>
                </div>
              </div>

              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                ✨ 3,000 emails free on signup — limited time!
              </Badge>
            </div>

            <img
              src={emailIllustration}
              alt="Email delivery platform illustration"
              className="w-full max-w-lg"
            />

            <div className="space-y-4">
              <p
                key={currentTagline}
                className="text-2xl font-semibold text-foreground animate-fade-in-up"
              >
                {taglines[currentTagline]}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">99.9%</div>
                  <div className="text-sm text-muted-foreground">
                    Deliverability Rate
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">5B+</div>
                  <div className="text-sm text-muted-foreground">
                    Emails Sent Monthly
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md bg-card shadow-card border border-border rounded-xl p-8 animate-fade-in-up">
              {/* Mobile header */}
              <div className="lg:hidden mb-6 text-center">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">MailFlow</span>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                  ✨ 3,000 free emails
                </Badge>
              </div>

              <Tabs
                defaultValue={activeAuth ? activeAuth : "login"}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Log in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-6">
                  <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">Welcome back 👋</h1>
                    <p className="text-muted-foreground">
                      Your emails are waiting. Log in to manage your campaigns,
                      API keys, and reports.
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Work Email</Label>
                      <Input
                        onChangeEvent={(val) => setEmail(val)}
                        id="login-email"
                        type="email"
                        placeholder="you@company.com"
                        required
                        className="transition-shadow focus:shadow-warm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        onChangeEvent={(val) => setPassword(val)}
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="transition-shadow focus:shadow-warm"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <label
                          htmlFor="remember"
                          className="text-sm text-muted-foreground cursor-pointer select-none"
                        >
                          Remember me
                        </label>
                      </div>
                      <a
                        href="#"
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </a>
                    </div>
                    {isLoading ? (
                      <Button className="w-full font-bold uppercase tracking-wide transition-all hover:shadow-hover hover:-translate-y-0.5">
                        <Spinner />
                      </Button>
                    ): (
                      <Button
                        type="submit"
                        className="w-full font-bold uppercase tracking-wide transition-all hover:shadow-hover hover:-translate-y-0.5"
                      >
                        Log In to Dashboard →
                      </Button>
                    )}

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          or continue with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="transition-all hover:shadow-card hover:-translate-y-0.5"
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Google
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="transition-all hover:shadow-card hover:-translate-y-0.5"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground pt-4">
                      New to the platform?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          const signupTab = document.querySelector(
                            '[value="signup"]'
                          ) as HTMLElement;
                          signupTab?.click();
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        Create your free account
                      </button>{" "}
                      — your first 3,000 emails are on us 🚀
                    </div>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup" className="space-y-6">
                  <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">
                      Start Sending Smarter Emails ✉️
                    </h1>
                    <p className="text-muted-foreground">
                      Set up your account and get your first 3,000 emails free.
                    </p>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        onChangeEvent={(val) => setFullName(val)}
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        required
                        className="transition-shadow focus:shadow-warm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Username</Label>
                      <Input
                        onChangeEvent={(val) => setUsername(val)}
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        required
                        className="transition-shadow focus:shadow-warm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Work Email</Label>
                      <Input
                        onChangeEvent={(val) => setEmail(val)}
                        id="signup-email"
                        type="email"
                        placeholder="you@company.com"
                        required
                        className="transition-shadow focus:shadow-warm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-company">
                        Company{" "}
                        <span className="text-muted-foreground text-xs">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        onChangeEvent={(val) => setCompanyName(val)}
                        id="signup-company"
                        type="text"
                        placeholder="Acme Inc."
                        className="transition-shadow focus:shadow-warm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        onChangeEvent={(val) => setPassword(val)}
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="transition-shadow focus:shadow-warm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input
                        onChangeEvent={(val) => setConfirmPassword(val)}
                        id="signup-confirm"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="transition-shadow focus:shadow-warm"
                      />
                    </div>

                    <div className="bg-muted/50 border border-border rounded-lg p-3 text-sm text-muted-foreground">
                      💳 No credit card needed. Get started in minutes.
                    </div>

                    {isLoading ? (
                      <Spinner />
                    ) : (
                      <Button
                        type="submit"
                        className="w-full font-bold uppercase tracking-wide transition-all hover:shadow-hover hover:-translate-y-0.5"
                      >
                        Create Free Account →
                      </Button>
                    )}

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          or sign up with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="transition-all hover:shadow-card hover:-translate-y-0.5"
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Google
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="transition-all hover:shadow-card hover:-translate-y-0.5"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground pt-4">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          const loginTab = document.querySelector(
                            '[value="login"]'
                          ) as HTMLElement;
                          loginTab?.click();
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        Log in
                      </button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
