import About from "@/components/About";
import Automation from "@/components/Automation";
import Contact from "@/components/Contact";
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
    </>
  );
};

export default Index;
