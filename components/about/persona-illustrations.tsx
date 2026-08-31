import { cn } from "@/lib/utils";

interface PersonaCardProps {
  label: string;
  sublabel: string;
  children: React.ReactNode;
  className?: string;
}

function PersonaCard({ label, sublabel, children, className }: PersonaCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col items-center gap-4 rounded-2xl border border-border bg-background p-6 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/8 hover:-translate-y-1",
        className
      )}
    >
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/8 transition-colors duration-300 group-hover:bg-primary/15">
        {children}
      </div>
      <div>
        <p className="font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  );
}

/* Wheelchair user */
function WheelchairPersona() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-20 w-20">
      {/* Head */}
      <circle cx="40" cy="14" r="8" stroke="currentColor" strokeWidth="2.2" className="text-primary" />
      {/* Torso */}
      <path d="M40 22 L40 42" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Left arm */}
      <path d="M40 28 L28 36" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Right arm — resting on wheel */}
      <path d="M40 28 L54 34" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Seat */}
      <path d="M28 42 L52 42" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-primary" />
      {/* Back of chair */}
      <path d="M28 42 L28 30" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Legs */}
      <path d="M52 42 L52 58" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      <path d="M40 42 L40 58" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      <path d="M36 58 L54 58" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-primary" />
      {/* Wheel */}
      <circle cx="28" cy="56" r="10" stroke="currentColor" strokeWidth="2.2" className="text-primary" />
      <path d="M28 46 L28 56 M18 56 L28 56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-primary" />
    </svg>
  );
}

/* Couple holding hands */
function CouplePersona() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-20 w-20">
      {/* Person 1 head */}
      <circle cx="24" cy="14" r="7" stroke="currentColor" strokeWidth="2.2" className="text-primary" />
      {/* Person 1 body */}
      <path d="M24 21 L24 46" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Person 1 legs */}
      <path d="M24 46 L18 62" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      <path d="M24 46 L28 62" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Person 2 head */}
      <circle cx="56" cy="14" r="7" stroke="currentColor" strokeWidth="2.2" className="text-primary" />
      {/* Person 2 body */}
      <path d="M56 21 L56 46" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Person 2 legs */}
      <path d="M56 46 L50 62" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      <path d="M56 46 L62 62" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Joined hands */}
      <path d="M30 34 Q40 38 50 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary" />
      {/* Heart above */}
      <path d="M37 8 Q40 4 43 8 Q46 12 40 17 Q34 12 37 8Z" fill="currentColor" className="text-primary opacity-60" />
    </svg>
  );
}

/* Cheerleader — arms raised, supportive */
function CheerleaderPersona() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-20 w-20">
      {/* Head */}
      <circle cx="40" cy="16" r="9" stroke="currentColor" strokeWidth="2.2" className="text-primary" />
      {/* Body */}
      <path d="M40 25 L40 50" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Arms raised — cheering gesture */}
      <path d="M40 32 L22 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      <path d="M40 32 L58 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Pom-pom circles */}
      <circle cx="20" cy="8" r="6" stroke="currentColor" strokeWidth="2" className="text-primary" fill="currentColor" fillOpacity="0.2" />
      <circle cx="60" cy="8" r="6" stroke="currentColor" strokeWidth="2" className="text-primary" fill="currentColor" fillOpacity="0.2" />
      {/* Legs */}
      <path d="M40 50 L30 68" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      <path d="M40 50 L50 68" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
    </svg>
  );
}

/* Elderly person with cane */
function ElderlyPersona() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-20 w-20">
      {/* Head */}
      <circle cx="36" cy="14" r="8" stroke="currentColor" strokeWidth="2.2" className="text-primary" />
      {/* Hair lines suggesting grey hair */}
      <path d="M30 10 Q36 8 42 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground" />
      {/* Body — slightly bent posture */}
      <path d="M36 22 Q34 34 32 46" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Left arm extended to cane */}
      <path d="M36 30 L48 38" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Right arm */}
      <path d="M36 30 L28 40" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Cane */}
      <path d="M48 38 L52 62" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-primary" />
      <path d="M46 62 L56 62" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-primary" />
      {/* Legs */}
      <path d="M32 46 L26 64" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      <path d="M32 46 L38 64" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
    </svg>
  );
}

/* Person with outstretched hands — diverse community */
function CommunityPersona() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-20 w-20">
      {/* Head */}
      <circle cx="40" cy="15" r="9" stroke="currentColor" strokeWidth="2.2" className="text-primary" />
      {/* Body */}
      <path d="M40 24 L40 50" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Arms wide open — welcoming gesture */}
      <path d="M40 32 L16 28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      <path d="M40 32 L64 28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Hands */}
      <circle cx="14" cy="27" r="3" stroke="currentColor" strokeWidth="1.8" className="text-primary" />
      <circle cx="66" cy="27" r="3" stroke="currentColor" strokeWidth="1.8" className="text-primary" />
      {/* Legs */}
      <path d="M40 50 L30 66" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      <path d="M40 50 L50 66" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-foreground" />
      {/* Small stars / sparkles around — diversity symbolism */}
      <circle cx="22" cy="14" r="2" fill="currentColor" className="text-primary opacity-50" />
      <circle cx="58" cy="12" r="2.5" fill="currentColor" className="text-primary opacity-40" />
      <circle cx="14" cy="44" r="1.5" fill="currentColor" className="text-primary opacity-60" />
      <circle cx="66" cy="44" r="1.5" fill="currentColor" className="text-primary opacity-60" />
    </svg>
  );
}

export function PersonaIllustrations() {
  const personas = [
    {
      label: "Accessibility Support",
      sublabel: "Conversations for everyone, no barriers",
      Illustration: WheelchairPersona,
    },
    {
      label: "Relationship Conversations",
      sublabel: "Couples, families, partnerships",
      Illustration: CouplePersona,
    },
    {
      label: "Cheerleading Support",
      sublabel: "We are your biggest cheerleaders — at your highest moments and your lowest moments",
      Illustration: CheerleaderPersona,
    },
    {
      label: "Elderly Care",
      sublabel: "Companionship and life conversations",
      Illustration: ElderlyPersona,
    },
    {
      label: "Open to All",
      sublabel: "Every background, every story",
      Illustration: CommunityPersona,
    },
  ];

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Who we serve
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            A Listener for Every Journey
          </h2>
          <div className="mx-auto mt-4 h-px w-16 bg-primary/30" />
          <p className="mt-6 text-lg text-muted-foreground">
            No matter your age, background, or situation — there is a listener here for you.
          </p>
        </div>

        <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {personas.map(({ label, sublabel, Illustration }) => (
            <PersonaCard key={label} label={label} sublabel={sublabel}>
              <Illustration />
            </PersonaCard>
          ))}
        </div>
      </div>
    </section>
  );
}
