import { HeroSection } from "@/components/home/hero-section";
import { MissionSection } from "@/components/home/mission-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { ServicesSection } from "@/components/home/services-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { DonateSection } from "@/components/home/donate-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MissionSection />
      <HowItWorksSection />
      <ServicesSection />
      <TestimonialsSection />
      <DonateSection />
    </>
  );
}
