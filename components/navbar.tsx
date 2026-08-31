"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, Phone, User, LayoutDashboard, Shield } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/community", label: "Community" },
  { href: "/book-listener", label: "Book a Listener" },
  { href: "/chat-queue", label: "Chat Queue" },
  { href: "/join-team", label: "Join Our Team" },
  { href: "/donate", label: "Donate" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, role } = useAuth();

  const rightSection = (
    <>
      <Link href="/crisis">
        <Button
          variant="outline"
          size="sm"
          className="border-crisis text-crisis hover:bg-crisis hover:text-crisis-foreground bg-transparent transition-all duration-300 hover:scale-105 hover:shadow-md group"
        >
          <Phone className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:animate-bounce-gentle" />
          Crisis Help
        </Button>
      </Link>
      {isAuthenticated ? (
        <>
          {(role === "customer" || !role) && (
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
          )}
          {role === "listener" && (
            <Link href="/team-member">
              <Button variant="outline" size="sm">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Team Portal
              </Button>
            </Link>
          )}
          {role === "admin" && (
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          {role === "super_admin" && (
            <Link href="/super-admin">
              <Button variant="outline" size="sm">
                <Shield className="mr-2 h-4 w-4" />
                Super Admin
              </Button>
            </Link>
          )}
          <Link href="/login">
            <Button variant="ghost" size="sm">Log out</Button>
          </Link>
        </>
      ) : (
        <>
          <Link href="/login">
            <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Sign Up</Button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/98 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-background/95">
      <div className="container mx-auto flex h-20 min-w-0 items-center justify-between gap-4 px-4">
        <div className="shrink-0">
          <Logo href="/" priority />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden min-w-0 shrink items-center gap-4 xl:gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-primary group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:gap-3 lg:flex">
          {rightSection}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col gap-6 pt-6">
              <Logo href="/" variant="compact" className="[&>img]:h-12" onClick={() => setIsOpen(false)} />

              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Link href="/crisis" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-crisis text-crisis hover:bg-crisis hover:text-crisis-foreground bg-transparent"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Crisis Help
                  </Button>
                </Link>
                {isAuthenticated ? (
                  <>
                    {(role === "customer" || !role) && (
                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full bg-transparent">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                    )}
                    {role === "listener" && (
                      <Link href="/team-member" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Team Portal
                        </Button>
                      </Link>
                    )}
                    {role === "admin" && (
                      <Link href="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Admin
                        </Button>
                      </Link>
                    )}
                    {role === "super_admin" && (
                      <Link href="/super-admin" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <Shield className="mr-2 h-4 w-4" />
                          Super Admin
                        </Button>
                      </Link>
                    )}
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full bg-transparent">
                        Log out
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full bg-transparent">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
