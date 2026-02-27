"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  LayoutGrid,
  List,
  Plus,
  Settings,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function BoardDashboardPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, getBoardDecisions } = useApp();
  const board = getBoard(boardId);
  const boardDecisions = getBoardDecisions(boardId);

  if (!board) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <AlertTriangle className="size-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">بورد یافت نشد</p>
      </div>
    );
  }

  const openCount = boardDecisions.filter(
    (d) => !["Done", "Reversed"].includes(d.status)
  ).length;
  const overdueCount = boardDecisions.filter((d) => {
    if (!d.dueDate) return false;
    return (
      new Date(d.dueDate) < new Date() &&
      !["Done", "Reversed"].includes(d.status)
    );
  }).length;
  const missingOwnerCount = boardDecisions.filter(
    (d) => !d.ownerId && !["Done", "Reversed"].includes(d.status)
  ).length;
  const missingCriteriaCount = boardDecisions.filter(
    (d) => d.criteria.length === 0 && !["Done", "Reversed"].includes(d.status)
  ).length;
  const irreversiblePending = boardDecisions.filter((d) => {
    if (d.reversible || ["Done", "Reversed"].includes(d.status)) return false;
    return !d.keyRisksMitigations || !d.evidenceLinks?.length;
  }).length;

  const priorityAlerts = boardDecisions
    .filter((d) => {
      if (["Done", "Reversed"].includes(d.status)) return false;
      if (!d.ownerId || d.criteria.length === 0 || !d.dueDate) return true;
      return new Date(d.dueDate) < new Date();
    })
    .slice(0, 5);

  const upcomingDeadlines = boardDecisions
    .filter(
      (d) => d.dueDate && !["Done", "Reversed"].includes(d.status)
    )
    .sort(
      (a, b) =>
        new Date(a.dueDate as string).getTime() -
        new Date(b.dueDate as string).getTime()
    )
    .slice(0, 5);

  const stats = [
    {
      label: "تصمیمات باز",
      value: openCount,
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "عقب‌افتاده",
      value: overdueCount,
      icon: Clock,
      color: overdueCount > 0 ? "text-destructive" : "text-muted-foreground",
      bg: overdueCount > 0 ? "bg-destructive/10" : "bg-muted",
    },
    {
      label: "بدون مالک",
      value: missingOwnerCount,
      icon: Users,
      color:
        missingOwnerCount > 0 ? "text-amber-600" : "text-muted-foreground",
      bg: missingOwnerCount > 0 ? "bg-amber-500/10" : "bg-muted",
    },
    {
      label: "بدون معیار",
      value: missingCriteriaCount,
      icon: Shield,
      color:
        missingCriteriaCount > 0 ? "text-amber-600" : "text-muted-foreground",
      bg: missingCriteriaCount > 0 ? "bg-amber-500/10" : "bg-muted",
    },
    {
      label: "غیرقابل بازگشت معلق",
      value: irreversiblePending,
      icon: AlertTriangle,
      color:
        irreversiblePending > 0 ? "text-destructive" : "text-muted-foreground",
      bg: irreversiblePending > 0 ? "bg-destructive/10" : "bg-muted",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={board.name}
        subtitle="سلامت تصمیمات، تصمیمات باز و سررسیدهای آینده"
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="relative overflow-hidden transition-all hover:shadow-sm"
          >
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    stat.bg
                  )}
                >
                  <stat.icon className={cn("size-4", stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="size-4 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-base">هشدارهای اولویت‌دار</CardTitle>
                <CardDescription>موارد نیازمند اقدام فوری</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {priorityAlerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 mb-2">
                  <Shield className="size-5 text-emerald-600" />
                </div>
                <p className="text-sm text-muted-foreground">بدون هشدار</p>
              </div>
            )}
            {priorityAlerts.map((decision) => (
              <Link
                key={decision.id}
                href={`/boards/${boardId}/decisions/${decision.id}`}
                className="group flex items-center justify-between rounded-xl border p-3 transition-all hover:bg-muted/50 hover:shadow-sm"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {decision.title}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {!decision.ownerId && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300">
                        بدون مالک
                      </Badge>
                    )}
                    {decision.criteria.length === 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300">
                        بدون معیار
                      </Badge>
                    )}
                    {decision.dueDate &&
                      new Date(decision.dueDate) < new Date() && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          عقب‌افتاده
                        </Badge>
                      )}
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">سررسیدهای آینده</CardTitle>
                <CardDescription>تصمیمات نزدیک به سررسید</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingDeadlines.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted mb-2">
                  <Calendar className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  سررسید آینده‌ای وجود ندارد
                </p>
              </div>
            )}
            {upcomingDeadlines.map((decision) => (
              <Link
                key={decision.id}
                href={`/boards/${boardId}/decisions/${decision.id}`}
                className="group flex items-center justify-between rounded-xl border p-3 transition-all hover:bg-muted/50 hover:shadow-sm"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {decision.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    سررسید: {decision.dueDate}
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">اقدامات سریع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                href: `/boards/${boardId}/decisions/new`,
                label: "تصمیم جدید",
                icon: Plus,
                primary: true,
              },
              {
                href: `/boards/${boardId}/kanban`,
                label: "بورد کانبان",
                icon: LayoutGrid,
              },
              {
                href: `/boards/${boardId}/decisions`,
                label: "لیست تصمیمات",
                icon: List,
              },
              { href: "/reports", label: "گزارش‌ها", icon: BarChart3 },
              {
                href: `/boards/${boardId}/settings`,
                label: "تنظیمات",
                icon: Settings,
              },
            ].map((action) => (
              <Button
                key={action.href}
                asChild
                variant={action.primary ? "default" : "outline"}
                className={cn(
                  "h-auto flex-col gap-2 py-4 transition-all hover:shadow-sm",
                  action.primary && "shadow-md"
                )}
              >
                <Link href={action.href}>
                  <action.icon className="size-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
