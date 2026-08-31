import type { Metadata } from "next";
import Link from "next/link";
import {
  HandHeart,
  ArrowRight,
  CheckCircle,
  Upload,
  Video,
  Wifi,
  Headphones,
  GraduationCap,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = {
  title: "Workforce Application | Our Ears Are Open",
  description:
    "Apply for a paid position at Our Ears Are Open. We hire on a 1099 basis. We provide headsets, training, and weekly pay. Apply to join our team.",
};

export default function WorkforceApplyPage() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Career opportunities
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
              Workforce Application
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Fill out the form below and we&apos;ll reach out with the next steps
              and training details. We do not discriminate based on age, religion,
              or sexual orientation. A criminal background does not stop you from
              joining our team. You must be 18 and older to join as a volunteer or
              as a paid staff member.
            </p>
          </div>

          {/* 1099, Wi-Fi, Headsets, Training, Pay info */}
          <div className="mb-6 space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-5">
            <p className="text-sm font-semibold text-foreground">
              Noted: We hire on a 1099 basis.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  You must have reliable Wi-Fi (in most cases). If you cannot get
                  Wi-Fi or cannot afford Wi-Fi, do not let that stop you from
                  applying. In certain situations, we can assist you with obtaining
                  Wi-Fi service.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>We will provide headsets when you can&apos;t obtain one.</span>
              </li>
              <li className="flex items-start gap-2">
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Training provided.</span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Weekly pay.</span>
              </li>
            </ul>
            <p className="text-sm font-medium text-foreground">
              Do not hesitate to apply.
            </p>
          </div>

          {/* Encouragement */}
          <div className="mb-6 rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground italic">
              Remember, we are a community. No matter where you are in life,
              don&apos;t think you can&apos;t do this because you may be exactly who
              we need. The word No doesn&apos;t mean it&apos;s the end of the line.
              We always email you about jobs available in your area when we cannot
              bring you on. This is about putting you in a better position than you
              were the day before.
            </p>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Apply for a Paid Position
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Submit your details and a one-minute video or written intro so we
                can get to know you. You are applying for a <strong>job/paid position</strong>.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="applyFirstName">First Name</Label>
                    <Input
                      id="applyFirstName"
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applyLastName">Last Name</Label>
                    <Input
                      id="applyLastName"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applyEmail">Email</Label>
                  <Input
                    id="applyEmail"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <input
                  type="hidden"
                  name="applicationType"
                  value="workforce"
                  readOnly
                />

                <div className="space-y-2">
                  <Label htmlFor="resume" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Resume (required)
                  </Label>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    name="resume"
                    className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    PDF or Word document
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    One-minute intro (video or written)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Upload a short video introducing yourself, or paste a link.
                    Alternatively, write a short intro below.
                  </p>
                  <Input
                    id="videoLink"
                    type="url"
                    placeholder="Paste video link (e.g. Google Drive, YouTube unlisted)"
                  />
                  <Input
                    id="videoFile"
                    type="file"
                    accept="video/*"
                    className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground file:cursor-pointer"
                  />
                  <Textarea
                    id="writtenIntro"
                    placeholder="Or introduce yourself in a short paragraph (who you are, why you want to join, what you bring)."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Submit Application
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Elderly community note */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            To my Elderly community: we will work with you to navigate our
            website.
          </p>

          {/* Small print — LLC non-discriminatory */}
          <p className="mt-8 text-center text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Our Ears Are Open LLC is a non-discriminatory business. We prioritize
            hiring the elderly, Veterans, single parents, college students, and
            second-chancers who pass our training program. We are limited in the
            number of paid members we can add to our staff each year. I plan to work
            my butt off to change that.
          </p>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/join-team" className="text-primary hover:underline">
              ← Back to Join Our Team
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
