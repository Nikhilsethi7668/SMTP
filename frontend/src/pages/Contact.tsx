import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you within 24 hours.");

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-2xl">
          <div className="bg-card shadow-card border border-border rounded-xl p-8 md:p-12 animate-fade-in-up">
            {!submitted ? (
              <>
                <div className="space-y-2 text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-xl mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    Let's Talk About Your Email Needs 💬
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Whether you need help getting started or want to discuss
                    enterprise solutions, we're here to help.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        required
                        className="transition-shadow focus:shadow-warm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        required
                        className="transition-shadow focus:shadow-warm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company / Website</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Acme Inc. or https://acme.com"
                      className="transition-shadow focus:shadow-warm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="How can we help?"
                      required
                      className="transition-shadow focus:shadow-warm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your email delivery needs, expected volume, or any questions you have..."
                      required
                      rows={6}
                      className="resize-none transition-shadow focus:shadow-warm"
                    />
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
                    <strong className="text-foreground">Response time:</strong>{" "}
                    We typically respond within 24 hours during business days.
                    For urgent matters, please mention it in your message.
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-bold uppercase tracking-wide transition-all hover:shadow-hover hover:-translate-y-0.5 group"
                  >
                    <Send className="mr-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    Send Message
                  </Button>

                  <div className="text-center text-sm text-muted-foreground pt-4">
                    Prefer email?{" "}
                    <a
                      href="mailto:support@mailflow.com"
                      className="text-primary hover:underline font-medium"
                    >
                      support@mailflow.com
                    </a>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-12 space-y-6 animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Message Sent! 🎉</h2>
                  <p className="text-muted-foreground text-lg">
                    Thank you for reaching out. Our team will get back to you
                    within 24 hours.
                  </p>
                </div>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="mt-6"
                >
                  Send Another Message
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-card/50 rounded-lg border border-border">
              <div className="text-2xl mb-2">📧</div>
              <div className="font-semibold mb-1">Email Support</div>
              <a
                href="mailto:support@mailflow.com"
                className="text-sm text-primary hover:underline"
              >
                support@mailflow.com
              </a>
            </div>

            <div className="p-6 bg-card/50 rounded-lg border border-border">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold mb-1">Documentation</div>
              <a href="#docs" className="text-sm text-primary hover:underline">
                Read our docs
              </a>
            </div>

            <div className="p-6 bg-card/50 rounded-lg border border-border">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-semibold mb-1">Community</div>
              <a href="#" className="text-sm text-primary hover:underline">
                Join our Slack
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
