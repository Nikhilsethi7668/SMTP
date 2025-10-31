"use client";
import { Globe, Youtube, Linkedin, Music2, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white">
      {/* Top Divider with Floating Logo */}
      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-12 text-slate-600">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 transform rounded-xl border border-blue-200 bg-white p-3 shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-xl font-bold text-white shadow-lg">
            <Mail />
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-2 gap-10 pt-10 md:grid-cols-5">
          <div>
            <h4 className="mb-3 font-semibold text-slate-800">GET STARTED</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Log in
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Sign up for free
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Get a demo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-slate-800">PRODUCT</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Find qualified leads
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Enrich contact info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Personalize at scale
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Automate outreach
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Land out of spam
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Developer API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  System status
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-slate-800">RESOURCES</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Playbooks
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  YouTube
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Free tools
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Outreach templates
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Help center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Academy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-slate-800">COMPANY</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Join us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Affiliate program
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Service partner
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Outbound expert
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-slate-800">LEGAL</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Terms of service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Cookies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Sending Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Anti-abuse
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Data Processing
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-900 py-4 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-slate-800 px-3 py-1 text-sm text-white">
              <span role="img" aria-label="flag" className="mr-1">
                🇺🇸
              </span>{" "}
              EN
            </div>
          </div>

          <p className="mt-3 text-center text-sm md:mt-0">©2025 MailFlow - All rights reserved.</p>

          <div className="mt-3 flex gap-3 md:mt-0">
            <a href="#" className="rounded-lg bg-slate-800 p-2 transition hover:bg-slate-700">
              <Music2 className="h-4 w-4 text-white" />
            </a>
            <a href="#" className="rounded-lg bg-slate-800 p-2 transition hover:bg-slate-700">
              <Linkedin className="h-4 w-4 text-white" />
            </a>
            <a href="#" className="rounded-lg bg-slate-800 p-2 transition hover:bg-slate-700">
              <Youtube className="h-4 w-4 text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
