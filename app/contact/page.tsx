import type { Metadata } from "next";
import Image from "next/image";
import { Mail, MapPin, Globe, Clock, AlertTriangle, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us | Our Ears Are Open",
  description:
    "Get in touch with Our Ears Are Open. We're here to answer your questions and help you connect with the right support.",
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    details: site.email,
    detailsLink: `mailto:${site.email}`,
    subtext: "We respond within 24 hours",
  },
  {
    icon: MapPin,
    title: "Address",
    details: site.fullAddress,
    detailsLink: undefined,
    subtext: `${site.address.city}, ${site.address.state}`,
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: site.operatingHours.summary,
    detailsLink: undefined,
    subtext: site.operatingHours.subtext,
  },
  {
    icon: Globe,
    title: "We Operate Remotely",
    details: "Serving communities everywhere",
    detailsLink: undefined,
    subtext: "Phone & chat — no travel needed",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-28">
        <div className="absolute inset-0">
          <Image
            src="/community-bg.jpg"
            alt="Our diverse community"
            fill
            priority
            className="object-cover object-center opacity-25"
            sizes="100vw"
          />
        </div>
        <div className="container relative mx-auto px-4 text-center">
          <span className="inline-block rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm mb-4">
            We&apos;re here to help
          </span>
          <h1 className="text-balance text-4xl font-bold text-white md:text-5xl drop-shadow-md">
            Contact Us
          </h1>
          <p className="mt-5 text-pretty text-lg text-white/85 max-w-2xl mx-auto">
            Have questions or ready to get started? Reach out and our team will
            respond as soon as possible — usually within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="bg-brown py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Send Us a Message
              </h2>
              <p className="mt-2 text-muted-foreground">
                Fill out the form below and we will get back to you shortly.
              </p>

              <form className="mt-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="messageType">What can we help with?</Label>
                  <Select>
                    <SelectTrigger id="messageType">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="services">
                        Questions About Services
                      </SelectItem>
                      <SelectItem value="booking">
                        Help With Booking
                      </SelectItem>
                      <SelectItem value="volunteer">
                        Volunteer Opportunities
                      </SelectItem>
                      <SelectItem value="donations">Donations</SelectItem>
                      <SelectItem value="partnership">
                        Partnership Inquiry
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Get in Touch
              </h2>
              <p className="mt-2 text-muted-foreground">
                Multiple ways to reach our team.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {contactInfo.map((item) => (
                  <Card key={item.title} className="border-border bg-background">
                    <CardContent className="p-6">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">
                        {item.title}
                      </h3>
                      {item.detailsLink ? (
                        <a
                          href={item.detailsLink}
                          className="mt-1 block text-foreground hover:text-primary hover:underline"
                        >
                          {item.details}
                        </a>
                      ) : (
                        <p className="mt-1 text-foreground">{item.details}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {item.subtext}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Remote-first callout with photo */}
              <div className="relative mt-8 h-64 overflow-hidden rounded-xl shadow-md">
                <Image
                  src="/about-story.jpg"
                  alt="Our team connecting with the community"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-base font-semibold text-white drop-shadow">
                    100% Remote &amp; Always Accessible
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    We serve communities everywhere — phone &amp; chat, no travel required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crisis Help Box */}
      <section className="bg-crisis/10 py-12">
        <div className="container mx-auto px-4">
          <Card className="border-crisis/30 bg-background">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-crisis/20">
                    <AlertTriangle className="h-7 w-7 text-crisis" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Need Immediate Help?
                    </h3>
                    <p className="text-muted-foreground">
                      If you are in crisis or need urgent support, please reach
                      out immediately.
                    </p>
                  </div>
                </div>
                <Link href="/crisis">
                  <Button
                    size="lg"
                    className="bg-crisis text-crisis-foreground hover:bg-crisis/90"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Crisis Resources
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
