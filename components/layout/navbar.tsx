"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ChevronDown, FileStack, FileText, HelpCircle, LayoutDashboard, Search, User } from "lucide-react";
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
  { href: "/boards", label: "Boards", icon: LayoutDashboard },
  { href: "/boards/1/decisions", label: "Decisions", icon: FileText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/templates", label: "Templates", icon: FileStack },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <Link href="/" className="shrink-0 text-lg font-semibold">
          DecisionGov
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <Button variant={active ? "secondary" : "ghost"} size="sm" className={cn("gap-2", active && "font-medium")}>
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Context: Project X
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/boards/1">Project X</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/boards/2">Platform Team</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/search" className="hidden lg:block">
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-8 pl-8" placeholder="Search..." readOnly />
            </div>
          </Link>

          <Button variant="ghost" size="icon">
            <User className="size-4" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
