import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, Briefcase, Headphones, Loader2, Search, FileText, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contactService } from "@/services/contact.service";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
};

const CONTACT_EMAILS = [
  {
    label: "General Enquiries",
    email: "support@subbyme.com",
    icon: Mail,
  },
  {
    label: "Business & Partnerships",
    email: "partnerships@subbyme.com",
    icon: Briefcase,
  },
  {
    label: "Technical Support",
    email: "tech@subbyme.com",
    icon: Headphones,
  },
] as const;

const HOW_IT_WORKS = [
  { step: 1, title: "Find a contractor", icon: Search },
  { step: 2, title: "Post your job", icon: FileText },
  { step: 3, title: "Hire securely", icon: ShieldCheck },
];

const FAQ_ITEMS = [
  {
    q: "How do I find a verified contractor?",
    a: "Browse our contractor directory and filter by trade, location, and rating. All contractors with a verified badge have been vetted by our team.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. We use secure escrow payments. Funds are released only when the job is completed and you're satisfied with the work.",
  },
  {
    q: "What if I'm not happy with the work?",
    a: "Contact our support team. We'll work with you and the contractor to resolve any issues. Our satisfaction guarantee is part of every job.",
  },
  {
    q: "How much does SubbyMe cost?",
    a: "Contractors subscribe from $10/week. Clients pay no platform fee—you only pay for the work done. Pricing varies by contractor and job scope.",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validate = () => {
    const errors: string[] = [];
    if (!form.name.trim()) errors.push("Name is required");
    if (!form.email.trim()) errors.push("Email is required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.push("Please enter a valid email");
    if (!form.subject.trim()) errors.push("Subject is required");
    if (!form.message.trim()) errors.push("Message is required");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length > 0) {
      toast({ title: "Validation error", description: errors[0], variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      await contactService.submit(form);
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : "Failed to send. Please try again.";
      toast({ title: "Error", description: String(msg), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b bg-secondary py-16 sm:py-24">
        <motion.div
          className="container-main text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            We'd love to <span className="text-primary">hear from you.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Whether you're a contractor looking to join, a client needing assistance, or a business
            interested in partnering with SubbyMe, our team is here to help.
          </p>
        </motion.div>
      </section>

      {/* Contact Details */}
      <section className="py-16">
        <div className="container-main">
          <motion.div
            className="grid gap-6 sm:grid-cols-3"
            {...fadeIn}
          >
            {CONTACT_EMAILS.map((item) => (
              <a
                key={item.email}
                href={`mailto:${item.email}`}
                className="group flex items-start gap-4 rounded-lg border bg-card p-6 card-shadow transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_4px_12px_-2px_rgb(0_0_0/0.1)]"
                aria-label={`Email ${item.label}: ${item.email}`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.label}</h3>
                  <span className="text-primary underline underline-offset-2">{item.email}</span>
                </div>
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="border-t bg-secondary py-16">
        <div className="container-main">
          <motion.div
            className="mx-auto max-w-xl"
            {...fadeIn}
          >
            <h2 className="mb-6 text-2xl font-bold text-foreground">Send us a message</h2>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-lg border bg-card p-6 card-shadow"
            >
              <div>
                <Label htmlFor="contact-name">Name *</Label>
                <Input
                  id="contact-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  required
                  maxLength={100}
                  aria-required="true"
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <Label htmlFor="contact-subject">Subject *</Label>
                <Input
                  id="contact-subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="How can we help?"
                  required
                  maxLength={200}
                  aria-required="true"
                />
              </div>
              <div>
                <Label htmlFor="contact-message">Message *</Label>
                <Textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Your message..."
                  rows={5}
                  required
                  maxLength={2000}
                  aria-required="true"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16">
        <div className="container-main">
          <motion.div
            className="mx-auto max-w-3xl rounded-lg border bg-card p-8 card-shadow"
            {...fadeIn}
          >
            <h2 className="mb-4 text-2xl font-bold text-foreground">Trust & Safety</h2>
            <p className="text-muted-foreground leading-relaxed">
              SubbyMe is committed to providing a safe, transparent marketplace. All contractors
              undergo verification, and we use secure payment processing with escrow protection.
              Your transactions and personal information are protected, so you can hire with
              confidence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-secondary py-16">
        <div className="container-main">
          <motion.h2
            className="mb-10 text-center text-2xl font-bold text-foreground"
            {...fadeIn}
          >
            How It Works
          </motion.h2>
          <motion.div
            className="grid gap-6 sm:grid-cols-3"
            {...fadeIn}
          >
            {HOW_IT_WORKS.map((item, i) => (
              <div
                key={item.step}
                className="flex flex-col items-center rounded-lg border bg-card p-6 text-center transition-all duration-200 hover:scale-[1.02] hover:border-primary/30"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon size={28} />
                </div>
                <span className="mt-2 text-sm font-medium text-primary">Step {item.step}</span>
                <h3 className="mt-1 font-semibold text-foreground">{item.title}</h3>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container-main">
          <motion.h2
            className="mb-10 text-center text-2xl font-bold text-foreground"
            {...fadeIn}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.div className="mx-auto max-w-2xl" {...fadeIn}>
            <Accordion type="single" collapsible className="rounded-lg border bg-card">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="px-6 hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
