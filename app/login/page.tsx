import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log In | Our Ears Are Open",
  description:
    "Log in to your Our Ears Are Open account to access your conversations, profile, and resources.",
};

export default function LoginPage() {
  return (
    <section className="min-h-[calc(100vh-200px)] bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Photo Side */}
          <div className="hidden lg:block">
            <div className="relative h-[500px] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/mission-photo.jpg"
                alt="Our diverse community of listeners"
                fill
                className="object-cover"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/40 to-black/20" />

              {/* Overlay content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <h2 className="text-2xl font-bold text-white drop-shadow">
                  Welcome Back
                </h2>
                <p className="mt-2 max-w-xs text-white/80 text-sm leading-relaxed">
                  Continue your journey. A caring listener is always here for you.
                </p>
                <div className="mt-6 grid gap-2">
                  {[
                    { title: "Track your progress", sub: "View conversation history" },
                    { title: "Book a listener easily", sub: "Schedule at your convenience" },
                    { title: "Access resources", sub: "Exclusive member materials" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center gap-3 rounded-lg bg-white/15 backdrop-blur-sm p-3 border border-white/20">
                      <div className="h-2 w-2 rounded-full bg-white/80 shrink-0" />
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

          {/* Login Form */}
          <div className="mx-auto w-full max-w-md">
            <Card className="border-border">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex justify-center lg:hidden">
                  <Logo href={undefined} variant="compact" className="[&>img]:h-10" />
                </div>
                <CardTitle className="text-2xl">Log In</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enter your credentials to access your account
                </p>
              </CardHeader>
              <CardContent>
                <Suspense fallback={null}>
                  <LoginForm />
                </Suspense>

                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Button variant="outline" type="button">
                      Google
                    </Button>
                    <Button variant="outline" type="button">
                      Apple
                    </Button>
                  </div>

                  <p className="mt-6 text-center text-sm text-muted-foreground">
                    Do not have an account?{" "}
                    <Link
                      href="/register"
                      className="text-primary hover:underline"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
