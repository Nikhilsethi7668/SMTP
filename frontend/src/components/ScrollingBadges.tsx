import { motion } from "framer-motion";

const row1 = [
  "Instant Savings",
  "Flexible Payments",
  "Intelligent Spending",
  "Customizable Plans",
  "Smart Insights",
];

const row2 = [
  "Real-Time Reports",
  "Custom AI Plans",
  "Dedicated Support",
  "Growth With AI",
  "Real-Time Automation",
];

const MarqueeRow = ({ items, reverse = false }: { items: string[]; reverse?: boolean }) => {
  return (
    <div className="relative flex select-none overflow-hidden">
      <motion.div
        className="flex min-w-max gap-6"
        animate={{
          x: reverse ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <div
            key={i}
            className="rounded-full border bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-md backdrop-blur-md transition-colors duration-300 hover:bg-slate-800/80"
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function SeamlessBadges() {
  return (
    <section className="relative w-full overflow-hidden py-5">
      <div className="mx-auto max-w-full space-y-8">
        <MarqueeRow items={row1} />
        <MarqueeRow items={row2} reverse />
      </div>
    </section>
  );
}
