import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 py-20 md:py-28">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 md:flex-row">
        {/* Left Content */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
            Send <span className="text-blue-600">Millions</span> of Emails at{" "}
            <span className="text-blue-600">Lightning Speed</span>
          </h1>

          <p className="mx-auto max-w-lg text-lg text-slate-600 md:mx-0 md:text-xl">
            Enterprise-grade email outreach platform with dedicated IPs, pre-warmed domains, and
            advanced analytics. Scale your campaigns without limits.
          </p>

          <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row md:justify-start">
            <Button
              onClick={() => navigate("/auth?auth=signup")}
              size="lg"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Start Free Trial
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 md:justify-start">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">10M+</p>
              <p className="mt-1 text-sm text-slate-600">Emails/Day</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">99%</p>
              <p className="mt-1 text-sm text-slate-600">Deliverability</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">10,000+</p>
              <p className="mt-1 text-sm text-slate-600">Customers</p>
            </div>
          </div>
        </div>

        {/* Right Image Section */}
        <motion.div
          className="relative flex-1"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-1 shadow-2xl">
            <img
              src="https://d64gsuwffb70l.cloudfront.net/69020efb9ba901ad836cc3bf_1761742638703_8fcd4d6a.webp"
              alt="Email graphic"
              className="h-auto w-full rounded-3xl"
            />

            {/* Floating Card */}
            <motion.div
              className="absolute bottom-6 left-6 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div>
                <p className="text-sm font-medium text-slate-500">Campaign Status</p>
                <p className="text-lg font-semibold text-green-600">98.5% Delivered</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
