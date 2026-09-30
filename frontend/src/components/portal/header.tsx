"use client";

import { useState } from "react";
import {
  Menu,
  ShieldCheck,
  Home,
  Layers,
  Info,
  Newspaper,
  LogOut,
  UserCircle,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useApp } from "@/lib/store";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "./language-toggle";
import { NotificationsBell } from "./notifications-bell";

export function Header() {
  const lang = useApp((s) => s.lang);
  const view = useApp((s) => s.view);
  const setView = useApp((s) => s.setView);
  const session = useApp((s) => s.session);
  const setSession = useApp((s) => s.setSession);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { label: string; icon: typeof Home; onClick: () => void; active: boolean }[] = [
    {
      label: t("nav.home", lang),
      icon: Home,
      onClick: () => setView({ name: "home" }),
      active: view.name === "home",
    },
    {
      label: t("nav.categories", lang),
      icon: Layers,
      onClick: () => setView({ name: "categories" }),
      active: view.name === "categories" || view.name === "category" || view.name === "apply",
    },
    {
      label: t("nav.news", lang),
      icon: Newspaper,
      onClick: () => setView({ name: "news" }),
      active: view.name === "news",
    },
    {
      label: t("nav.about", lang),
      icon: Info,
      onClick: () => setView({ name: "about" }),
      active: view.name === "about",
    },
  ];

  const isAdminView = view.name === "admin";
  const isApplicantView =
    view.name === "applicant-dashboard" ||
    view.name === "applicant-application" ||
    view.name === "login" ||
    view.name === "signup";

  const isApplicant = session?.role === "applicant";
  const isAdmin = session?.role === "admin" || session?.role === "super_admin";

  const handleLogout = () => {
    setSession(null);
    setView({ name: "home" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between gap-3 px-4">
        {/* Brand */}
        <button
          type="button"
          onClick={() => setView({ name: "home" })}
          className="flex items-center gap-2.5 group cursor-pointer"
          aria-label={t("brand.name", lang)}
        >
          <div className="h-10 w-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <img src="/logo.png" alt="PCC Logo" className="h-9 w-9 object-contain" />
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              {t("brand.name", lang)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
              {t("brand.subtitle", lang)}
            </div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  item.active
                    ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right actions — single Sign in / Sign out for everyone */}
        <div className="flex items-center gap-2">
          {session && <NotificationsBell />}
          <LanguageToggle />

          {session ? (
            <>
              {/* Logged in: show role-appropriate dashboard button */}
              {isApplicant && !isApplicantView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView({ name: "applicant-dashboard" })}
                  className="rounded-full text-xs gap-1.5 hidden sm:inline-flex border-slate-200 dark:border-slate-800"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
                  {t("nav.applicant", lang)}
                </Button>
              )}
              {isAdmin && !isAdminView && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setView({ name: "admin" })}
                  className="rounded-full text-xs gap-1.5 hidden sm:inline-flex bg-primary hover:bg-primary/90 text-white"
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  {t("nav.admin", lang)}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="rounded-full text-xs gap-1.5 border-slate-200 dark:border-slate-800"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">{t("nav.logout", lang)}</span>
              </Button>
            </>
          ) : (
            <>
              {/* Not logged in: single Sign in button for everyone */}
              <Button
                variant={isApplicantView ? "default" : "outline"}
                size="sm"
                onClick={() => setView({ name: "login" })}
                className="rounded-full text-xs font-semibold px-4 h-9 gap-1.5 border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <UserCircle className="h-4 w-4" aria-hidden />
                <span>{t("nav.login", lang)}</span>
              </Button>
            </>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>{t("brand.name", lang)}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.label}
                      variant={item.active ? "default" : "ghost"}
                      onClick={() => {
                        item.onClick();
                        setMobileOpen(false);
                      }}
                      className="justify-start gap-2"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {item.label}
                    </Button>
                  );
                })}
                <div className="my-2 border-t border-border" />
                {session ? (
                  <>
                    {isApplicant && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setView({ name: "applicant-dashboard" });
                          setMobileOpen(false);
                        }}
                        className="justify-start gap-2"
                      >
                        <LayoutDashboard className="h-4 w-4" aria-hidden />
                        {t("nav.applicant", lang)}
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setView({ name: "admin" });
                          setMobileOpen(false);
                        }}
                        className="justify-start gap-2"
                      >
                        <ShieldCheck className="h-4 w-4" aria-hidden />
                        {t("nav.admin", lang)}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="justify-start gap-2"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      {t("nav.logout", lang)}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => {
                      setView({ name: "login" });
                      setMobileOpen(false);
                    }}
                    className="justify-start gap-2"
                  >
                    <UserCircle className="h-4 w-4" aria-hidden />
                    {t("nav.login", lang)}
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
