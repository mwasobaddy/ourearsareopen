import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = {
  title: "Complete Your Profile | Our Ears Are Open",
  description:
    "Tell us a little about yourself so we can match you with the right team member.",
};

export default function ProfileSetupPage() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <Logo href={undefined} variant="compact" className="[&>img]:h-12" />
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Complete Your Profile
            </h1>
            <p className="mt-3 text-muted-foreground">
              Help us understand you better so we can match you with the right
              team member. All information is confidential.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-xs">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div className="h-px w-10 bg-primary/30" />
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-xs">
              2
            </div>
            <div className="h-px w-10 bg-border" />
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground font-semibold text-xs">
              3
            </div>
            <span className="ml-2">Step 2 of 3 — About You</span>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl">A few quick questions</CardTitle>
              <p className="text-sm text-muted-foreground">
                This helps us connect you with a team member who is the best fit
                for you. You can update this at any time from your profile.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender Identity */}
                <div className="space-y-2">
                  <Label htmlFor="genderIdentity">Gender Identity</Label>
                  <Select>
                    <SelectTrigger id="genderIdentity">
                      <SelectValue placeholder="Select your gender identity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="man">Man</SelectItem>
                      <SelectItem value="woman">Woman</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="other">
                        Other / Self-describe
                      </SelectItem>
                      <SelectItem value="prefer-not">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sexual Orientation */}
                <div className="space-y-2">
                  <Label htmlFor="sexualOrientation">Sexual Orientation</Label>
                  <Select>
                    <SelectTrigger id="sexualOrientation">
                      <SelectValue placeholder="Select your sexual orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight">Straight / Heterosexual</SelectItem>
                      <SelectItem value="gay-lesbian">Gay / Lesbian</SelectItem>
                      <SelectItem value="bisexual">Bisexual</SelectItem>
                      <SelectItem value="queer">Queer</SelectItem>
                      <SelectItem value="other">
                        Other / Self-describe
                      </SelectItem>
                      <SelectItem value="prefer-not">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Relationship Status */}
                <div className="space-y-2">
                  <Label htmlFor="relationshipStatus">
                    Relationship Status
                  </Label>
                  <Select>
                    <SelectTrigger id="relationshipStatus">
                      <SelectValue placeholder="Select your relationship status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="in-relationship">
                        In a relationship
                      </SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                      <SelectItem value="prefer-not">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Religion / Faith */}
                <div className="space-y-2">
                  <Label htmlFor="religionImportance">
                    How important is religion or faith in your life?
                  </Label>
                  <Select>
                    <SelectTrigger id="religionImportance">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very">Very important</SelectItem>
                      <SelectItem value="somewhat">
                        Somewhat important
                      </SelectItem>
                      <SelectItem value="not-at-all">
                        Not important at all
                      </SelectItem>
                      <SelectItem value="prefer-not">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Spiritual */}
                <div className="space-y-2">
                  <Label htmlFor="spiritual">
                    Do you consider yourself spiritual?
                  </Label>
                  <Select>
                    <SelectTrigger id="spiritual">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="prefer-not">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Prior Therapy */}
                <div className="space-y-2">
                  <Label htmlFor="priorTherapy">
                    Have you ever been in therapy before?
                  </Label>
                  <Select>
                    <SelectTrigger id="priorTherapy">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Link href="/book-listener">
                    <Button type="submit" className="w-full" size="lg">
                      Continue to Booking
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    You can skip this and complete it later from your profile.
                  </p>
                  <div className="mt-3 text-center">
                    <Link
                      href="/book-listener"
                      className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
                    >
                      Skip for now
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            All information is kept strictly confidential and is never shared
            without your consent.
          </p>
        </div>
      </div>
    </section>
  );
}
