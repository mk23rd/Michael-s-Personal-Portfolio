import About from "@/components/About";
import Automation from "@/components/Automation";
import Boot from "@/components/Boot";
import CommandPalette from "@/components/CommandPalette";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import Projects from "@/components/Projects";
import Services from "@/components/Services";
import StackStrip from "@/components/StackStrip";
import Timeline from "@/components/Timeline";
import { useReveal } from "@/hooks/use-reveal";

const Index = () => {
  // Runs after every section has mounted, so all [data-reveal] elements are observed.
  useReveal();

  return (
    <>
      <Navigation />
      <main id="main">
        <Hero />
        <StackStrip />
        <Projects />
        <Automation />
        <Services />
        <Timeline />
        <About />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <CommandPalette />
      <Cursor />
      <Boot />
    </>
  );
};

export default Index;
