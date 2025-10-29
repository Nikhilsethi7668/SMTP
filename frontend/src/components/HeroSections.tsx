import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-white via-slate-50 to-blue-50 py-20 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
            Send{" "}
            <span className="text-blue-600">Millions</span> of Emails at{" "}
            <span className="text-blue-600">Lightning Speed</span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl max-w-lg mx-auto md:mx-0">
            Enterprise-grade email outreach platform with dedicated IPs, pre-warmed
            domains, and advanced analytics. Scale your campaigns without limits.
          </p>

          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-2">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              View Features
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">10M+</p>
              <p className="text-slate-600 text-sm mt-1">Emails/Day</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">99%</p>
              <p className="text-slate-600 text-sm mt-1">Deliverability</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">10,000+</p>
              <p className="text-slate-600 text-sm mt-1">Customers</p>
            </div>
          </div>
        </div>

        {/* Right Image Section */}
        <motion.div
          className="flex-1 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-1 rounded-3xl shadow-2xl overflow-hidden">
            <img
              src="https://d64gsuwffb70l.cloudfront.net/69020efb9ba901ad836cc3bf_1761742638703_8fcd4d6a.webp"
              alt="Email graphic"
              className="rounded-3xl w-full h-auto"
            />

            {/* Floating Card */}
            <motion.div
              className="absolute bottom-6 left-6 bg-white shadow-lg rounded-xl px-4 py-3 flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div>
                <p className="text-sm text-slate-500 font-medium">Campaign Status</p>
                <p className="text-lg font-semibold text-green-600">
                  98.5% Delivered
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
