"use client";
import { Globe, Youtube, Linkedin, Music2, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200">
      {/* Top Divider with Floating Logo */}
      <div className="relative max-w-7xl mx-auto pt-12 pb-16 px-6 text-slate-600">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-md border border-blue-200 p-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
            <Mail/>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pt-10">
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">GET STARTED</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
              <li><a href="#" className="hover:text-blue-600">Log in</a></li>
              <li><a href="#" className="hover:text-blue-600">Sign up for free</a></li>
              <li><a href="#" className="hover:text-blue-600">Get a demo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-3">PRODUCT</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600">Find qualified leads</a></li>
              <li><a href="#" className="hover:text-blue-600">Enrich contact info</a></li>
              <li><a href="#" className="hover:text-blue-600">Personalize at scale</a></li>
              <li><a href="#" className="hover:text-blue-600">Automate outreach</a></li>
              <li><a href="#" className="hover:text-blue-600">Land out of spam</a></li>
              <li><a href="#" className="hover:text-blue-600">Integrations</a></li>
              <li><a href="#" className="hover:text-blue-600">Developer API</a></li>
              <li><a href="#" className="hover:text-blue-600">System status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-3">RESOURCES</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600">Blog</a></li>
              <li><a href="#" className="hover:text-blue-600">Playbooks</a></li>
              <li><a href="#" className="hover:text-blue-600">YouTube</a></li>
              <li><a href="#" className="hover:text-blue-600">Free tools</a></li>
              <li><a href="#" className="hover:text-blue-600">Outreach templates</a></li>
              <li><a href="#" className="hover:text-blue-600">Help center</a></li>
              <li><a href="#" className="hover:text-blue-600">Academy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-3">COMPANY</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600">Join us</a></li>
              <li><a href="#" className="hover:text-blue-600">Affiliate program</a></li>
              <li><a href="#" className="hover:text-blue-600">Service partner</a></li>
              <li><a href="#" className="hover:text-blue-600">Outbound expert</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-3">LEGAL</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-600">Terms of service</a></li>
              <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600">Cookies</a></li>
              <li><a href="#" className="hover:text-blue-600">Sending Policy</a></li>
              <li><a href="#" className="hover:text-blue-600">Anti-abuse</a></li>
              <li><a href="#" className="hover:text-blue-600">Data Processing</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-900 text-slate-400 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 rounded-lg px-3 py-1 text-sm text-white">
              <span role="img" aria-label="flag" className="mr-1">🇺🇸</span> EN
            </div>
          </div>

          <p className="text-sm text-center mt-3 md:mt-0">
            ©2025 MailFlow - All rights reserved.
          </p>

          <div className="flex gap-3 mt-3 md:mt-0">
            <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition">
              <Music2 className="w-4 h-4 text-white" />
            </a>
            <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition">
              <Linkedin className="w-4 h-4 text-white" />
            </a>
            <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-slate-700 transition">
              <Youtube className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
