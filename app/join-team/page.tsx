import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Heart,
  Clock,
  Award,
  Briefcase,
  MapPin,
  ArrowRight,
  HandHeart,
  GraduationCap,
  Sparkles,
  CalendarDays,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Join Our Team | Our Ears Are Open",
  description:
    "Be part of our dedicated team. View open positions or sign up to volunteer — we welcome those who want to contribute and support our 24/7 presence.",
};

const whyJoinUs = [
  {
    icon: Heart,
    title: "Meaningful Work",
    description:
      "Make a real difference in people's lives every day through compassionate listening.",
  },
  {
    icon: Users,
    title: "Supportive Team",
    description:
      "Join a collaborative community of people dedicated to making everyone feel heard and valued.",
  },
  {
    icon: GraduationCap,
    title: "Growth Opportunities",
    description:
      "Access continuing education, training, and professional development resources.",
  },
  {
    icon: Award,
    title: "Flexible Schedule",
    description:
      "Work on your own schedule as a 1099 independent contractor. We value your time and support work-life balance.",
  },
];

const openRoles = [
  {
    title: "Therapists",
    department: "Clinical",
    type: "Full-time / Part-time",
    location: "Remote",
    description:
      "Provide therapeutic support and guidance to individuals seeking emotional wellness. Help people process, heal, and grow in a compassionate, judgment-free space.",
  },
  {
    title: "Licensed Therapists",
    department: "Clinical",
    type: "Full-time / Part-time",
    location: "Remote",
    description:
      "Licensed professionals who offer evidence-based therapeutic services. Support our mission with your expertise while working flexibly from anywhere.",
  },
  {
    title: "Counselors",
    department: "Clinical",
    type: "Full-time / Part-time",
    location: "Remote",
    description:
      "Offer counseling and emotional support to those who need a listening ear. Help individuals navigate life challenges in a safe, confidential environment.",
  },
  {
    title: "Community Outreach Manager",
    department: "Outreach",
    type: "Full-time",
    location: "Flexible",
    description:
      "Build partnerships and increase awareness of our listening and support services in the community.",
  },
  {
    title: "Social Media Management",
    department: "Communications",
    type: "Full-time / Part-time",
    location: "Remote",
    description:
      "Manage our social presence and help share our mission with a wider audience.",
  },
  {
    title: "Team Communication Member",
    department: "Direct Support",
    type: "Full-time / Part-time",
    location: "Remote",
    description:
      "Talk or chat with the public — direct conversations and listening support. Your voice matters.",
  },
];

const volunteerBenefits = [
  {
    icon: CalendarDays,
    title: "Flexible Hours",
    description:
      "Choose hours that fit your life. Even a few hours a week makes an enormous difference.",
  },
  {
    icon: GraduationCap,
    title: "Full Training Provided",
    description:
      "We train every volunteer listener with the tools they need to have effective, compassionate conversations.",
  },
  {
    icon: Globe,
    title: "Support 24/7 Presence",
    description:
      "Volunteer listeners help keep our community active and support our 24/7 presence — keeping people connected.",
  },
  {
    icon: Sparkles,
    title: "Community Impact",
    description:
      "As a 501(c)(3) nonprofit, every volunteer hour directly supports people who need a compassionate ear.",
  },
];

export default function JoinTeamPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-28">
        <div className="absolute inset-0">
          <Image
            src="/join-team-bg.png"
            alt="Diverse team of smiling women — community, warmth, and approachability"
            fill
            priority
            className="object-cover object-center opacity-35"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/75 to-primary/50" />
        </div>
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm mb-4">
              Be the Difference
            </span>
            <h1 className="mt-3 text-balance text-4xl font-bold text-white md:text-5xl drop-shadow-md">
              Join Our Team
            </h1>
            <div className="mx-auto mt-4 h-px w-16 bg-white/40" />
            <p className="mt-6 text-lg text-white/85">
              Be a part of our dedicated team to make everyone&apos;s voice
              heard. Our goal is to expand our services to 24/7, and we can do
              that with your help. To support our 24/7 presence, we welcome those
              who want to contribute, even if they cannot commit to mandatory
              hours. Your contribution matters.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row flex-wrap">
              <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 shadow-lg">
                <a href="#open-roles">
                  <Briefcase className="mr-2 h-5 w-5" />
                  View Open Positions
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-white/70 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm">
                <Link href="/volunteer">
                  <HandHeart className="mr-2 h-5 w-5" />
                  Sign Up as Volunteer
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-white/50 text-white/90 hover:bg-white/15 bg-transparent backdrop-blur-sm">
                <Link href="/workforce-apply">
                  <Users className="mr-2 h-5 w-5" />
                  Become a Listener
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="bg-brown py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Why Join Our Ears Are Open?
            </h2>
            <p className="mt-4 text-muted-foreground">
              We are more than a workplace — we are a community committed to
              making a difference, one conversation at a time.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyJoinUs.map((item) => (
              <Card key={item.title} className="border-border bg-background transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:shadow-primary/8">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-roles" className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Career opportunities
              </p>
              <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
                Open Positions
              </h2>
              <div className="mx-auto mt-4 h-px w-16 bg-primary/30" />
              <p className="mt-4 text-muted-foreground">
                We hire on a 1099 basis. $10.99 per conversation. We provide
                headsets (when you can&apos;t obtain one), training, and weekly pay.
                If you cannot get Wi-Fi or cannot afford Wi-Fi, do not let that
                stop you from applying — in certain situations, we can assist you.
              </p>
            </div>

            <div className="space-y-4">
              {openRoles.map((role) => (
                <Card
                  key={role.title}
                  className="border-border transition-all hover:shadow-md hover:border-primary/30"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {role.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{role.department}</Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {role.type}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {role.location}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                      <Button className="shrink-0" asChild>
                        <Link href="/workforce-apply">
                          View & Apply
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Don&apos;t see a role that fits?{" "}
                <Link href="/workforce-apply" className="text-primary hover:underline">
                  Fill out the form
                </Link>{" "}
                and we&apos;ll reach out with next steps. We always email you
                about jobs available in your area when we cannot bring you on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section id="volunteer" className="bg-brown py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Give back
              </p>
              <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
                Volunteer With Us — Make a Difference
              </h2>
              <div className="mx-auto mt-4 h-px w-16 bg-primary/30" />
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                Our Ears Are Open is also a 501(c)(3) charitable organization in
                the state of Florida. Volunteer listeners are the heartbeat of
                our community — keeping conversations and support alive and
                helping us maintain a 24/7 presence. Volunteers will go through
                the same training program as paid team members.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {volunteerBenefits.map((benefit) => (
                <Card
                  key={benefit.title}
                  className="border-border bg-background transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:shadow-primary/8"
                >
                  <CardContent className="flex gap-5 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <benefit.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {benefit.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
              <h3 className="text-xl font-bold text-foreground">
                Ready to Give Your Time?
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Volunteer listeners help us support the community 24/7. Fill out
                the form on our volunteer page — we will reach out with next
                steps and training details.
              </p>
              <Button className="mt-6" size="lg" asChild>
                <Link href="/volunteer">
                  <HandHeart className="mr-2 h-5 w-5" />
                  Sign Up to Volunteer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Encouragement + Small print */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border border-border bg-card p-6 md:p-8">
              <p className="text-muted-foreground leading-relaxed">
                Remember, we are a community. No matter where you are in life,
                don&apos;t think you can&apos;t do this because you may be exactly
                who we need. The word No doesn&apos;t mean it&apos;s the end of the
                line. We always email you about jobs available in your area when
                we cannot bring you on. This is about putting you in a better
                position than you were the day before.
              </p>
              <p className="mt-6 text-sm text-muted-foreground">
                To my Elderly community: we will work with you to navigate our
                website.
              </p>
            </div>
            <p className="mt-8 text-center text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Our Ears Are Open LLC is a non-discriminatory business. We prioritize
              hiring the elderly, Veterans, single parents, college students, and
              second-chancers who pass our training program. We are limited in the
              number of paid members we can add to our staff each year. I plan to
              work my butt off to change that.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
