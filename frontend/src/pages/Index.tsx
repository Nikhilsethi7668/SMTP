import { motion, useAnimation, useScroll, useTransform, easeInOut, easeIn } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Star, Quote } from "lucide-react";
import IndexNavbar from "@/components/IndexNavbar";
import { useNavigate } from "react-router-dom";
import WhyChooseUs from "@/components/WhyChooseUs";
import ScrollingBadges from "@/components/ScrollingBadges";
import {
  ChartLine,
  Clock,
  Percent,
  RefreshCcw,
  Users,
  TrendingUp,
  BarChart3,
  Cloud,
  ShieldCheck,
  Plug,
  Mail,
  Zap,
  Inbox,
  Globe,
  Database,
} from "lucide-react";
import Footer from "@/components/Footer";
import InfrastructureSection from "@/components/InfrastructureSection";
import HeroSection from "@/components/HeroSections";
import PricingSection from "@/components/PricingSection";

const Index = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.8, ease: easeInOut },
    }),
  };

  const navigate = useNavigate();
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  // 🌟 Section fade + lift animation
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeInOut },
    },
  };

  // 💫 Floating animation for icons
  const floatAnimation = {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: easeInOut },
  };

  // 📜 Page transition animation
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: easeInOut } },
    exit: { opacity: 0, transition: { duration: 0.4 } },
  };

  // 🌀 Scroll-based parallax
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 300], [0, -100]);

  const fadeInLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: easeIn },
    },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: easeIn },
    },
  };

  const testimonials = [
    {
      stat: "+26% Reply Rate",
      quote:
        "We chose MailFlow for its seamless email and LinkedIn outreach combo. The simple interface saves us a lot of time, and the support team always has our backs when we need it.",
      name: "Deborah Strougo",
      role: "Business Growth Manager at IREV",
      company: "IREV",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      bg: "from-white to-slate-50 text-slate-800",
    },
    {
      stat: "10x Meetings Booked",
      quote:
        "Being able to drop a profile visit, follow up with a personalized email, and send a connection request has been such a powerful process. It allows you to add that human touch at scale.",
      name: "Dave Shillingford",
      role: "Sales Manager at RightMarket",
      company: "RightMarket",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      bg: "from-blue-600 to-blue-700 text-white",
    },
    {
      stat: "3x Sales Productivity",
      quote:
        "Staying organized and consistent is key in sales, and MailFlow helps me achieve exactly this. I can organize my outreach in a more effective, deeper, and personalized way.",
      name: "Khushi Mehta",
      role: "Partnerships Manager at Secret",
      company: "Secret",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      bg: "from-blue-600 to-blue-700 text-white",
    },
    {
      stat: "5x Sales Opportunities",
      quote:
        "Email finder and verifier help us filter out undeliverable emails, and automation ensures our emails appear at the top of prospects’ inboxes.",
      name: "João Jorge",
      role: "Head of Growth at WeTransact",
      company: "WeTransact",
      image: "https://randomuser.me/api/portraits/men/28.jpg",
      bg: "from-white to-slate-50 text-slate-800",
    },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-white text-slate-800"
    >
      <IndexNavbar />
      <HeroSection />
      {/* HERO SECTION */}
      <motion.section
        ref={ref}
        variants={fadeInUp}
        initial="hidden"
        animate={controls}
        style={{ y: yParallax }}
        className="mx-auto mt-6 flex h-[75vh] w-[95%] items-center justify-center rounded-[2.5rem] bg-slate-200 py-20 shadow-sm"
      >
        <motion.div className="mx-auto max-w-4xl px-6 text-center" variants={fadeInUp}>
          <motion.h1
            className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The <span className="text-blue-600">email infrastructure</span> built for performance,
            deliverability, and <span className="text-blue-600">trust</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg text-slate-600"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Power your outreach with dedicated SMTPs, pre-warmed domains, and real-time
            deliverability insights — all managed from one dashboard.
          </motion.p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="mt-8">
            <Button
              onClick={() => navigate("/signup")}
              className="rounded-lg bg-blue-600 px-6 py-5 text-base text-white shadow-md hover:bg-blue-700"
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* FLOATING IMAGE SECTION */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="relative top-[-5rem] z-10 flex justify-center"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="h-[85%] w-[75%] overflow-hidden rounded-[2.5rem] border border-slate-300 bg-gradient-to-b from-slate-50 to-slate-300 p-4 shadow-xl"
        >
          <motion.img
            src="https://cdn.prod.website-files.com/5de921a1902d8d8b7a99f774/6881ef87077bc66588ece0bf_lemlist%20En%20visual-p-2000.png"
            alt="Dashboard Preview"
            className="h-full w-full rounded-[2.5rem] object-cover"
          />
        </motion.div>
      </motion.section>

      {/* TESTIMONIAL + COMPANY SECTION */}
      <motion.div variants={fadeInUp} initial="hidden" animate={controls} className="bg-blue-600">
        <InfrastructureSection />
      </motion.div>

      {/* FEATURES SECTION */}
      <motion.section
        className="w-full bg-blue-600 py-20"
        variants={pageVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.p
          className="my-10 text-center text-4xl font-semibold leading-snug text-white"
          variants={fadeInUp}
        >
          Manage, monitor, and scale your entire email infrastructure
          <br />
          from one powerful dashboard.
        </motion.p>

        {[
          {
            title: "Dedicated SMTP & Pre-Warmed Accounts",
            desc1:
              "Each user gets a private, dedicated IP (VMTA) with automated warm-up and health scoring to maintain high deliverability from day one.",
            desc2:
              "Connect your own domains or purchase new ones directly inside the dashboard — all accounts are verified and pre-warmed for instant use.",
            image:
              "https://cdn.prod.website-files.com/5de921a1902d8d8b7a99f774/6881ef87077bc66588ece0bf_lemlist%20En%20visual-p-2000.png",
          },
          {
            title: "Real-Time Inbox Placement & Deliverability Insights",
            desc1:
              "Track open rates, spam placement, and bounce trends across every campaign with our advanced analytics suite.",
            desc2:
              "View deliverability by domain, monitor sender reputation, and switch IPs automatically if one gets blocked — all within one click.",
            image:
              "https://cdn.prod.website-files.com/5de921a1902d8d8b7a99f774/6881ef87077bc66588ece0bf_lemlist%20En%20visual-p-2000.png",
          },
          {
            title: "Unified Inbox & Smart Reply Tracking",
            desc1:
              "See all your replies and conversations in one place. Our unified inbox syncs every response, keeping your team aligned and responsive.",
            desc2:
              "Stop sending follow-ups automatically when a reply is detected — ensuring a human, natural communication flow.",
            image:
              "https://cdn.prod.website-files.com/5de921a1902d8d8b7a99f774/6881ef87077bc66588ece0bf_lemlist%20En%20visual-p-2000.png",
          },
          {
            title: "Delivery Optimization & IP Quality Control",
            desc1:
              "InboxMail constantly monitors each IP’s load, temperature, and sender score to maintain top-tier deliverability.",
            desc2:
              "If performance dips, transfer your senders to a healthier IP instantly — no downtime, no data loss, no deliverability drop.",
            image:
              "https://cdn.prod.website-files.com/5de921a1902d8d8b7a99f774/6881ef87077bc66588ece0bf_lemlist%20En%20visual-p-2000.png",
          },
        ].map((block, i) => (
          <motion.section
            key={i}
            className={`flex flex-col ${
              i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
            } mx-auto my-12 max-w-6xl items-center justify-between rounded-[2.5rem] bg-gradient-to-b from-white to-slate-100 p-10 shadow-xl md:p-16`}
            variants={i % 2 === 0 ? fadeInLeft : fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex-1 md:px-12">
              <h2 className="mb-4 text-3xl font-semibold text-slate-900">{block.title}</h2>
              <p className="mb-4 text-slate-600">{block.desc1}</p>
              <p className="text-slate-600">{block.desc2}</p>
            </div>

            <motion.div className="mt-8 flex-1 md:mt-0" whileHover={{ scale: 1.03 }}>
              <div className="relative h-full w-full rounded-[2rem] bg-gradient-to-br from-blue-500 to-blue-600 p-4">
                <motion.img
                  src={block.image}
                  alt={block.title}
                  className="h-auto w-full rounded-[1.5rem] shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.section>
        ))}
      </motion.section>
      <motion.section id="pricing" variants={fadeInUp}>
        <PricingSection />
      </motion.section>
      <motion.section variants={fadeInUp}>
        <section className="w-full bg-gradient-to-b from-slate-100 to-white py-24">
          {/* Header */}
          <div className="mx-auto mb-12 max-w-6xl px-6 text-center">
            <h2 className="mb-6 text-3xl font-semibold text-slate-900 md:text-5xl">
              The All-in-One <span className="text-blue-600">Cold Email Infrastructure</span>
            </h2>

            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600">
              Power your outreach with a next-gen SMTP system built for serious senders. From{" "}
              <span className="font-semibold text-slate-800">pre-warmed mail accounts</span> and
              <span className="font-semibold text-slate-800">dedicated IPs</span> to
              <span className="font-semibold text-slate-800">domain management</span> and
              <span className="font-semibold text-slate-800">live analytics</span> — InboxMail gives
              you the tools to scale safely, deliver smarter, and land in more inboxes.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-8 text-left md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <h3 className="mb-2 text-xl font-semibold text-slate-900">
                  ⚙️ Pre-Warmed SMTP Accounts
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Skip warm-up delays. Buy verified, pre-warmed accounts and start sending
                  instantly. Each user gets a dedicated SMTP IP (VMTA) — no shared pools, no noise.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <h3 className="mb-2 text-xl font-semibold text-slate-900">
                  🌐 Dedicated IP Infrastructure
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Every campaign runs on your own dedicated IP. Monitor IP load, deliverability, and
                  quality. Upgrade or add new IPs as your sender volume grows.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <h3 className="mb-2 text-xl font-semibold text-slate-900">
                  📊 Real-Time Mail Analytics
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Track opens, clicks, replies, and IP performance with full campaign insights. Stay
                  ahead with deliverability reports powered by MailGuard & InboxPlacement.
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 text-left md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <h3 className="mb-2 text-xl font-semibold text-slate-900">
                  🔐 Connect or Buy Domains
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Plug in your own domain or buy a new one inside the dashboard. Automatic DNS setup
                  and domain rotation for better inbox placement.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <h3 className="mb-2 text-xl font-semibold text-slate-900">
                  💌 Unified Inbox (Unibox)
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  See every reply, thread, and inbox in one clean interface. Manage client
                  conversations, monitor sender health, and stay synced in real time.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <h3 className="mb-2 text-xl font-semibold text-slate-900">⚡ Built for Scale</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Scale to hundreds of senders effortlessly. Our infrastructure grows with you —
                  powerful, secure, and optimized for global deliverability.
                </p>
              </div>
            </div>
          </div>

          <WhyChooseUs />
          <ScrollingBadges />
        </section>
      </motion.section>
      <section className="relative w-full overflow-hidden bg-blue-600 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 md:grid-cols-2">
          {/* CARD 1 - Dedicated SMTP Infrastructure */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-md"
          >
            <h3 className="mb-3 text-2xl font-semibold text-slate-900">
              Dedicated SMTP Infrastructure
            </h3>
            <p className="mb-8 leading-relaxed text-slate-600">
              Each user gets their own <strong>dedicated SMTP IP (VMTA)</strong> to ensure complete
              control, reliability, and deliverability. Scale effortlessly by adding new IPs as your
              sender volume grows.
            </p>

            {/* Visual Block */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="font-medium text-slate-900">Performance Snapshot</h4>
                <div className="flex gap-3">
                  <button className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-200">
                    <TrendingUp size={14} /> IP Health
                  </button>
                  <button className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-200">
                    <BarChart3 size={14} /> Sender Load
                  </button>
                </div>
              </div>

              <div className="relative h-32 overflow-hidden rounded-xl bg-gradient-to-b from-blue-200/40 to-transparent">
                <motion.div
                  className="absolute bottom-0 left-0 h-full w-full rounded-xl bg-gradient-to-t from-blue-300/60 to-transparent"
                  animate={{ y: [10, -10, 10] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3593/3593440.png"
                    alt="SMTP growth"
                    className="mx-auto mt-6 h-20 w-20 opacity-80"
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-6 space-y-2 text-sm text-slate-600"
              >
                <p>✅ Dedicated IP per user — no shared pools</p>
                <p>📈 Real-time IP quality & sender performance</p>
                <p>🚀 Instantly scalable with additional IPs</p>
              </motion.div>
            </div>
          </motion.div>

          {/* CARD 2 - Smart Domain Management & Integrations */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-md"
          >
            <h3 className="mb-3 text-2xl font-semibold text-slate-900">Smart Domain Management</h3>
            <p className="mb-8 leading-relaxed text-slate-600">
              Seamlessly connect or purchase new domains, integrate pre-warmed Google & Microsoft
              accounts, and automate DNS setups — all in a few clicks.
            </p>

            {/* Integrations Grid */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm shadow-inner">
              {[
                { icon: Cloud, label: "Auto DNS Setup" },
                { icon: ShieldCheck, label: "Pre-warmed IPs" },
                { icon: Plug, label: "Google Workspace" },
                { icon: Mail, label: "Microsoft 365" },
                { icon: Zap, label: "Custom IMAP Domains" },
                { icon: BarChart3, label: "Domain Analytics" },
              ].map(({ icon: Icon, label }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:bg-slate-100"
                >
                  <Icon size={14} /> {label}
                </div>
              ))}

              <div className="col-span-2 mt-3 flex gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2">
                  <img
                    src="https://api.iconify.design/logos/google.svg"
                    className="h-4 w-4"
                    alt=""
                  />
                  <span className="text-slate-700">Google</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-100 px-4 py-2">
                  <img
                    src="https://api.iconify.design/logos/microsoft.svg"
                    className="h-4 w-4"
                    alt=""
                  />
                  <span className="text-blue-700">Microsoft</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.div
        layout
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-2"
      >
        {[
          {
            icon: Inbox,
            title: "Inbox Placement Tracking",
            desc: "Monitor exactly where your emails land — Inbox, Spam, or Promotions — across multiple ISPs with real-time placement data.",
            bg: "from-blue-50 to-blue-100",
          },
          {
            icon: BarChart3,
            title: "Mail Analytics Dashboard",
            desc: "Visualize open rates, reply patterns, bounce data, and IP performance with AI-powered insights that optimize deliverability.",
            bg: "from-violet-50 to-violet-100",
          },
          {
            icon: Globe,
            title: "Smart Domain Management",
            desc: "Instantly connect existing domains or purchase new ones — complete with automated DNS setup, DKIM & DMARC verification.",
            bg: "from-teal-50 to-green-100",
          },
          {
            icon: ShieldCheck,
            title: "MailGuard Monitoring",
            desc: "Stay protected with alerts for reputation drops, IP blacklists, or deliverability issues before they impact your campaigns.",
            bg: "from-rose-50 to-pink-100",
          },
          {
            icon: Users,
            title: "Unified Inbox & CRM",
            desc: "Manage replies and threads in a single, elegant Unibox. Tag, assign, and follow-up effortlessly with built-in CRM tools.",
            bg: "from-amber-50 to-orange-100",
          },
          {
            icon: Database,
            title: "Dedicated IP Infrastructure",
            desc: "Every user gets a private SMTP VMTA IP — no shared IPs. Monitor IP load, sender limits, and easily transfer if one gets blocked.",
            bg: "from-slate-50 to-slate-100",
          },
        ].map((f, i) => (
          <motion.div
            key={i}
            layout
            custom={i}
            variants={fadeInUp}
            className={`bg-gradient-to-br ${f.bg} flex flex-col justify-between rounded-3xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl`}
            whileHover={{
              scale: 1.04,
              rotate: 0.5,
              boxShadow: "0px 8px 30px rgba(0,0,0,0.12)",
            }}
          >
            <div>
              <div className="mb-4 flex items-center gap-3">
                <f.icon className="h-6 w-6 text-blue-600" />
                <p className="text-lg font-semibold text-slate-900">{f.title}</p>
              </div>
              <p className="mb-6 leading-relaxed text-slate-600">{f.desc}</p>
            </div>

            <motion.a
              href="#"
              className="mt-auto text-sm font-medium text-blue-700 underline-offset-4 hover:underline"
              whileHover={{ scale: 1.05 }}
            >
              Learn more →
            </motion.a>
          </motion.div>
        ))}
      </motion.div>
      <motion.div variants={fadeInUp} className="mt-10">
        <Footer />
      </motion.div>
    </motion.div>
  );
};

export default Index;
