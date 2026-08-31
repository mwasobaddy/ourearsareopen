/**
 * Central site/organization info for Our Ears Are Open.
 * Update address, email, and hours here to keep the website consistent.
 */
export const site = {
  name: "Our Ears Are Open",

  /** Mailing / physical address */
  address: {
    line1: "626 N Alafaya Trail",
    line2: "Ste 206 #3019",
    city: "Orlando",
    state: "FL",
    zip: "32828",
  },

  /** Full address as a single string (e.g. for display) */
  get fullAddress(): string {
    const { line1, line2, city, state, zip } = this.address;
    return [line1, line2, `${city}, ${state} ${zip}`].filter(Boolean).join(", ");
  },

  /** Multiline address for blocks (e.g. footer, contact) */
  get addressLines(): string[] {
    const { line1, line2, city, state, zip } = this.address;
    return [line1, line2, `${city}, ${state} ${zip}`];
  },

  /** Contact email for general inquiries */
  email: "hello@ourearsareopen.org",

  /** Business operating hours (customer service / availability) */
  operatingHours: {
    summary: "Mon–Sat: 7 AM – 10 PM ET",
    subtext: "Limited availability Sundays",
  },
} as const;
