import type { Metadata } from "next";
import Image from "next/image";
import { Target, Users, Award, ShieldCheck, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PersonaIllustrations } from "@/components/about/persona-illustrations";

export const metadata: Metadata = {
  title: "About Us | Our Ears Are Open",
  description:
    "Learn about our mission, values, and the dedicated community behind Our Ears Are Open — quality conversations and listening support for everyone.",
};

const values = [
  {
    icon: Target,
    title: "Accessibility",
    description:
      "We offer free and affordable services to all, regardless of background or circumstances.",
  },
  {
    icon: Users,
    title: "Inclusivity",
    description:
      "We celebrate diversity and will always be culturally sensitive and honor every person's identity.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We maintain the highest standards of professional practice, and when we fall short, we do our best to immediately make it right.",
  },
];

const worldStatements = [
  "This world is scary.",
  "This world is fun.",
  "This world is full of love.",
  "This world is full of success.",
  "This world is full of care.",
  "This world is full of disappointment.",
  "This world is full of laughter.",
  "This world is full of fear.",
  "This world is full of loneliness.",
  "This world is full of doubt.",
  "This world is what you make it.",
];

const faqs = [
  {
    question: "What type of services do you offer?",
    answer:
      "We offer individual conversations through phone and chat. We allow everyday people to have conversations about life without judgment or pressure.",
  },
  {
    question: "How do I know which service is right for me?",
    answer:
      "You are in control. Whether you want to book a phone or chat conversation with a listener, we are here. Sometimes, having a conversation about your day, your job, family, friends, medical, or criminal-related issues can release stress. If you're not comfortable talking on the phone, you can use our chat option.",
  },
  {
    question: "What if I can't afford services?",
    answer:
      "We believe everyone deserves access to our services. Conversations are $10.99 for 15 minutes with a listener. We also offer free options for all our team members.",
  },
  {
    question: "How quickly can I get an appointment?",
    answer:
      "All bookings are based on availability. Our online booking system shows real-time availability, so you can always find a time that works for you. We are continuously growing and adding qualified listeners, so more availability will open up. If you are ever in immediate danger, please call 911 or 988.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Who we are
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              About Our Ears Are Open
            </h1>
            <div className="mx-auto mt-6 h-px w-16 bg-primary/30" />
            <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              We are a team of dedicated community members committed to making
              quality conversations accessible to everyone. Having someone truly
              listen to you can make a world of difference in your day.
            </p>
          </div>
        </div>
      </section>

      {/* Persona Illustrations — Who We Serve */}
      <PersonaIllustrations />

      {/* Our Story */}
      <section className="bg-brown py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Left: Story text + diverse team photo */}
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
                  Our journey
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  Our Story
                </h2>
                <div className="mt-4 h-px w-12 bg-primary/40" />
              </div>
              {/* Diverse team photo — in left column with text */}
              <div className="overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src="/our-story-photo.jpg"
                  alt="Elderly Black woman in quiet reflection by a window, representing loneliness, resilience, and the need for connection"
                  width={600}
                  height={360}
                  className="w-full object-cover object-center aspect-[5/3]"
                />
              </div>
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p className="text-[1.0625rem]">
                  Our Ears Are Open was founded in Florida during the height of
                  the COVID-19 pandemic. Mental health for some deteriorated due
                  to a lack of human interaction. During this time, my mother
                  lay in a rehab facility, and every visit, her roommate would
                  just be lying there, sad, and loneliness dripped over her face.
                </p>
                <p className="text-[1.0625rem]">
                  I&apos;m a nosey individual. I stopped by the desk and asked
                  if my mother&apos;s roommate ever had any family come by, and
                  the answer tugged at me all day. &ldquo;Unfortunately, no. I
                  think the only time she ever had someone come by is when she
                  first got here, and she&apos;s been here for almost seven
                  months,&rdquo; the nurse told me.
                </p>
                <p className="text-[1.0625rem]">
                  Next time, I made it my mission not only to chat it up with my
                  mother but also with her roommate. Eventually, my mother left
                  the facility, and I made a promise to her roommate that I
                  would come visit her as often as I possibly could. I kept my
                  promise.
                </p>
                <p className="text-[1.0625rem]">
                  My mother passed away in the year 2021, and so did her
                  roommate. My diary is gone.
                </p>
                <p className="text-[1.0625rem]">
                  Eventually, my job led me directly into the 65-and-older
                  community, and I felt a sense of responsibility. So many of
                  them wanted what I was selling but just couldn&apos;t afford
                  it. Some of them just want a visitor. A phone call. A routine
                  of human interaction. I knew what I was doing didn&apos;t feel
                  right as a career, so I made the decision to walk away and just
                  started small. It started with a few stops at local rehab and
                  elderly care facilities in my spare time. Then it became phone
                  calls of just listening. Before I knew it, I was conversing
                  with all kinds of people, even the staff of some of the
                  facilities.
                </p>
                <p className="text-[1.0625rem]">
                  The nurses need an ear to vent, too. It can become a challenge
                  for them; it can become overwhelming and exhausting. If I
                  could find a way to assist those who need a little extra income
                  while providing a listening ear, I could make a small dent in
                  both issues. That is why I created &ldquo;Our Ears Are
                  Open&rdquo;.
                </p>
                <p className="text-[1.0625rem]">
                  A place where I could hire the elderly, veterans, single
                  parents, college students, and those who need a second chance,
                  while providing a listening ear to the community. Whether it
                  be through a scheduled phone call or a spontaneous chat.
                </p>
                <p className="text-[1.0625rem]">
                  I want to deliver true listening and genuine care in
                  today&apos;s chaotic world. So many people struggle in silence
                  out of fear of burdening others. You are not a burden. Talking
                  with someone who has been through a storm and is still
                  standing is important because it helps you hear how they did
                  it. Not every piece of advice will work best for you but
                  hearing someone&apos;s story or having someone listen to yours
                  can change your perspective.
                </p>
                <p className="text-[1.0625rem]">
                  Our goal is to give people a chance to speak freely and have
                  someone at the other end who listens and supports them. No
                  matter what religion, race, political affiliation, or sexual
                  orientation, you deserve to be heard.
                </p>
                <p className="text-[1.0625rem]">
                  In some cases, we will recommend that you seek therapy and
                  provide other resources that might help you beyond a phone
                  conversation. Every one of our team members is trained to
                  recognize signs and symptoms of someone who may need more than
                  just a conversation or a chat.
                </p>
                <p className="text-[1.0625rem]">
                  When you leave a conversation with one of our team members,
                  the goal should always be to leave you in a better place than
                  you were before. Sometimes we will get it wrong. We will get it
                  right a lot of times. We want to make sure that you&apos;re
                  walking in this world with your head held high and your spirit
                  singing loudly.
                </p>
                <p className="text-[1.0625rem] font-medium text-foreground">
                  My mother was my diary for 38 years; let me be yours for 38
                  more.
                </p>
                <p className="text-[1.0625rem] font-semibold text-foreground">
                  Mrs. Lovely
                </p>
              </div>
            </div>

            {/* Right: Since 2020 card at top */}
            <div className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-secondary to-primary/[0.07] p-6 shadow-sm md:p-8">
                <div className="flex flex-col items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/20 bg-background p-2 shadow-lg shadow-primary/10">
                    <Logo href={undefined} variant="compact" className="[&>img]:h-8 [&>img]:w-auto" />
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                      Since 2020
                    </p>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Founded in Florida · Listening ever since
                    </p>
                  </div>
                  <div className="my-6 h-px w-full max-w-[200px] bg-border" />
                  <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    Most importantly, we want you to know:
                  </p>
                  <ul className="mt-4 grid w-full gap-2">
                    {worldStatements.map((line) => (
                      <li
                        key={line}
                        className="rounded-lg border border-border/50 bg-background/70 px-4 py-2.5 text-center text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 max-w-[260px] text-center text-sm leading-relaxed text-muted-foreground">
                    Reach out to us today — let&apos;s work together so we both
                    can walk this earth better than yesterday.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section id="values" className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              What we stand for
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Our Values
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-primary/30" />
            <p className="mt-6 text-lg text-muted-foreground">
              These core principles guide everything we do at Our Ears Are Open.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <Card
                key={value.title}
                className="group border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:shadow-primary/8"
              >
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <value.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section id="team" className="bg-brown py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              The people behind the ear
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Meet Our Team
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-primary/30" />
            <p className="mt-6 text-lg text-muted-foreground">
              A diverse team brings compassion, understanding, and life&apos;s
              expertise to every conversation.
            </p>
          </div>

          {/* Team section: avatars scattered left/right of text, mobile responsive */}
          <div className="mx-auto mt-12 max-w-7xl">
            <div className="relative flex flex-col lg:flex-row lg:items-start lg:gap-12 xl:gap-16">
              {/* Left avatars — hidden on mobile, shown on lg */}
              <div className="hidden lg:flex flex-col gap-8 flex-shrink-0 order-2 lg:order-1 lg:w-36 xl:w-44">
                {[
                  { src: "/about-team-1.jpg", alt: "White woman listener", className: "self-start" },
                  { src: "/about-team-3.jpg", alt: "Muslim woman listener in hijab", className: "self-end" },
                  { src: "/about-team-5.jpg", alt: "Black woman listener", className: "self-start ml-4" },
                ].map((person, i) => (
                  <div
                    key={`l-${i}`}
                    className={`relative h-24 w-24 xl:h-28 xl:w-28 rounded-full overflow-hidden border-4 border-card shadow-lg bg-muted transition-all duration-300 hover:scale-110 hover:shadow-xl hover:z-10 ${person.className}`}
                  >
                    <Image src={person.src} alt={person.alt} fill className="object-cover" sizes="112px" />
                  </div>
                ))}
              </div>

              {/* Center: text block */}
              <div className="flex-1 min-w-0 order-1 lg:order-2">
                {/* Mobile: avatars row above text */}
                <div className="flex flex-wrap justify-center gap-3 mb-6 lg:hidden">
                  {["/about-team-1.jpg", "/about-team-2.jpg", "/about-team-3.jpg", "/about-team-4.jpg", "/about-team-5.jpg", "/about-team-6.jpg"].map((src, i) => (
                    <div key={i} className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-card shadow-md">
                      <Image src={src} alt="Team member" fill className="object-cover" sizes="56px" />
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mb-4 lg:hidden">
                  Our listeners come from every background — Black, Asian, Muslim, and more.
                </p>
                <div className="space-y-6 rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm md:p-8 lg:p-10">
                  <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
                    Our team members consist of people from all walks of life, all
                    races, all religions, and all sexual orientations. People who
                    have strong religious backgrounds, and some who are more spiritual
                    or not. We have a team member who has gone through childbirth with
                    multiple children who can directly speak about postpartum. We have
                    team members who have been in trouble with the justice system who
                    can speak about how they changed their lives. Our team members are
                everyday people who have one of the most important things someone
                can have:                 life experience.
                  </p>
                  <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
                    When chatting with our team members, you&apos;re speaking with
                    people who have experienced the best of life and the worst, and in
                    the midst of it, they&apos;re still here and willing and able to
                    speak about it and have conversations with people who are going
                    through it, who have been through it, who                 will go through it.
                  </p>
                  <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
                    We also understand that there are times when conversations are
                    just not enough. Sometimes we may suggest that you speak with a
                    therapist. Yes, it may seem scary and costly, but we will always do
                    our best to guide you in the right direction. In an immediate
                    crisis, always dial 911 or 988. If our services can guide you into
                                    that new stage of mental peace, we have done our job.
                  </p>
                </div>
              </div>

              {/* Right avatars — hidden on mobile, shown on lg */}
              <div className="hidden lg:flex flex-col gap-8 flex-shrink-0 order-3 lg:w-36 xl:w-44">
                {[
                  { src: "/about-team-2.jpg", alt: "Asian woman listener", className: "self-end" },
                  { src: "/about-team-4.jpg", alt: "Latino man listener", className: "self-start mr-4" },
                  { src: "/about-team-6.jpg", alt: "Black woman listener", className: "self-end" },
                ].map((person, i) => (
                  <div
                    key={`r-${i}`}
                    className={`relative h-24 w-24 xl:h-28 xl:w-28 rounded-full overflow-hidden border-4 border-card shadow-lg bg-muted transition-all duration-300 hover:scale-110 hover:shadow-xl hover:z-10 ${person.className}`}
                  >
                    <Image src={person.src} alt={person.alt} fill className="object-cover" sizes="112px" />
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground hidden lg:block">
              Our listeners come from every background — Black, Asian, Muslim, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Listener Disclaimer — Legal + Trust */}
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-10 flex gap-6 items-start">
              <div className="hidden sm:flex shrink-0 h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mt-1">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  We Are Listeners, Not Therapists
                </h3>
                <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
                  Our team members are trained, caring listeners — they are
                  <strong className="text-foreground"> not licensed counselors or therapists</strong>.
                  We believe deeply in the power of professional therapy, and we
                  will always support you in finding that path if you need it.
                </p>
                <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
                  As we grow, we plan to add licensed therapists to our team
                  and provide a <strong className="text-foreground">seamless transition</strong> from
                  listener conversations to professional therapeutic support — so
                  that when you are ready for that next step, we can guide you
                  there with care.
                </p>
                <div className="pt-2">
                  <Link href="/book-listener">
                    <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 group">
                      Book a Listener Conversation
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.15),transparent)]" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/80">
              Our reach
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
              Our Impact
            </h2>
            <div className="mx-auto mt-4 h-px w-16 bg-primary-foreground/30" />
            <p className="mt-6 text-lg text-primary-foreground/85">
              50+ team members — listeners dedicated to making you feel heard.
            </p>
          </div>

          <div className="mt-14 flex justify-center gap-8 flex-wrap">
            <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 px-12 py-10 text-center backdrop-blur-sm">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary-foreground/30 bg-primary-foreground/15">
                <Users className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">
                50+
              </div>
              <div className="mt-2 text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
                Team Members
              </div>
            </div>
            <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 px-12 py-10 text-center backdrop-blur-sm">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary-foreground/30 bg-primary-foreground/15">
                <Award className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">
                5,000+
              </div>
              <div className="mt-2 text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
                Lives Touched
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-background py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Need to know
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Frequently Asked Questions
              </h2>
              <div className="mx-auto mt-4 h-px w-16 bg-primary/30" />
              <p className="mt-6 text-lg text-muted-foreground">
                Find answers to common questions about our services.
              </p>
            </div>

            <div className="mt-14 rounded-2xl border border-border bg-card p-2 shadow-sm md:p-4">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-border px-4 data-[state=open]:rounded-lg data-[state=open]:bg-muted/30"
                  >
                    <AccordionTrigger className="py-5 text-left font-medium text-foreground hover:no-underline hover:text-primary [&[data-state=open]]:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
