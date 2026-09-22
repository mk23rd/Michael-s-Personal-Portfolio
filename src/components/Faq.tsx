import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { faq } from "@/data/portfolio";
import SectionHeading from "./SectionHeading";

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" className="section">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5" data-reveal>
            <p className="label">Questions</p>
            <h2 className="display h2 mt-4 max-w-[14ch]">Things people usually ask first.</h2>
          </div>

          <div className="border-t border-border lg:col-span-7" data-reveal>
            {faq.map((item, index) => {
              const open = openIndex === index;
              const triggerId = `${baseId}-trigger-${index}`;
              const panelId = `${baseId}-panel-${index}`;
              return (
                <div key={item.q} className="border-b border-border">
                  <h3>
                    <button
                      id={triggerId}
                      type="button"
                      className="faq-trigger text-lg font-medium leading-snug md:text-xl"
                      aria-expanded={open}
                      aria-controls={panelId}
                      data-state={open ? "open" : "closed"}
                      onClick={() => setOpenIndex(open ? null : index)}
                    >
                      <span className="faq-q">{item.q}</span>
                      <span className="faq-icon" aria-hidden="true">
                        <Plus size={18} />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    className="faq-panel"
                    data-state={open ? "open" : "closed"}
                  >
                    <div>
                      <p className="max-w-[62ch] pb-6 text-muted-foreground">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;
