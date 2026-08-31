import type { Metadata } from "next";
import Link from "next/link";
import {
  HandHeart,
  ArrowRight,
  CheckCircle,
  Upload,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Volunteer | Our Ears Are Open",
  description:
    "Sign up to volunteer as a listener. Help us maintain a 24/7 presence and make a difference in your community.",
};

export default function VolunteerPage() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Give back
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
              Volunteer Application
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Our Ears Are Open is also a 501(c)(3) charitable organization in the
              state of Florida. Volunteer listeners are the heartbeat of our
              community. Fill out the form below and we&apos;ll reach out with
              next steps and training details.
            </p>
          </div>

          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-sm font-medium text-foreground">
              We do not discriminate based on age, religion, or sexual orientation.
              A criminal background does not stop you from joining our team. You
              must be 18+ to volunteer or be a paid team member.
            </p>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Ready to Make a Difference?
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Submit your details and a one-minute video or written intro so we
                can get to know you. You are applying for a{" "}
                <strong>volunteer position</strong>.
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
                  value="volunteer"
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

          <p className="mt-8 text-center text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Our Ears Are Open LLC is a non-discriminatory business. We prioritize
            hiring the elderly, Veterans, single parents, college students, and
            second-chancers who pass our training program.
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
