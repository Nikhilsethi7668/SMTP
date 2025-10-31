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

      <div className="flex min-h-screen items-center justify-center p-4 pt-24">
        <div className="w-full max-w-2xl">
          <div className="animate-fade-in-up rounded-xl border border-border bg-card p-8 shadow-card md:p-12">
            {!submitted ? (
              <>
                <div className="mb-8 space-y-2 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-primary">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold md:text-4xl">
                    Let's Talk About Your Email Needs 💬
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Whether you need help getting started or want to discuss enterprise solutions,
                    we're here to help.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
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

                  <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                    <strong className="text-foreground">Response time:</strong> We typically respond
                    within 24 hours during business days. For urgent matters, please mention it in
                    your message.
                  </div>

                  <Button
                    type="submit"
                    className="group w-full font-bold uppercase tracking-wide transition-all hover:-translate-y-0.5 hover:shadow-hover"
                  >
                    <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    Send Message
                  </Button>

                  <div className="pt-4 text-center text-sm text-muted-foreground">
                    Prefer email?{" "}
                    <a
                      href="mailto:support@mailflow.com"
                      className="font-medium text-primary hover:underline"
                    >
                      support@mailflow.com
                    </a>
                  </div>
                </form>
              </>
            ) : (
              <div className="animate-fade-in-up space-y-6 py-12 text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Message Sent! 🎉</h2>
                  <p className="text-lg text-muted-foreground">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                </div>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-6">
                  Send Another Message
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-6 text-center md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card/50 p-6">
              <div className="mb-2 text-2xl">📧</div>
              <div className="mb-1 font-semibold">Email Support</div>
              <a
                href="mailto:support@mailflow.com"
                className="text-sm text-primary hover:underline"
              >
                support@mailflow.com
              </a>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-6">
              <div className="mb-2 text-2xl">📚</div>
              <div className="mb-1 font-semibold">Documentation</div>
              <a href="#docs" className="text-sm text-primary hover:underline">
                Read our docs
              </a>
            </div>

            <div className="rounded-lg border border-border bg-card/50 p-6">
              <div className="mb-2 text-2xl">💬</div>
              <div className="mb-1 font-semibold">Community</div>
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
