import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BrainLoopSection from "@/components/BrainLoopSection";
import TechPillarsSection from "@/components/TechPillarsSection";
import AgentsSection from "@/components/AgentsSection";
import FounderSection from "@/components/FounderSection";
import NoDemoSection from "@/components/NoDemoSection";
import TechStackSection from "@/components/TechStackSection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030712] text-gray-100 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <BrainLoopSection />
      <TechPillarsSection />
      <AgentsSection />
      <FounderSection />
      <NoDemoSection />
      <TechStackSection />
      <FooterSection />
    </main>
  );
}
