"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BarChart3,
  ChevronDown,
  FileStack,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/boards", label: "بوردها", icon: LayoutDashboard },
  { href: "/boards/1/decisions", label: "تصمیمات", icon: FileText },
  { href: "/reports", label: "گزارش‌ها", icon: BarChart3 },
  { href: "/templates", label: "قالب‌ها", icon: FileStack },
  { href: "/help", label: "راهنما", icon: HelpCircle },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b glass">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <div className="relative flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-primary via-primary/90 to-violet-600 shadow-md shadow-primary/25 transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-foreground">
              <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute -bottom-0.5 -inset-e-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight gradient-text">
              تصمیم‌یار
            </span>
            <span className="text-[9px] text-muted-foreground">سامانه مدیریت تصمیم</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2 transition-all",
                    active && "font-semibold shadow-sm"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                زمینه: پروژه X
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/boards/1">پروژه X</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/boards/2">تیم پلتفرم</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/search" className="hidden lg:block">
            <div className="relative w-52">
              <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 ps-8 bg-muted/50 border-transparent hover:border-border focus:border-ring transition-colors"
                placeholder="جستجو..."
                readOnly
              />
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">تغییر تم</span>
          </Button>

          <Button variant="ghost" size="icon" className="size-8">
            <User className="size-4" />
            <span className="sr-only">پروفایل</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
            <span className="sr-only">منو</span>
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t p-3 md:hidden animate-fade-in">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      active && "font-semibold"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <div className="mt-2 pt-2 border-t">
              <Link href="/search" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Search className="size-4" />
                  جستجو
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
