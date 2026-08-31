"use client";

import { useEffect, useState } from "react";

type AnimatedWritingAvatarProps = {
  compact?: boolean;
};

export function AnimatedWritingAvatar({ compact = false }: AnimatedWritingAvatarProps) {
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const phrases = [
    "How are you feeling today?",
    "I'm here to listen...",
    "You matter.",
    "Take your time...",
    "Let's talk about it.",
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    let charIndex = 0;
    let timeout: NodeJS.Timeout;

    const typeNextChar = () => {
      if (charIndex <= phrase.length) {
        setCurrentText(phrase.slice(0, charIndex));
        charIndex++;
        timeout = setTimeout(typeNextChar, 80);
      } else {
        setIsTyping(false);
        timeout = setTimeout(() => {
          setIsTyping(true);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 2500);
      }
    };

    setIsTyping(true);
    typeNextChar();

    return () => clearTimeout(timeout);
  }, [phraseIndex]);

  const inner = (
    <>
      {/* Main illustration area */}
      <div className="relative h-full rounded-2xl bg-gradient-to-br from-primary/5 via-secondary to-accent/10 p-6 overflow-hidden">
        {/* Floating decorative elements */}
        <div className="absolute top-8 right-8 h-16 w-16 rounded-full bg-primary/20 animate-float" />
        <div className="absolute top-24 right-24 h-8 w-8 rounded-full bg-accent/30 animate-float-delay" />
        <div className="absolute bottom-32 right-12 h-12 w-12 rounded-full bg-primary/15 animate-float-slow" />
        
        {/* Hearts floating */}
        <svg className="absolute top-16 left-12 h-6 w-6 text-primary/40 animate-float" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <svg className="absolute bottom-24 left-8 h-5 w-5 text-accent/50 animate-float-delay" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>

        {/* Main counselor avatar */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          {/* Avatar character */}
          <div className="relative mb-4">
            {/* Body */}
            <div className="relative">
              {/* Head */}
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 shadow-lg">
                {/* Hair */}
                <div className="absolute -top-2 left-2 right-2 h-16 rounded-t-full bg-gradient-to-b from-amber-800 to-amber-900" />
                
                {/* Face */}
                <div className="absolute top-8 left-0 right-0 flex flex-col items-center">
                  {/* Eyes */}
                  <div className="flex gap-6 mb-2">
                    <div className="relative w-4 h-4 bg-foreground rounded-full">
                      <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div className="relative w-4 h-4 bg-foreground rounded-full">
                      <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  </div>
                  {/* Smile */}
                  <svg className="w-8 h-4" viewBox="0 0 32 16">
                    <path
                      d="M4 4 Q16 16 28 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="text-foreground/80"
                    />
                  </svg>
                </div>
                
                {/* Ears */}
                <div className="absolute top-10 -left-2 w-5 h-6 rounded-full bg-amber-200" />
                <div className="absolute top-10 -right-2 w-5 h-6 rounded-full bg-amber-200" />
              </div>
              
              {/* Shoulders/Body */}
              <div className="absolute top-24 left-1/2 -translate-x-1/2 w-36 h-20 rounded-t-3xl bg-primary shadow-md">
                {/* Collar detail */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-primary-foreground/20 rounded-full" />
              </div>
              
              {/* Writing hand animation */}
              <div className="absolute top-32 -right-8 animate-wave origin-bottom-left">
                <div className="relative">
                  {/* Arm */}
                  <div className="w-16 h-6 rounded-full bg-amber-200 rotate-[-30deg]" />
                  {/* Hand */}
                  <div className="absolute -right-2 top-0 w-8 h-6 rounded-full bg-amber-200" />
                  {/* Pen */}
                  <div className="absolute -right-1 top-1 w-1.5 h-10 bg-primary rounded-full rotate-[15deg] origin-top">
                    <div className="absolute bottom-0 left-0 w-1.5 h-2 bg-foreground/60 rounded-b-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat bubble with typing animation */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[85%] max-w-xs animate-bounce-gentle">
          <div className="relative bg-card rounded-2xl rounded-bl-sm shadow-lg p-4 border border-border">
            <div className="min-h-[24px] text-foreground font-medium">
              {currentText}
              <span 
                className={`inline-block w-0.5 h-5 bg-primary ml-0.5 align-middle ${isTyping ? 'animate-pulse' : 'opacity-0'}`}
              />
            </div>
            {/* Bubble tail */}
            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-card border-l border-b border-border rotate-[-45deg]" />
          </div>
        </div>

        {/* Notepad illustration */}
        <div className="absolute bottom-8 right-8 w-24 h-32 bg-white rounded-lg shadow-md rotate-6 animate-float-slow">
          <div className="absolute top-3 left-3 right-3 space-y-2">
            <div className="h-1.5 bg-primary/30 rounded animate-pulse-soft" />
            <div className="h-1.5 bg-primary/20 rounded w-3/4 animate-pulse-soft animation-delay-100" />
            <div className="h-1.5 bg-primary/25 rounded animate-pulse-soft animation-delay-200" />
            <div className="h-1.5 bg-primary/15 rounded w-1/2 animate-pulse-soft animation-delay-300" />
          </div>
          {/* Notepad rings */}
          <div className="absolute -top-1 left-4 w-3 h-3 rounded-full border-2 border-muted-foreground/40" />
          <div className="absolute -top-1 left-10 w-3 h-3 rounded-full border-2 border-muted-foreground/40" />
          <div className="absolute -top-1 left-16 w-3 h-3 rounded-full border-2 border-muted-foreground/40" />
        </div>

        {/* Calming plant illustration */}
        <div className="absolute bottom-8 left-8 animate-float-delay">
          <div className="relative">
            {/* Pot */}
            <div className="w-12 h-10 bg-accent/60 rounded-b-xl rounded-t-sm" />
            {/* Plant leaves */}
            <svg className="absolute -top-8 left-1 w-10 h-12" viewBox="0 0 40 48">
              <path d="M20 48 Q15 35 8 28 Q20 30 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <path d="M20 48 Q25 35 32 28 Q20 30 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <path d="M20 48 Q20 38 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/70" />
              <ellipse cx="8" cy="26" rx="6" ry="10" className="fill-primary/40" transform="rotate(-20 8 26)" />
              <ellipse cx="32" cy="26" rx="6" ry="10" className="fill-primary/40" transform="rotate(20 32 26)" />
              <ellipse cx="20" cy="16" rx="5" ry="8" className="fill-primary/50" />
            </svg>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -bottom-4 -left-4 rounded-xl bg-card p-3 shadow-lg border border-border animate-slide-up hover-lift">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Safe Space</div>
            <div className="text-xs text-muted-foreground">100% Confidential</div>
          </div>
        </div>
      </div>

      <div className="absolute -top-2 -right-2 rounded-xl bg-card p-3 shadow-lg border border-border animate-slide-in-right animation-delay-200 hover-lift">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/30">
            <svg className="h-5 w-5 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">We Care</div>
            <div className="text-xs text-muted-foreground">Compassionate Support</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={`relative w-full ${compact ? "h-[320px] overflow-hidden" : "h-[500px]"}`}>
      <div
        className={compact ? "relative h-[500px] w-full" : "relative h-full w-full"}
        style={compact ? { transform: "scale(0.64)", transformOrigin: "top center" } : undefined}
      >
        {inner}
      </div>
    </div>
  );
}
