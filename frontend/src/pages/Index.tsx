import { motion, useAnimation, useScroll, useTransform, easeInOut, easeIn } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Star, Quote } from "lucide-react";
import IndexNavbar from "@/components/IndexNavbar";
import { useNavigate } from "react-router-dom";
import TestimonialSection from "@/components/TestimonialSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import ScrollingBadges from "@/components/ScrollingBadges";
import { ChartLine, Clock, Percent, RefreshCcw, TrendingUp, Users } from "lucide-react";
import Footer from "@/components/Footer";

const Index = () => {
  const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.8, ease: "easeOut" },
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
    transition: { duration: 0.8, ease: easeIn } 
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.8, ease: easeIn } 
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
      image:
        "https://randomuser.me/api/portraits/women/44.jpg",
      bg: "from-white to-slate-50 text-slate-800",
    },
    {
      stat: "10x Meetings Booked",
      quote:
        "Being able to drop a profile visit, follow up with a personalized email, and send a connection request has been such a powerful process. It allows you to add that human touch at scale.",
      name: "Dave Shillingford",
      role: "Sales Manager at RightMarket",
      company: "RightMarket",
      image:
        "https://randomuser.me/api/portraits/men/32.jpg",
      bg: "from-blue-600 to-blue-700 text-white",
    },
    {
      stat: "3x Sales Productivity",
      quote:
        "Staying organized and consistent is key in sales, and MailFlow helps me achieve exactly this. I can organize my outreach in a more effective, deeper, and personalized way.",
      name: "Khushi Mehta",
      role: "Partnerships Manager at Secret",
      company: "Secret",
      image:
        "https://randomuser.me/api/portraits/women/68.jpg",
      bg: "from-blue-600 to-blue-700 text-white",
    },
    {
      stat: "5x Sales Opportunities",
      quote:
        "Email finder and verifier help us filter out undeliverable emails, and automation ensures our emails appear at the top of prospects’ inboxes.",
      name: "João Jorge",
      role: "Head of Growth at WeTransact",
      company: "WeTransact",
      image:
        "https://randomuser.me/api/portraits/men/28.jpg",
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

      {/* HERO SECTION */}
      <motion.section
        ref={ref}
        variants={fadeInUp}
        initial="hidden"
        animate={controls}
        style={{ y: yParallax }}
        className="bg-slate-50 py-20 w-[95%] mx-auto mt-6 h-[70vh] rounded-[2.5rem] flex justify-center items-center shadow-sm"
      >
        <motion.div
          className="max-w-4xl mx-auto text-center px-6"
          variants={fadeInUp}
        >
          <motion.h1
            className="text-3xl md:text-4xl font-semibold leading-tight text-slate-900"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The{" "}
            <span className="text-blue-600">prospecting tool</span>{" "}
            to automate multichannel outreach & actually{" "}
            <span className="text-blue-600">get replies</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-slate-600 text-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Find leads with valid contact info and reach them across email,
            LinkedIn, WhatsApp, or calls — personalized, and out of spam.
          </motion.p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="mt-8"
          >
            <Button
              onClick={() => navigate("/signup")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5 text-base rounded-lg shadow-md"
            >
              Start a 14-day free trial
            </Button>
          </motion.div>

          {/* Ratings */}
          <motion.div
            className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 text-sm"
            variants={fadeInUp}
            initial="hidden"
            animate={controls}
          >
            <motion.div className="flex items-center gap-2" animate={floatAnimation}>
              <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
              <span className="font-medium">4.6 / 5</span>
              <img src="/plane-icon.svg" alt="Plane" className="w-5 h-5" />
            </motion.div>

            <motion.div
              className="flex items-center gap-2"
              animate={floatAnimation}
              transition={{ delay: 1 }}
            >
              <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span className="font-medium">4.5 / 5</span>
              <img src="/g2-icon.svg" alt="G2" className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* FLOATING IMAGE SECTION */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="relative z-10 top-[-7rem] flex justify-center"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-b from-slate-50 to-slate-300 w-[75%] h-[85%] border border-slate-300 overflow-hidden rounded-[2.5rem] p-4 shadow-xl"
        >
          <motion.img
            src="https://cdn.prod.website-files.com/5de921a1902d8d8b7a99f774/6881ef87077bc66588ece0bf_lemlist%20En%20visual-p-2000.png"
            alt="Dashboard Preview"
            className="object-cover w-full h-full rounded-[2.5rem]"
          />
        </motion.div>
      </motion.section>

      {/* TESTIMONIAL + COMPANY SECTION */}
      <motion.div  variants={fadeInUp}
            initial="hidden"
            animate={controls}
            className="bg-blue-600">
      <TestimonialSection/>
      </motion.div>

      {/* FEATURES SECTION */}
      <motion.section
        className="bg-blue-600 w-full py-20"
        variants={pageVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.p
          className="my-10 text-4xl font-semibold text-white text-center"
          variants={fadeInUp}
        >
          Find, enrich, & reach qualified leads <br /> from one platform.
        </motion.p>

        {[
          {
            title: "Find prospects who are ready to buy and easy to contact",
            desc1:
              "Use a 600M+ lead database with smart filters to spot companies and people that match your ICP.",
            desc2:
              "With one click, built-in waterfall enrichment pulls their verified emails and phone numbers from the market’s top providers.",
          },
          {
            title: "Automate outreach with precision",
            desc1:
              "Personalize every message at scale using dynamic fields and AI-backed recommendations.",
            desc2:
              "Save time while ensuring every lead receives a relevant, engaging touchpoint.",
          },
        ].map((block, i) => (
          <motion.section
            key={i}
            className={`flex flex-col ${
              i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
            } items-center justify-between bg-gradient-to-b from-white to-slate-100 rounded-[2.5rem] p-10 md:p-16 shadow-xl max-w-6xl mx-auto my-12`}
            variants={i % 2 === 0 ? fadeInLeft : fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex-1 md:px-12">
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                {block.title}
              </h2>
              <p className="text-slate-600 mb-4">{block.desc1}</p>
              <p className="text-slate-600">{block.desc2}</p>
            </div>
            <motion.div
              className="flex-1 mt-8 md:mt-0"
              whileHover={{ scale: 1.03 }}
            >
              <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] p-4">
                <motion.img
                  src="https://cdn.prod.website-files.com/5de921a1902d8d8b7a99f774/6881ef87077bc66588ece0bf_lemlist%20En%20visual-p-2000.png"
                  alt="Dashboard Preview"
                  className="rounded-[1.5rem] shadow-2xl w-full h-auto"
                />
              </div>
            </motion.div>
          </motion.section>
        ))}
      </motion.section>
       <motion.section variants={fadeInUp}>
        <section className="w-full bg-gradient-to-b from-slate-100 to-white py-24">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
          See how sales teams scale with MailFlow
        </h2>
        <p className="text-slate-600 text-lg">
          Trusted by top B2B teams worldwide to automate outreach and drive revenue growth.
        </p>
      </div>

      {/* Animated Grid */}
      <motion.div
        layout
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-6"
      >
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            layout
            custom={i}
            variants={fadeInUp}
            className={`bg-gradient-to-br ${t.bg} p-8 rounded-3xl shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all duration-300`}
            whileHover={{
              scale: 1.04,
              rotate: 0.5,
              boxShadow: "0px 8px 30px rgba(0,0,0,0.12)",
            }}
          >
            <div>
              <p className="font-semibold text-lg mb-3">{t.stat}</p>
              <p className="italic leading-relaxed mb-6">{t.quote}</p>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
                />
                <div className="text-sm text-left">
                  <p className="font-semibold">{t.name}</p>
                  <p className="opacity-80">{t.role}</p>
                </div>
              </div>

              <motion.a
                href="#"
                className="text-sm font-medium underline-offset-4 hover:underline"
                whileHover={{ scale: 1.05 }}
              >
                Discover full story →
              </motion.a>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
       </motion.section>
<WhyChooseUs/>
<ScrollingBadges/>
<section className="relative w-full bg-blue-600 py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Card 1 */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 backdrop-blur-md"
        >
          <h3 className="text-2xl font-semibold text-slate-900 mb-3">
            Instant Domain Setup
          </h3>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Connect your existing domains or set up new ones in just a click
            using AI Domain Finder.
          </p>

          {/* Mock Analytics Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-medium text-slate-900">See Growth</h4>
              <div className="flex gap-3">
                <button className="px-3 py-1 bg-slate-100 rounded-lg text-xs flex items-center gap-1 text-slate-700 hover:bg-slate-200 transition">
                  <ChartLine size={14} /> Monthly Visits
                </button>
                <button className="px-3 py-1 bg-slate-100 rounded-lg text-xs flex items-center gap-1 text-slate-700 hover:bg-slate-200 transition">
                  <Clock size={14} /> Last 24hrs
                </button>
              </div>
            </div>

            <div className="h-32 bg-gradient-to-b from-blue-200/50 to-transparent rounded-xl relative overflow-hidden">
              <motion.div
                className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-blue-300/60 to-transparent rounded-xl"
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
                  alt="Growth"
                  className="w-20 h-20 mx-auto mt-6 opacity-70"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 space-y-2 text-sm text-slate-600"
            >
              <p>✅ 100% score anytime</p>
              <p>📊 Watch stats & growth like a master</p>
              <p>🚀 Start growing now</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 backdrop-blur-md"
        >
          <h3 className="text-2xl font-semibold text-slate-900 mb-3">
            Managing DNS Records
          </h3>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Easily manage DNS records for your domains. Make adjustments quickly
            with a user-friendly interface.
          </p>

          {/* DNS Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner grid grid-cols-2 gap-3 text-sm">
            {[
              { icon: ChartLine, label: "Monthly Visits" },
              { icon: Clock, label: "Last 24hrs" },
              { icon: RefreshCcw, label: "Retention" },
              { icon: Users, label: "Top Referrals" },
              { icon: Percent, label: "Conversion" },
              { icon: TrendingUp, label: "Grow Income" },
            ].map(({ icon: Icon, label }, i) => (
              <div
                key={i}
                className="bg-white rounded-lg px-3 py-2 flex items-center gap-2 text-slate-700 border border-slate-200 hover:bg-slate-100 transition"
              >
                <Icon size={14} /> {label}
              </div>
            ))}

            <div className="col-span-2 flex gap-3 mt-3">
              <div className="bg-slate-100 rounded-lg px-4 py-2 flex items-center gap-2 border border-slate-200">
                <img
                  src="https://api.iconify.design/simple-icons/litecoin.svg"
                  className="w-4 h-4"
                  alt=""
                />
                <span className="text-slate-700">Litemail</span>
              </div>
              <div className="bg-pink-100 rounded-lg px-4 py-2 flex items-center gap-2 border border-pink-200">
                <img
                  src="https://api.iconify.design/logos/crystal.svg"
                  className="w-4 h-4"
                  alt=""
                />
                <span className="text-pink-700">Crystal</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    <Footer/>
    </motion.div>
  );
};

export default Index;
