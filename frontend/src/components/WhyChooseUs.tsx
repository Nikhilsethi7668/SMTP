import { motion, Variants } from "framer-motion";
import { Settings, LayoutGrid, Mail, Truck } from "lucide-react";

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    rotateX: 75,
    y: 80,
    scale: 0.8,
    transformOrigin: "bottom center",
  },
  visible: (i: number) => ({
    opacity: 1,
    rotateX: 0,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.15,
      type: "spring" as const,
      stiffness: 120,
      damping: 14,
    },
  }),
};

export default function WhyChooseUs() {
  const features = [
    {
      icon: <Settings className="w-6 h-6 text-blue-400" />,
      title: "Manage Everything in One Place",
      desc: "View, modify, and track your accounts from a central, user-friendly portal.",
    },
    {
      icon: <LayoutGrid className="w-6 h-6 text-blue-400" />,
      title: "Self Serve Dashboard",
      desc: "Control every part of your inbox infrastructure in one place — add, manage, cancel with ease.",
    },
    {
      icon: <Mail className="w-6 h-6 text-blue-400" />,
      title: "Tailored Email Setups",
      desc: "Accounts built on your domains, personalized with images, sender names, and more.",
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-400" />,
      title: "Lightning-Fast Delivery",
      desc: "Standard accounts in 12 hrs, priority delivery in 6 hrs or less — guaranteed.",
    },
  ];

  return (
    <section className="relative w-full bg-white py-24 overflow-hidden">
      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-slate-50 pointer-events-none" />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center mb-16 relative z-10"
      >
        <h2 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Why Choose Us?
        </h2>
        <p className="mt-4 text-lg">
          Experience next-generation performance, flexibility, and automation built for scaling teams.
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-6 relative z-10"
      >
        {features.map((feature, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            custom={i}
            whileHover={{
              scale: 1.05,
              rotateY: 6,
              boxShadow: "0px 10px 40px rgba(59,130,246,0.25)",
              transition: { type: "spring", stiffness: 200 },
            }}
            className="bg-gradient-to-br from-[#0b1120] to-[#0f172a] border border-white/10 rounded-2xl p-8 flex flex-col gap-4 shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
          >
            <div className="p-3 rounded-xl bg-blue-500/10 w-fit">{feature.icon}</div>
            <h3 className="text-xl text-white font-semibold">{feature.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
