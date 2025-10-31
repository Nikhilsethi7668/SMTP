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
      icon: <Settings className="h-6 w-6 text-blue-400" />,
      title: "Manage Everything in One Place",
      desc: "View, modify, and track your accounts from a central, user-friendly portal.",
    },
    {
      icon: <LayoutGrid className="h-6 w-6 text-blue-400" />,
      title: "Self Serve Dashboard",
      desc: "Control every part of your inbox infrastructure in one place — add, manage, cancel with ease.",
    },
    {
      icon: <Mail className="h-6 w-6 text-blue-400" />,
      title: "Tailored Email Setups",
      desc: "Accounts built on your domains, personalized with images, sender names, and more.",
    },
    {
      icon: <Truck className="h-6 w-6 text-blue-400" />,
      title: "Lightning-Fast Delivery",
      desc: "Standard accounts in 12 hrs, priority delivery in 6 hrs or less — guaranteed.",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-white py-24">
      {/* Gradient Glow */}
      <div className="pointer-events-none absolute inset-0 bg-slate-50" />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-10 mx-auto mb-16 max-w-4xl text-center"
      >
        <h2 className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-4xl font-semibold text-transparent md:text-5xl">
          Why Choose Us?
        </h2>
        <p className="mt-4 text-lg">
          Experience next-generation performance, flexibility, and automation built for scaling
          teams.
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-3 lg:grid-cols-4"
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
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1120] to-[#0f172a] p-8 shadow-lg transition-all duration-300 hover:shadow-blue-500/20"
          >
            <div className="w-fit rounded-xl bg-blue-500/10 p-3">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
