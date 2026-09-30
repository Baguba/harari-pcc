"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  ShieldCheck,
  Search,
  ClipboardCheck,
  Send,
  ArrowRight,
  Calendar,
  FileText,
  Building2,
  Pin,
  Newspaper,
  Layers,
  Database,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { directive } from "@/lib/data";
import { activityGroups } from "@/lib/types";
import { ActivityIcon } from "./activity-icon";

interface NewsItem {
  id: string;
  titleEn: string;
  titleAm: string;
  bodyEn: string;
  bodyAm: string;
  category: string;
  pinned: boolean;
  publishedAt: string | null;
}

export function HomeView() {
  const lang = useApp((s) => s.lang);
  const setView = useApp((s) => s.setView);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setNews((data.news || []).slice(0, 6));
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoadingNews(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Default slides when no news or fallback
  const defaultSlides = [
    {
      title:
        lang === "en"
          ? "Get Your ICT Sector Professional Competence Certificate"
          : lang === "am"
            ? "የአይሲቲ ዘርፍ የሙያ ብቃት ሰርቲፊኬትዎን ያግኙ"
            : "Waraqaa Ragaa Dandeettii Ogummaa Sektara ICT Argadhu",
      summary: lang === "en" ? "PCC Portal" : lang === "am" ? "የPCC ፖርታል" : "Portaala PCC",
      image: "/hero-bg.png",
      action: () => setView({ name: "categories" }),
    },
    {
      title:
        lang === "en"
          ? "Browse 45 ICT License Categories"
          : lang === "am"
            ? "45 የአይሲቲ የፈቃድ ምድቦችን ይመልከቱ"
            : "Ramaddii Hayyama Sektara ICT 45 Ilaali",
      summary: lang === "en" ? "License categories" : lang === "am" ? "የፈቃድ ምድቦች" : "Ramaddii Hayyamaa",
      image: "/hero-bg-2.jpg",
      action: () => setView({ name: "categories" }),
    },
    {
      title:
        lang === "en"
          ? "Apply Online — Track Your Application Status"
          : lang === "am"
            ? "በመስመር ላይ ያመልክቱ — ማመልከቻዎን ይከታተሉ"
            : "Karaa Intarneetiin Iyyadhu — Haala Iyyannoo Kee Hordofi",
      summary: lang === "en" ? "Applications" : lang === "am" ? "ማመልከቻዎች" : "Iyyannoolee",
      image: "/hero-bg.png",
      action: () => setView({ name: "login" }),
    },
  ];

  const slides =
    news.length > 0
      ? news.map((n, index) => {
          const images = ["/hero-bg.png", "/hero-bg-2.jpg"];
          return {
            title: lang === "en" ? n.titleEn : n.titleAm,
            summary: n.category,
            image: images[index % images.length],
            action: () => setView({ name: "news" }),
          };
        })
      : defaultSlides;

  const slideCount = slides.length;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 6000);
  }, [slideCount]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const goTo = (idx: number) => {
    setCurrentSlide(idx);
    resetTimer();
  };

  const goPrev = () => goTo((currentSlide - 1 + slideCount) % slideCount);
  const goNext = () => goTo((currentSlide + 1) % slideCount);

  const stats = [
    { label: t("home.stats.categories", lang), value: "45", sub: "standardized ICT categories" },
    { label: t("home.stats.validity", lang), value: lang === "en" ? "1 year" : lang === "am" ? "1 ዓመት" : "waggaa 1", sub: "renewable validity" },
    { label: t("home.stats.region", lang), value: lang === "en" ? "Harari" : lang === "am" ? "ሐረሪ" : "Hararii", sub: "regional jurisdiction" },
    { label: t("home.stats.years", lang), value: "2007 E.C.", sub: "Directive in force" },
  ];

  return (
    <div className="flex flex-col">
      {/* ========================================================
          SPLIT DIVISION HERO (Exact layout requested by user)
          ======================================================== */}
      <section className="split-hero">
        {/* LEFT PANEL */}
        <div className="split-hero__left">
          {/* Brand */}
          <div className="split-hero__brand">
            <img src="/logo.png" alt="PCC Logo" />
            <div className="split-hero__brand-text">
              {lang === "en"
                ? "Harari Regional State of Ethiopia"
                : lang === "am"
                  ? "የሐረሪ ሕዝብ ብሔራዊ ክልላዊ መንግሥት"
                  : "Mootummaa Naannoo Hararii Itoophiyaa"}
              <strong>
                {lang === "en"
                  ? "INNOVATION AND TECHNOLOGY AGENCY"
                  : lang === "am"
                    ? "የኢኖቬሽን እና ቴክኖሎጂ ኤጀንሲ"
                    : "EEJANSIIN INOVIISHINII FI TEKNOLOJII"}
              </strong>
            </div>
          </div>

          {/* Title with serif styling & green emphasis */}
          <h1 className="split-hero__title">
            {lang === "en" ? (
              <>
                ICT SECTOR:<br />
                <span>PROFESSIONAL<br />COMPETENCE</span><br />
                CERTIFICATE
              </>
            ) : lang === "am" ? (
              <>
                የአይሲቲ ዘርፍ:<br />
                <span>የሙያ ብቃት</span><br />
                ሰርቲፊኬት
              </>
            ) : (
              <>
                SEKTARA ICT:<br />
                WARAQAA RAGAA<br />
                <span>DANDEETTII OGUMMAA</span>
              </>
            )}
          </h1>

          {/* Quote Block */}
          <div className="split-hero__quote">
            <div className="split-hero__quote-icon">
              “
            </div>
            <p>{t("home.hero.subtitle", lang)}</p>
            <cite>
              —{" "}
              {lang === "en"
                ? "Innovation and Technology Agency"
                : lang === "am"
                  ? "የኢኖቬሽን እና ቴክኖሎጂ ኤጀንሲ"
                  : "Eejansii Inoviishinii fi Teknolojii"}
            </cite>
          </div>

          {/* CTA with Play button */}
          <button
            className="split-hero__cta"
            onClick={() => setView({ name: "categories" })}
          >
            <div className="split-hero__cta-circle">
              <Play size={20} fill="currentColor" />
            </div>
            <span className="split-hero__cta-label">
              {t("home.hero.cta.browse", lang)}
            </span>
          </button>
        </div>

        {/* RIGHT PANEL — Image / News Slider */}
        <div className="split-hero__right">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`split-hero__slide ${i === currentSlide ? "split-hero__slide--active" : ""}`}
            >
              <img
                src={slide.image}
                alt=""
                className="split-hero__slide-img"
                aria-hidden
              />
              <div className="split-hero__slide-overlay" />
              <div className="split-hero__slide-content">
                <h2 className="split-hero__slide-title">{slide.title}</h2>
                <div className="split-hero__slide-summary">{slide.summary}</div>
                <button className="split-hero__slide-btn" onClick={slide.action}>
                  {lang === "en" ? "READ MORE" : lang === "am" ? "ተጨማሪ ያንብቡ" : "DUBBISI"}
                </button>
              </div>
            </div>
          ))}

          {/* Arrows */}
          <div className="split-hero__arrows">
            <button className="split-hero__arrow" onClick={goPrev} aria-label="Previous slide">
              <ChevronLeft size={20} />
            </button>
            <button className="split-hero__arrow" onClick={goNext} aria-label="Next slide">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Indicators */}
          <div className="split-hero__indicators">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`split-hero__indicator ${i === currentSlide ? "split-hero__indicator--active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          STATS ROW (Modern High-Contrast Metrics)
          ======================================================== */}
      <section className="border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-left">
                <div className="text-3xl md:text-4xl font-extrabold text-primary font-mono tracking-tight">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {s.label}
                </div>
                <div className="text-[11px] text-slate-400">
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          "HOW IT WORKS" SECTION (Inspired by Image 2)
          "Everything you need, nothing you don't."
          ======================================================== */}
      <section className="py-16 md:py-24 px-4 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="container mx-auto max-w-6xl">
          {/* Eyebrow & Title */}
          <div className="text-left mb-10">
            <span className="eyebrow-label">
              {t("home.section.how.title", lang)}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.035em] text-slate-950 dark:text-white mt-2">
              {lang === "en"
                ? "Everything you need, nothing you don't."
                : lang === "am"
                  ? "የሚያስፈልግዎት ሁሉ፣ የማይገባው ምንም የለም።"
                  : "Wanta hunda barbaachisu, kan hin barbaachifne tokkollee hin jiru."}
            </h2>
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mt-2 max-w-xl font-normal">
              {t("home.section.how.subtitle", lang)}
            </p>
          </div>

          {/* Large Hero Process Card (from Image 2: "Prompt to ship" card) */}
          <div className="saas-card p-6 sm:p-10 mb-8">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              {/* Left Column: Icon + Title + Description + Stat */}
              <div className="md:col-span-7 flex flex-col items-start">
                <div className="badge-icon-blue mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                  {lang === "en"
                    ? "Prompt to certify"
                    : lang === "am"
                      ? "ወዲያውኑ ወደ ማረጋገጫ"
                      : "Saffisaan mirkaneessuuf"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 max-w-xl">
                  {lang === "en"
                    ? "Pick your business activity, verify required personnel degree qualifications and equipment in seconds, and receive an encrypted QR-verified certificate once approved."
                    : lang === "am"
                      ? "የንግድ እንቅስቃሴዎን ይምረጡ፣ አስፈላጊውን የትምህርት ደረጃ እና የመሳሪያ ዝርዝር በሰከንዶች ውስጥ ያረጋግጡ፣ ሲጸድቅም በQR የተረጋገጠ ሰርቲፊኬት ይቀበሉ።"
                      : "Hojii daldala keetii filadhu, ulaagaa barnootaa fi meeshaalee barbaachisoo sekondii keessatti sakatta'i, yeroo mirkanaa'u waraqaa ragaa QR qabu fudhadhu."}
                </p>
                {/* Highlight Stat */}
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                    ~100% Online
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">
                    {lang === "en" ? "from qualification check to certificate issuance" : lang === "am" ? "ከማመልከቻ እስከ ሰርቲፊኬት ሙሉ በሙሉ በመስመር ላይ" : "karaa intarneetiin guutuu"}
                  </div>
                </div>
              </div>

              {/* Right Column: Step Pipeline Visualization (Image 2 style) */}
              <div className="md:col-span-5 flex items-center justify-center p-6 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between w-full max-w-sm">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="step-dot mb-2" />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {lang === "en" ? "Select" : lang === "am" ? "ይምረጡ" : "Fili"}
                    </span>
                  </div>

                  <div className="step-line" />

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="step-dot mb-2" />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {lang === "en" ? "Criteria" : lang === "am" ? "መስፈርት" : "Ulaagaa"}
                    </span>
                  </div>

                  <div className="step-line" />

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="step-dot mb-2" />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {lang === "en" ? "Submit" : lang === "am" ? "አስገባ" : "Galchi"}
                    </span>
                  </div>

                  <div className="step-line" />

                  {/* Step 4 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="step-dot mb-2" />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {lang === "en" ? "Live" : lang === "am" ? "ጸድቋል" : "Hojii"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              FEATURE CARDS GRID (Directly inspired by Image 1)
              Preview branch / Postgres built in / Redis on tap cards
              ======================================================== */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="saas-card p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="badge-icon-blue mb-5">
                  <Layers className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                  {lang === "en" ? "45 Standardized Categories" : lang === "am" ? "45 ደረጃቸውን የጠበቁ ምድቦች" : "Ramaddiiwwan 45"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {lang === "en"
                    ? "Browse software engineering, networking, ISP, cyber security, hardware servicing, and ICT training with exact statutory codes."
                    : lang === "am"
                      ? "የሶፍትዌር ኢንጂነሪንግ፣ ኔትወርክ፣ አይኤስፒ፣ ሃርድዌር ጥገና እና ስልጠናን ከትክክለኛ የሕግ ኮዶች ጋር ይመልከቱ።"
                      : "Injinaringii sooftiweerii, neetwoorkii, ISP, suphaa haardiweerii fi leenjii koodii seeraa waliin ilaalaa."}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                  45
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {lang === "en" ? "pre-classified ICT licenses" : lang === "am" ? "የተመደቡ የፈቃድ አይነቶች" : "ramaddii hayyama ICT"}
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="saas-card p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="badge-icon-blue mb-5">
                  <Database className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                  {lang === "en" ? "Criteria Engine, built in" : lang === "am" ? "የመስፈርት ዝርዝር፣ አብሮ የተሰራ" : "Ulaagaalee guutuu, keessa jiru"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {lang === "en"
                    ? "Check requirements for office square meters, personnel diplomas/degrees, testing equipment, and required documentation before applying."
                    : lang === "am"
                      ? "ከማመልከትዎ በፊት የቢሮ ስፋት፣ የባለሙያዎች ዲፕሎማ/ዲግሪ፣ የመመርመሪያ መሳሪያዎች እና ሰነዶችን ይመርምሩ።"
                      : "Bal'ina waajjiraa, dipiloomaa/digrii ogeessotaa, meeshaalee qorannoo fi sanadoota barbaachisan sakatta'aa."}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                  4
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {lang === "en" ? "built-in assessment checklists" : lang === "am" ? "አብሮ የተሰሩ የግምገማ መስፈርቶች" : "qabxiilee gamaaggamaa 4"}
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="saas-card p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <div className="badge-icon-blue mb-5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                  {lang === "en" ? "QR Verification, on tap" : lang === "am" ? "የQR ማረጋገጫ፣ ወዲያውኑ" : "Mirkaneessa QR, yeroo hundaa"}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {lang === "en"
                    ? "Scan or query any issued license at /verify to immediately validate authenticity, certificate status, holder details, and expiry date."
                    : lang === "am"
                      ? "ማንኛውንም የተሰጠ ፈቃድ በ /verify ላይ በመቃኘት ትክክለኛነቱን፣ የባለቤቱን ዝርዝር እና የማብቂያ ቀኑን ወዲያውኑ ያረጋግጡ።"
                      : "Hayyama kenname kamiyyuu /verify irratti sakatta'uudhaan haala sirrii, odeeffannoo abbaa qabeenyaa fi guyyaa itti dhumu mirkaneeffadhaa."}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                  1-click
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {lang === "en" ? "instant online verification" : lang === "am" ? "ፈጣን የመስመር ላይ ማረጋገጫ" : "mirkaneessa saffisaa"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FLOATING BROWSER DIRECTORY PREVIEW (Inspired by Image 3)
          ======================================================== */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <span className="eyebrow-label">
              {lang === "en" ? "LIVE PREVIEW" : lang === "am" ? "ቀጥታ ቅድመ እይታ" : "Ilaalcha Qophaa'aa"}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              {lang === "en" ? "Portal Directory At a Glance" : lang === "am" ? "የፖርታሉ ማውጫ በጨረፍታ" : "Portaala Ilaalchaan"}
            </h3>
          </div>

          <div className="browser-frame text-left">
            {/* Browser Chrome Header */}
            <div className="browser-header">
              <div className="browser-dots">
                <div className="browser-dot bg-[#FF5F56]" />
                <div className="browser-dot bg-[#FFBD2E]" />
                <div className="browser-dot bg-[#27C93F]" />
              </div>
              <div className="browser-address-bar">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>pcc.harar.gov.et · live</span>
              </div>
            </div>

            {/* Inside Browser Viewport */}
            <div className="p-6 sm:p-10 bg-white dark:bg-slate-950">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                      45
                    </span>
                    <span className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-300">
                      {lang === "en" ? "standardized ICT categories" : lang === "am" ? "የተመደቡ የአይሲቲ ምድቦች" : "ramaddiiwwan ICT"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-xs font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {lang === "en" ? "Directive 1/2007 Verified" : lang === "am" ? "በመመሪያ 1/2007 የተረጋገጠ" : "Qajeelfama 1/2007"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-2">
                    {lang === "en"
                      ? "Harari Regional State Innovation and Technology Agency Official Portal"
                      : lang === "am"
                        ? "የሐረሪ ሕዝብ ብሔራዊ ክልላዊ መንግሥት የኢኖቬሽን እና ቴክኖሎጂ ኤጀንሲ ይፋዊ ፖርታል"
                        : "Mootummaa Naannoo Hararii Eejansii Inoviishinii fi Teknolojii"}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setView({ name: "categories" })}
                  className="self-start md:self-auto rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-semibold px-4 h-9 shadow-xs"
                >
                  {lang === "en" ? "Explore Categories" : lang === "am" ? "ምድቦችን ይፈትሹ" : "Ramaddii Sakatta'i"}
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>

              {/* 3 Metric Preview Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">45/45</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {lang === "en" ? "Pre-classified qualification criteria" : lang === "am" ? "የቅድመ-ምደባ መስፈርቶች" : "Ulaagaalee qophaa'an"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">1 Year</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {lang === "en" ? "Renewable legal certification validity" : lang === "am" ? "የ1 ዓመት ሕጋዊ ተቀባይነት" : "Waggaa 1 hojii irra kan oolu"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">100%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {lang === "en" ? "Instant tamper-proof QR verification" : lang === "am" ? "ፈጣን የQR ኮድ ማረጋገጫ" : "QR mirkaneessa saffisaa"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ACTIVITY TYPES (Clean Grid of Categories)
          ======================================================== */}
      <section className="py-16 md:py-20 px-4 bg-slate-50/40 dark:bg-slate-900/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow-label">
                {lang === "en" ? "CATEGORIES" : lang === "am" ? "ምድቦች" : "RAMADDII"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                {t("home.section.groups.title", lang)}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t("home.section.groups.subtitle", lang)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView({ name: "categories" })}
              className="rounded-full text-xs font-semibold gap-1 self-start sm:self-auto border-slate-200 dark:border-slate-800"
            >
              {lang === "en" ? "View all 45 categories" : lang === "am" ? "ሁሉንም 45 ምድቦች ይመልከቱ" : "Ramaddii 45 hunda ilaali"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {activityGroups.map((g) => (
              <button
                key={g.key}
                onClick={() => setView({ name: "categories" })}
                className="saas-card p-5 text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                    <ActivityIcon name={g.icon} className="h-4 w-4" />
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {g[`label_${lang}` as keyof typeof g]}
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-4">
                  {g.codes.length} {lang === "en" ? "categories" : lang === "am" ? "ምድቦች" : "ramaddii"}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          DIRECTIVE LEGAL BASIS BANNER
          ======================================================== */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="saas-card p-6 sm:p-8 bg-gradient-to-r from-emerald-50/50 via-white to-blue-50/30 dark:from-slate-900 dark:to-slate-900 border border-emerald-100 dark:border-slate-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="badge-icon-emerald flex-shrink-0 mt-0.5">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1">
                    {lang === "en" ? "Legal Statutory Authority" : lang === "am" ? "ሕጋዊ መሠረት" : "Bu'uura seeraa"}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {directive.issuing_authority}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    {directive.legal_basis} · {t("about.effective", lang)}: {directive.effective_date_en}
                  </p>
                </div>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => setView({ name: "about" })}
                className="rounded-full px-5 text-xs font-semibold self-start md:self-auto bg-primary hover:bg-primary/90 text-white shrink-0"
              >
                {t("nav.about", lang)}
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          NEWS & ANNOUNCEMENTS
          ======================================================== */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow-label">
                {lang === "en" ? "UPDATES" : lang === "am" ? "ዝመናዎች" : "HAAROMSA"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                {t("home.section.news.title", lang)}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t("home.section.news.subtitle", lang)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView({ name: "news" })}
              className="rounded-full text-xs font-semibold gap-1.5 self-start sm:self-auto border-slate-200 dark:border-slate-800"
            >
              <Newspaper className="h-3.5 w-3.5" />
              {lang === "en" ? "View all announcements" : lang === "am" ? "ሁሉንም ዜናዎች ይዩ" : "Hunda ilaali"}
            </Button>
          </div>

          {loadingNews ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="saas-card p-10 text-center text-sm text-slate-500">
              {lang === "en"
                ? "No announcements published yet."
                : lang === "am"
                  ? "እስካሁን ዜና አልተወጣም።"
                  : "Hanga ammaatti oduun hin maxxanfamne."}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {news.map((n) => (
                <div key={n.id} className="saas-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      {n.pinned && (
                        <Pin className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {n.category}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2">
                      {lang === "en" ? n.titleEn : lang === "am" ? n.titleAm : (n.titleEn || n.titleAm)}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                      {lang === "en" ? n.bodyEn : lang === "am" ? n.bodyAm : (n.bodyEn || n.bodyAm)}
                    </p>
                  </div>
                  {n.publishedAt && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <Calendar className="h-3 w-3" />
                      {new Date(n.publishedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          BOTTOM CTA BANNER (Modern SaaS rounded-3xl container)
          ======================================================== */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative rounded-3xl bg-slate-900 dark:bg-slate-950 text-white p-8 sm:p-14 overflow-hidden shadow-xl">
            {/* Subtle glow inside banner */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 mb-5 backdrop-blur-sm">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 text-white">
                {lang === "en"
                  ? "Ready to license your ICT business?"
                  : lang === "am"
                    ? "የአይሲቲ ንግድዎን ፈቃድ ለማውጣት ዝግጁ ነዎት?"
                    : "Daldala kee hayyamsiisuuf qophiidhaa?"}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-8">
                {lang === "en"
                  ? "Browse the 45 standardized license categories, verify qualification requirements, and start your online application today."
                  : lang === "am"
                    ? "45 ደረጃቸውን የጠበቁ የፈቃድ ምድቦችን ይመልከቱ፣ የመስፈርት ዝርዝሮችን ያረጋግጡ፣ እና የመስመር ላይ ማመልከቻዎን ዛሬውኑ ይጀምሩ።"
                    : "Ramaddii hayyama 45 ilaalaa, ulaagaalee mirkaneessaa, iyyannoo keessan har'uma jalqabaa."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={() => setView({ name: "categories" })}
                  className="rounded-full px-7 h-12 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all gap-2"
                >
                  {t("home.hero.cta.browse", lang)}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setView({ name: "login" })}
                  className="rounded-full px-6 h-12 text-sm font-semibold border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  {t("nav.login", lang)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
