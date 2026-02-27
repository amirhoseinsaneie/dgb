"use client";

import Link from "next/link";
import {
  Plus,
  FolderOpen,
  AlertTriangle,
  RotateCcw,
  Target,
  ArrowLeft,
  Sparkles,
  Shield,
  BarChart3,
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const { boards, decisions } = useApp();
  const recentBoards = boards.slice(0, 5);

  const totalDecisions = decisions.length;
  const openDecisions = decisions.filter(
    (d) => !["Done", "Reversed"].includes(d.status)
  ).length;
  const doneDecisions = decisions.filter((d) => d.status === "Done").length;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-bl from-primary/8 via-background to-chart-3/5 p-8 lg:p-12">
          <div className="absolute top-0 end-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative space-y-6">
            <div className="space-y-3">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Sparkles className="size-3" />
                مدیریت هوشمند تصمیمات
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl animate-fade-in-up">
                سامانه مدیریت تصمیم
              </h1>
              <p className="text-muted-foreground text-base lg:text-lg max-w-xl animate-fade-in-up animation-delay-100">
                ثبت، استانداردسازی و پیگیری تصمیمات کلیدی در تیم‌های چابک
              </p>
            </div>
            <div className="flex flex-wrap gap-3 animate-fade-in-up animation-delay-200">
              <Button asChild size="lg" className="shadow-md">
                <Link href="/boards/create" className="gap-2">
                  <Plus className="size-4" />
                  ایجاد بورد جدید
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/boards" className="gap-2">
                  <FolderOpen className="size-4" />
                  باز کردن بورد موجود
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {totalDecisions > 0 && (
          <div className="grid gap-4 sm:grid-cols-3 animate-fade-in-up animation-delay-200">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 end-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BarChart3 className="size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalDecisions}</p>
                    <p className="text-sm text-muted-foreground">کل تصمیمات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 end-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                    <Target className="size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{openDecisions}</p>
                    <p className="text-sm text-muted-foreground">تصمیمات باز</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 end-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Shield className="size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{doneDecisions}</p>
                    <p className="text-sm text-muted-foreground">
                      انجام‌شده
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3 animate-fade-in-up animation-delay-300">
          {[
            {
              icon: AlertTriangle,
              title: "تصمیمات بدون مالک/معیار",
              desc: "تاخیر و ریسک بالا",
              color: "text-destructive",
              bg: "bg-destructive/10",
            },
            {
              icon: RotateCcw,
              title: "تصمیمات غیرقابل بازگشت",
              desc: "نیاز به شواهد و گزینه‌ها",
              color: "text-amber-600",
              bg: "bg-amber-500/10",
            },
            {
              icon: Target,
              title: "هم‌راستایی تصمیمات",
              desc: "کاهش تعارض و دوباره‌کاری",
              color: "text-emerald-600",
              bg: "bg-emerald-500/10",
            },
          ].map((item) => (
            <Card
              key={item.title}
              className="group transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                      item.bg
                    )}
                  >
                    <item.icon className={cn("size-5", item.color)} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="animate-fade-in-up animation-delay-400">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>بوردهای اخیر</CardTitle>
                <CardDescription>آخرین بوردهای شما</CardDescription>
              </div>
              {recentBoards.length > 0 && (
                <Button asChild variant="ghost" size="sm" className="gap-1.5">
                  <Link href="/boards">
                    مشاهده همه
                    <ArrowLeft className="size-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentBoards.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <FolderOpen className="size-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">هنوز بوردی ایجاد نشده است</p>
                  <p className="text-sm text-muted-foreground">
                    با ایجاد اولین بورد شروع کنید
                  </p>
                </div>
                <Button asChild>
                  <Link href="/boards/create" className="gap-2">
                    <Plus className="size-4" />
                    ایجاد بورد
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentBoards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    className="group flex items-center justify-between rounded-xl border p-4 transition-all hover:bg-muted/50 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <LayoutDashboard className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {board.name}
                        </p>
                        {board.project && (
                          <p className="text-muted-foreground text-xs">
                            {board.project}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowLeft className="size-4 text-muted-foreground transition-transform group-hover:-translate-x-1" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function LayoutDashboard({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
