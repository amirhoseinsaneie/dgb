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
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <LayoutDashboard className="size-4" />
          </div>
          <span className="hidden text-base font-bold tracking-tight sm:inline gradient-text">
            سامانه مدیریت تصمیم
          </span>
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
