"use client";

import Link from "next/link";
import { Phone } from "lucide-react";

export function CrisisButton() {
  return (
    <Link
      href="/crisis"
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-crisis px-4 py-3 text-crisis-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-crisis/30 focus:outline-none focus:ring-2 focus:ring-crisis focus:ring-offset-2 md:right-6 md:bottom-6 group animate-fade-in-up"
      aria-label="Crisis Help - Click for immediate support"
    >
      <Phone className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
      <span className="font-medium">Crisis Help</span>
      {/* Pulse ring effect */}
      <span className="absolute inset-0 rounded-full bg-crisis animate-ping opacity-20" />
    </Link>
  );
}
