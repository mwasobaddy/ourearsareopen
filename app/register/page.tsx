import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

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
                <Suspense fallback={null}>
                  <RegisterForm />
                </Suspense>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  After creating your account, you will complete a short
                  profile questionnaire before booking your first conversation.
                </p>

                <p className="mt-3 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href={loginHref}
                    className="text-primary hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
