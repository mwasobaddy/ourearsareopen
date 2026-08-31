"use client";

import Link from "next/link";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BookListenerStep5AndPayment() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Step 5: Your Information OR Sign up / Log in — only when NOT logged in */}
      {!isAuthenticated && (
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              5
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Sign Up or Log In
            </h2>
          </div>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-center justify-center gap-6 p-8 text-center">
              <p className="text-muted-foreground max-w-lg">
                You need to create an account or log in to book a listener. We
                can&apos;t wait to connect you with someone who will truly hear you.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/register?returnUrl=/book-listener">
                  <Button size="lg" className="w-full sm:w-auto group">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login?returnUrl=/book-listener">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-primary/40"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Log In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ready to Connect — updated copy */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle>Ready to Connect?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-muted-foreground">
                You will be redirected to complete payment. All payments go
                directly to listeners who are elderly, veterans, single parents,
                college students, and those who need a second chance. We do have
                free options available.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Paid conversation:{" "}
                <span className="font-semibold text-foreground">$10.99</span>
              </p>
            </div>
            <Link href="/payment">
              <Button size="lg">
                Continue to Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
