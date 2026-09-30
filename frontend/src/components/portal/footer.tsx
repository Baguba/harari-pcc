"use client";

import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";

export function Footer() {
  const lang = useApp((s) => s.lang);
  const setView = useApp((s) => s.setView);

  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 flex items-center justify-center">
                <img src="/logo.png" alt="PCC Logo" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                  {t("brand.name", lang)}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t("brand.subtitle", lang)}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              {t("footer.disclaimer", lang)}
            </p>
          </div>

          {/* Column 1: Portal Navigation */}
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              {lang === "en" ? "Product" : lang === "am" ? "ፖርታል" : "Oomisha"}
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setView({ name: "home" })}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {t("nav.home", lang)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView({ name: "categories" })}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {t("nav.categories", lang)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView({ name: "news" })}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {t("nav.news", lang)}
                </button>
              </li>
              <li>
                <a
                  href="/verify"
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  {lang === "en" ? "Verify Certificate" : lang === "am" ? "ሰርቲፊኬት አረጋግጥ" : "Waraqaa Ragaa Mirkaneessi"}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Legal & About */}
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              {lang === "en" ? "Directive" : lang === "am" ? "መመሪያ" : "Qajeelfama"}
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setView({ name: "about" })}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {t("nav.about", lang)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView({ name: "login" })}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {t("nav.login", lang)}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView({ name: "signup" })}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {t("nav.signup", lang)}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              {lang === "en" ? "Agency" : lang === "am" ? "ኤጀንሲ" : "Eejansii"}
            </div>
            <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 mt-0.5 text-slate-400 flex-shrink-0" aria-hidden />
                <span>
                  {lang === "en"
                    ? "Innovation & Tech Agency, Harari, Ethiopia"
                    : lang === "am"
                      ? "የኢኖቬሽንና ቴክኖሎጂ ኤጀንሲ፣ ሐረሪ፣ ኢትዮጵያ"
                      : "Eejansii Inoviishinii fi Teknolojii, Hararii"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" aria-hidden />
                <a
                  href="mailto:info@pcc.gov.et"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  info@pcc.gov.et
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" aria-hidden />
                <span>+251 11 551 9999</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            {t("footer.rights", lang)}
          </div>
          <div>
            {lang === "en"
              ? "Harari Region · Directive No. 1/2007 E.C. (Revised)"
              : lang === "am"
                ? "የሐረሪ ክልል · መመሪያ ቁጥር 1/2007 ዓ.ም. (ተሻሽሎ)"
                : "Naannoo Hararii · Qajeelfama Lakk. 1/2007 B.A."}
          </div>
        </div>
      </div>
    </footer>
  );
}
