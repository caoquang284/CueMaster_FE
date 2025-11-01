"use client";

import { CircleDot, Mail, Phone, MapPin } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <img src="/favicon.png" alt="Logo" className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">CueMaster</h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">Premium Billiards</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Experience the finest billiard facilities with professional equipment and exceptional service.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><a href="/#tables" className="transition-colors hover:text-slate-900 dark:hover:text-white">Tables</a></li>
              <li><a href="/#menu" className="transition-colors hover:text-slate-900 dark:hover:text-white">Menu</a></li>
              <li><a href="/#bookings" className="transition-colors hover:text-slate-900 dark:hover:text-white">Bookings</a></li>
              <li><a href="/login" className="transition-colors hover:text-slate-900 dark:hover:text-white">Sign In</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Opening Hours</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Monday - Friday: 9AM - 12AM</li>
              <li>Saturday - Sunday: 8AM - 2AM</li>
              <li className="font-medium text-emerald-600 dark:text-emerald-500">Open Daily</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Contact</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span>info@cuemaster.vn</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-500 mt-1" />
                <span>123 Nguyen Hue, District 1, Ho Chi Minh City</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-500">
          © 2025 CueMaster. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
