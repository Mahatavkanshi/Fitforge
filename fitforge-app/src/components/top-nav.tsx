"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/auth", label: "Auth" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trainer", label: "Live Trainer" },
  { href: "/progress", label: "Progress" },
  { href: "/nutrition", label: "Nutrition" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
              FF
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900">FitForge</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/trainer"
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Start Session
            </Link>
            <SignOutButton
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-70"
            />
          </div>
        </div>

        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition ${
                  isActive
                    ? "border-orange-200 bg-orange-50 text-orange-700"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
