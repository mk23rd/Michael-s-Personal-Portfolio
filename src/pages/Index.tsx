import { useEffect } from "react";

import About from "@/components/About";
import Automation from "@/components/Automation";
import Boot from "@/components/Boot";
import CommandPalette from "@/components/CommandPalette";
import Contact from "@/components/Contact";
import Cursor from "@/components/Cursor";
import Deferred from "@/components/Deferred";
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
  // Watches for [data-reveal] elements as the sections mount.
  useReveal();

  // Deep links (/#contact) point at sections React renders after the HTML was parsed. The browser keeps
  // looking for the fragment until the load event; if it gave up before the first commit, jump there now.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (target && window.scrollY === 0) target.scrollIntoView({ behavior: "auto", block: "start" });
  }, []);

  // The hero and the strip under it paint first; everything below the fold follows one section at a time.
  return (
    <>
      <Navigation />
      <main id="main">
        <Hero />
        <StackStrip />
        <Deferred step={1}>
          <Projects />
        </Deferred>
        <Deferred step={2}>
          <Automation />
        </Deferred>
        <Deferred step={3}>
          <Services />
        </Deferred>
        <Deferred step={4}>
          <Timeline />
        </Deferred>
        <Deferred step={5}>
          <About />
        </Deferred>
        <Deferred step={6}>
          <Faq />
        </Deferred>
        <Deferred step={7}>
          <Contact />
        </Deferred>
      </main>
      <Deferred step={7} placeholder="0">
        <Footer />
      </Deferred>
      <CommandPalette />
      <Cursor />
      <Boot />
    </>
  );
};

export default Index;
