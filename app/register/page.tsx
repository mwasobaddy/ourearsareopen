import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = {
  title: "Sign Up | Our Ears Are Open",
  description:
    "Create your account to connect with a caring listener. Our platform is for adults 18 and over only.",
};

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: { returnUrl?: string };
}) {
  const returnUrl = searchParams?.returnUrl ?? "/book-listener";
  const loginHref = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : "/login";
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Photo Side */}
          <div className="hidden lg:block lg:sticky lg:top-24">
            <div className="relative h-[600px] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/hero-bg.jpg"
                alt="Diverse community members"
                fill
                className="object-cover object-center"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-black/25" />

              {/* Overlay content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <Logo href={undefined} variant="compact" className="[&>img]:h-10 [&>img]:w-auto mb-6" />
                <h2 className="text-2xl font-bold text-white drop-shadow">
                  Begin Your Journey
                </h2>
                <p className="mt-2 max-w-xs text-white/80 text-sm leading-relaxed">
                  Join thousands who have found support and growth with Our Ears Are Open.
                </p>
                <div className="mt-6 grid gap-3">
                  {[
                    { step: "1", title: "Create your account", sub: "Quick and secure signup" },
                    { step: "2", title: "Complete your profile", sub: "Match with the right listener" },
                    { step: "3", title: "Book your first conversation", sub: "Phone or chat — your choice" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3 rounded-lg bg-white/15 backdrop-blur-sm p-3 border border-white/20">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25 text-sm font-bold text-white">
                        {item.step}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{item.title}</div>
                        <div className="text-xs text-white/65">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="mx-auto w-full max-w-md lg:mx-0">
            <Card className="border-border">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex justify-center lg:hidden">
                  <Logo href={undefined} variant="compact" className="[&>img]:h-10" />
                </div>
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fill in your details to get started
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="First name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Last name" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ageRange">Age range (18+ only)</Label>
                    <Select>
                      <SelectTrigger id="ageRange">
                        <SelectValue placeholder="Select your age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18-24">18-24</SelectItem>
                        <SelectItem value="25-34">25-34</SelectItem>
                        <SelectItem value="35-44">35-44</SelectItem>
                        <SelectItem value="45-54">45-54</SelectItem>
                        <SelectItem value="55-64">55-64</SelectItem>
                        <SelectItem value="65+">65+</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      You must be 18 or older to use our platform. Minimum age is 18.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pronouns">Pronouns (Optional)</Label>
                    <Select>
                      <SelectTrigger id="pronouns">
                        <SelectValue placeholder="Select your pronouns" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="he-him">He/Him</SelectItem>
                        <SelectItem value="she-her">She/Her</SelectItem>
                        <SelectItem value="they-them">They/Them</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">
                      What brings you to Our Ears Are Open?
                    </Label>
                    <Select>
                      <SelectTrigger id="reason">
                        <SelectValue placeholder="Select primary reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anxiety">
                          Anxiety or Stress
                        </SelectItem>
                        <SelectItem value="depression">Depression</SelectItem>
                        <SelectItem value="relationships">
                          Relationship Issues
                        </SelectItem>
                        <SelectItem value="trauma">
                          Trauma or PTSD
                        </SelectItem>
                        <SelectItem value="grief">Grief or Loss</SelectItem>
                        <SelectItem value="self-improvement">
                          Self Improvement
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Services</Label>
                    <p className="text-xs text-muted-foreground">
                      We only offer chat conversations, phone conversations, or both.
                    </p>
                    <div className="grid gap-2 pt-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="service-chat" />
                        <Label
                          htmlFor="service-chat"
                          className="text-sm font-normal"
                        >
                          Chat conversations
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="service-phone" />
                        <Label
                          htmlFor="service-phone"
                          className="text-sm font-normal"
                        >
                          Phone conversations
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="service-both" />
                        <Label
                          htmlFor="service-both"
                          className="text-sm font-normal"
                        >
                          Both
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="privacy" required />
                      <Label
                        htmlFor="privacy"
                        className="text-sm font-normal leading-relaxed"
                      >
                        I agree to the{" "}
                        <Link
                          href="/privacy"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/terms"
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </Link>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="ageConfirm" required />
                      <Label
                        htmlFor="ageConfirm"
                        className="text-sm font-normal leading-relaxed"
                      >
                        I confirm I am 18 years or older (minimum age to use this platform)
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="consent" required />
                      <Label
                        htmlFor="consent"
                        className="text-sm font-normal leading-relaxed"
                      >
                        I consent to Our Ears Are Open contacting me about services
                        and resources
                      </Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" asChild>
                    <Link href="/profile/setup">
                      Create Account &amp; Continue
                    </Link>
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    After creating your account, you will complete a short
                    profile questionnaire before booking your first conversation.
                  </p>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href={loginHref}
                      className="text-primary hover:underline"
                    >
                      Log in
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
