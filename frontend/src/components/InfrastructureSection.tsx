import React, { useEffect } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { ShieldCheck, Zap, Server, Users, Globe, Layers, BarChart2, Mail } from "lucide-react";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// ⚡ Core MailFlow Infrastructure Features
const platformHighlights = [
  {
    icon: <Mail className="h-10 w-10 text-blue-600" />,
    title: "Unified Cold Email Engine",
    desc: "One dashboard to manage prospecting, sequences, tracking, and deliverability — all under a single infrastructure.",
  },
  {
    icon: <Server className="h-10 w-10 text-blue-600" />,
    title: "Dedicated Sending Servers",
    desc: "Your campaigns run on isolated, high-performance instances optimized for inbox placement and throughput.",
  },
  {
    icon: <Globe className="h-10 w-10 text-blue-600" />,
    title: "Pre-Warmed Domains & IPs",
    desc: "Integrated with pre-warmed domains and dynamic IP rotation to keep your reputation healthy at scale.",
  },
  {
    icon: <BarChart2 className="h-10 w-10 text-blue-600" />,
    title: "Campaign Analytics & Insights",
    desc: "Real-time metrics for opens, replies, clicks, and deliverability — empowering precise optimization.",
  },
  {
    icon: <Users className="h-10 w-10 text-blue-600" />,
    title: "Multi-Account Management",
    desc: "Effortlessly connect Google Workspace, Microsoft 365, and IMAP accounts with automated warm-up routines.",
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-blue-600" />,
    title: "Enterprise-Grade Security",
    desc: "Two-factor authentication, DNS protection, and encrypted storage ensure your outreach remains private and compliant.",
  },
  {
    icon: <Layers className="h-10 w-10 text-blue-600" />,
    title: "AI-Powered Scheduling",
    desc: "Smart timing algorithms automatically send at the best moments for engagement across global time zones.",
  },
  {
    icon: <Zap className="h-10 w-10 text-blue-600" />,
    title: "Lightning Automation",
    desc: "Trigger follow-ups, sync leads, and personalize messages dynamically — no manual work, no missed opportunities.",
  },
];

const InfrastructureSection: React.FC = () => {
  const controls = useAnimation();

  // Smooth infinite horizontal motion
  useEffect(() => {
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 60,
        ease: "linear",
      },
    });
  }, [controls]);

  return (
    <motion.section
      className="relative w-full overflow-hidden rounded-b-[8%] bg-gradient-to-b from-slate-100 to-white py-24 shadow-md"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Header */}
      <div className="mx-auto mb-16 max-w-5xl px-4 text-center">
        <motion.h2
          className="mb-6 text-3xl font-semibold text-slate-900 md:text-5xl"
          variants={fadeInUp}
        >
          Built for <span className="text-blue-600">Scalability</span> &{" "}
          <span className="text-blue-600">Performance</span>
        </motion.h2>
        <motion.p
          className="mx-auto max-w-3xl text-lg text-slate-600"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          MailFlow provides the full infrastructure for cold outreach — from domain management to
          automation, analytics, and deliverability — so you can scale confidently without
          third-party dependencies.
        </motion.p>
      </div>

      {/* Auto-Scrolling Feature Cards */}
      <div className="relative max-w-full overflow-hidden">
        <motion.div
          className="flex w-max gap-8 px-6"
          animate={controls}
          onHoverStart={() => controls.stop()}
          onHoverEnd={() =>
            controls.start({
              x: ["0%", "-50%"],
              transition: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 60,
                ease: "linear",
              },
            })
          }
        >
          {platformHighlights.concat(platformHighlights).map((feature, i) => (
            <motion.div
              key={i}
              className="flex w-[85vw] flex-shrink-0 flex-col items-start justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-lg transition-all hover:shadow-xl md:w-[30vw]"
              whileHover={{ scale: 1.03 }}
            >
              <div className="mb-5">{feature.icon}</div>
              <h4 className="mb-3 text-xl font-semibold text-slate-900">{feature.title}</h4>
              <p className="text-sm leading-relaxed text-slate-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Trusted Statement */}
      <motion.div
        className="mt-24 px-6 text-center"
        variants={fadeInUp}
        transition={{ delay: 0.3 }}
      >
        <h3 className="mb-3 text-xl font-semibold text-slate-800 md:text-2xl">
          Trusted Infrastructure. Limitless Sending.
        </h3>
        <p className="mx-auto max-w-2xl text-slate-500">
          Every component of MailFlow is designed for reliability — built by cold emailers, for
          teams who scale fast and deliver smarter.
        </p>
      </motion.div>
    </motion.section>
  );
};

export default InfrastructureSection;
