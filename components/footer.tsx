import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

const footerLinks = {
  services: [
    { href: "/book-listener", label: "Phone Conversations" },
    { href: "/book-listener", label: "Chat Conversations" },
    { href: "/community", label: "Community Rooms" },
    { href: "/crisis", label: "Crisis Care" },
  ],
  about: [
    { href: "/about", label: "Our Story" },
    { href: "/about#team", label: "Our Team" },
    { href: "/about#values", label: "Our Values" },
    { href: "/about#faq", label: "FAQ" },
  ],
  getInvolved: [
    { href: "/volunteer", label: "Volunteer" },
    { href: "/join-team", label: "Careers" },
    { href: "/donate", label: "Donate" },
    { href: "/contact", label: "Partner With Us" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-brown">
      {/* Crisis Banner */}
      <div className="bg-crisis px-4 py-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-crisis/0 via-crisis-foreground/5 to-crisis/0 animate-pulse-soft" />
        <div className="container relative mx-auto flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-crisis-foreground">
            <Phone className="h-5 w-5 animate-bounce-gentle" />
            <span className="font-medium">
              Need immediate help? Call our crisis line:
            </span>
          </div>
          <Link href="/crisis">
            <Button
              variant="secondary"
              size="sm"
              className="bg-crisis-foreground text-crisis hover:bg-crisis-foreground/90"
            >
              988 Suicide & Crisis Lifeline
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Logo href="/" variant="compact" className="[&>img]:h-11" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Accessible, inclusive listening support for adults 18+. We believe
              everyone deserves a compassionate ear and a safe space to speak freely.
            </p>
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                Need someone to listen?
              </p>
              <Link href="/book-listener" className="mt-1 inline-flex items-center text-sm text-primary hover:underline font-medium">
                Book a Listener →
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:text-primary transition-colors duration-300"
              >
                <Mail className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                <span>{site.email}</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{site.fullAddress}</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-all duration-300 hover:text-primary hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">About Us</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-all duration-300 hover:text-primary hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Get Involved</h3>
            <ul className="space-y-3">
              {footerLinks.getInvolved.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-all duration-300 hover:text-primary hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Our Ears Are Open. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Terms of Service
            </Link>
            <Link
              href="/accessibility"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
