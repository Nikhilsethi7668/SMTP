
import React, { useEffect } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { Quote } from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// 🧠 Testimonial Data
const testimonials = [
  {
    company: "THE SMILEY COMPANY",
    img: "https://img.freepik.com/premium-photo/software-engineer-digital-avatar-generative-ai_934475-8997.jpg?w=2000",
    quote:
      "I wholeheartedly recommend MailFlow as my absolute MUST-HAVE tool for prospecting. With MailFlow, I’ve increased high-quality prospects thanks to its advanced personalization and targeted outreach — a dream come true for any B2B sales professional.",
    name: "Sabina Lenoble",
    role: "VP of Business Development",
  },
  {
    company: "PIXELVERSE",
    img: "https://randomuser.me/api/portraits/women/65.jpg",
    quote:
      "MailFlow helped us double our outbound engagement in just 3 weeks! The personalized multichannel outreach is a total game changer.",
    name: "Anna Mitchell",
    role: "Head of Growth",
  },
  {
    company: "QUANTIFY LABS",
    img: "https://randomuser.me/api/portraits/men/33.jpg",
    quote:
      "Our SDRs love using MailFlow. The simplicity, automation, and response rates are unmatched — it feels like having 5 extra team members.",
    name: "Michael Chen",
    role: "Sales Operations Manager",
  },
  {
    company: "AURORA AI",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    quote:
      "From prospecting to follow-ups, everything feels effortless. The integrations and personalization features are next-level.",
    name: "Emily Ross",
    role: "Growth Strategist",
  },
  {
    company: "VERTEX NETWORKS",
    img: "https://randomuser.me/api/portraits/men/23.jpg",
    quote:
      "A must-have for scaling B2B outreach. MailFlow automates everything while keeping messages personal and human.",
    name: "Liam Carter",
    role: "Marketing Director",
  },
];

// Duplicate testimonials for seamless loop
const loopTestimonials = [...testimonials, ...testimonials];

const TestimonialSection: React.FC = () => {
  const controls = useAnimation();

  // Start auto-scroll when mounted
  useEffect(() => {
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 40,
        ease: "linear",
      },
    });
  }, [controls]);

  return (
    <motion.section
      className="relative w-full bg-gradient-to-b from-slate-100 to-white py-20 rounded-b-[8%] shadow-md overflow-hidden"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.h2
          className="text-sm md:text-base font-medium text-slate-800 mb-6"
          variants={fadeInUp}
        >
          20,000+ sales teams* use MailFlow to book meetings
        </motion.h2>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-10 text-slate-400 text-lg font-semibold"
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {["Uber", "Cloudflare", "Zendesk", "Indeed", "Paychex", "11ElevenLabs"].map(
            (name) => (
              <motion.span
                key={name}
                variants={fadeInUp}
                whileHover={{ scale: 1.1, color: "#1e40af" }}
                className="cursor-default"
              >
                {name}
              </motion.span>
            )
          )}
        </motion.div>

        <p className="text-xs text-slate-400 mt-4">
          *Not for show. They're running sequences right now.
        </p>
      </div>


      {/* Auto-Scrolling Carousel */}
      <div className="relative max-w-full my-10 overflow-hidden">
        <motion.div
          className="flex gap-8 w-max"
          animate={controls}
          onHoverStart={() => controls.stop()} // pause on hover
          onHoverEnd={() =>
            controls.start({
              x: ["0%", "-50%"],
              transition: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            })
          }
        >
          {loopTestimonials.map((t, i) => (
            <motion.div
              key={i}
              className="relative bg-[#1A1A1C] text-white rounded-[2rem] p-10 w-[85vw] md:w-[38vw] flex-shrink-0 flex flex-col md:flex-row items-center gap-8 shadow-lg"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              <Quote className="absolute top-6 left-6 w-10 h-10 text-white/10" />
              <Quote className="absolute bottom-6 right-6 w-10 h-10 text-white/10 rotate-180" />

              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="rounded-2xl overflow-hidden border-2 border-white/20 shadow-md w-28 h-28 md:w-40 md:h-40 flex items-center justify-center bg-slate-800">
                  <img
                    src={t.img}
                    alt={t.company}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="text-center mt-3">
                  <p className="font-bold tracking-wide text-xs md:text-sm uppercase text-slate-300">
                    {t.company}
                  </p>
                </div>
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="italic text-base md:text-lg leading-relaxed font-medium">
                  “{t.quote}”
                </p>
                <div className="mt-4 text-xs md:text-sm text-slate-300">
                  <span className="font-semibold text-white">{t.name}</span> – {t.role}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TestimonialSection;
