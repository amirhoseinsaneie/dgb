"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  FileDown,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const chartConfig = {
  value: {
    label: "مقدار",
    color: "hsl(var(--chart-1))",
  },
  count: {
    label: "تعداد",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function ReportsPage() {
  const { decisions } = useApp();
  const [reportType, setReportType] = useState("health");

  const withOwner = decisions.filter((d) => d.ownerId).length;
  const withCriteria = decisions.filter(
    (d) => d.criteria && d.criteria.length > 0
  ).length;
  const irreversibleWithEvidence = decisions.filter(
    (d) =>
      !d.reversible &&
      d.keyRisksMitigations &&
      d.evidenceLinks &&
      d.evidenceLinks.length > 0
  ).length;
  const total = decisions.length;
  const pctOwner = total > 0 ? Math.round((withOwner / total) * 100) : 0;
  const pctCriteria =
    total > 0 ? Math.round((withCriteria / total) * 100) : 0;
  const pctEvidence =
    decisions.filter((d) => !d.reversible).length > 0
      ? Math.round(
          (irreversibleWithEvidence /
            decisions.filter((d) => !d.reversible).length) *
            100
        )
      : 100;

  const categoryData = decisions.reduce(
    (acc, d) => {
      const cat = d.category || "سایر";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));
  const impactData = decisions.reduce<Record<string, number>>(
    (acc, decision) => {
      acc[decision.impact] = (acc[decision.impact] || 0) + 1;
      return acc;
    },
    {}
  );
  const missingFieldCounts = {
    owner: decisions.filter((decision) => !decision.ownerId).length,
    criteria: decisions.filter((decision) => decision.criteria.length === 0)
      .length,
    dueDate: decisions.filter((decision) => !decision.dueDate).length,
    evidence: decisions.filter(
      (decision) =>
        !decision.reversible &&
        (!decision.evidenceLinks?.length || !decision.keyRisksMitigations)
    ).length,
  };

  const reportTabs = [
    { key: "health", label: "سلامت تصمیمات" },
    { key: "overdue", label: "عقب‌افتاده و ریسک‌ها" },
    { key: "cycle", label: "زمان چرخه" },
    { key: "quality", label: "پوشش کیفیت" },
  ];

  const statsCards = [
    {
      label: "% دارای مالک",
      value: `${pctOwner}%`,
      sub: `${withOwner} از ${total} تصمیم`,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      ring: pctOwner >= 80 ? "ring-emerald-500/20" : pctOwner >= 50 ? "ring-amber-500/20" : "ring-destructive/20",
    },
    {
      label: "% دارای معیار",
      value: `${pctCriteria}%`,
      sub: `${withCriteria} از ${total} تصمیم`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      ring: pctCriteria >= 80 ? "ring-emerald-500/20" : pctCriteria >= 50 ? "ring-amber-500/20" : "ring-destructive/20",
    },
    {
      label: "% با شواهد",
      value: `${pctEvidence}%`,
      sub: "تصمیمات غیرقابل بازگشت",
      icon: Shield,
      color: "text-violet-600",
      bg: "bg-violet-500/10",
      ring: pctEvidence >= 80 ? "ring-emerald-500/20" : pctEvidence >= 50 ? "ring-amber-500/20" : "ring-destructive/20",
    },
    {
      label: "میانگین زمان تایید",
      value: "۴.۲ روز",
      sub: "میانگین",
      icon: BarChart3,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      ring: "ring-transparent",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="گزارش‌ها"
        subtitle="سلامت تصمیمات و روندها"
        breadcrumbs={[{ label: "گزارش‌ها", href: "/reports" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="size-4 me-2" />
              خروجی PDF
            </Button>
            <Button variant="outline" size="sm">
              خروجی CSV
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-1.5 rounded-xl bg-muted/50 p-1.5">
        {reportTabs.map((tab) => (
          <Button
            key={tab.key}
            variant={reportType === tab.key ? "default" : "ghost"}
            size="sm"
            onClick={() => setReportType(tab.key)}
            className={cn(
              "transition-all",
              reportType === tab.key && "shadow-sm"
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card
            key={stat.label}
            className={cn(
              "relative overflow-hidden transition-all hover:shadow-sm"
            )}
          >
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    stat.bg
                  )}
                >
                  <stat.icon className={cn("size-5", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.sub}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              تصمیمات بر اساس دسته‌بندی
            </CardTitle>
            <CardDescription>توزیع بر اساس دسته‌بندی</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="size-4 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-base">
                  ۱۰ مورد در معرض خطر
                </CardTitle>
                <CardDescription>تصمیمات نیازمند توجه</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {decisions
                .filter(
                  (d) =>
                    !["Done", "Reversed"].includes(d.status) &&
                    (!d.ownerId || !d.criteria?.length || !d.dueDate)
                )
                .slice(0, 10)
                .map((d) => (
                  <div
                    key={d.id}
                    className="flex justify-between rounded-xl border p-3 text-sm transition-colors hover:bg-muted/50"
                  >
                    <span className="truncate font-medium">{d.title}</span>
                    <Badge variant="outline" className="shrink-0 ms-2">
                      {d.status}
                    </Badge>
                  </div>
                ))}
              {decisions.filter(
                (d) =>
                  !["Done", "Reversed"].includes(d.status) &&
                  (!d.ownerId || !d.criteria?.length || !d.dueDate)
              ).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 mb-2">
                    <Shield className="size-5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    تصمیمی در معرض خطر نیست
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              رایج‌ترین فیلدهای ناقص
            </CardTitle>
            <CardDescription>نقاط داغ پوشش کیفیت</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "مالک",
                count: missingFieldCounts.owner,
                color: "bg-primary",
              },
              {
                label: "معیار",
                count: missingFieldCounts.criteria,
                color: "bg-amber-500",
              },
              {
                label: "تاریخ سررسید",
                count: missingFieldCounts.dueDate,
                color: "bg-violet-500",
              },
              {
                label: "شواهد (غیرقابل بازگشت)",
                count: missingFieldCounts.evidence,
                color: "bg-destructive",
              },
            ].map((field) => (
              <div key={field.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{field.label}</span>
                  <span className="font-semibold tabular-nums">
                    {field.count}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      field.color
                    )}
                    style={{
                      width: `${total > 0 ? Math.min((field.count / total) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              تصمیمات بر اساس تاثیر
            </CardTitle>
            <CardDescription>کم / متوسط / زیاد</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "کم",
                  value: impactData.Low || 0,
                  color: "text-emerald-600",
                  bg: "bg-emerald-500/10",
                },
                {
                  label: "متوسط",
                  value: impactData.Medium || 0,
                  color: "text-amber-600",
                  bg: "bg-amber-500/10",
                },
                {
                  label: "زیاد",
                  value: impactData.High || 0,
                  color: "text-destructive",
                  bg: "bg-destructive/10",
                },
              ].map((impact) => (
                <div
                  key={impact.label}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl p-4",
                    impact.bg
                  )}
                >
                  <span
                    className={cn("text-3xl font-bold tabular-nums", impact.color)}
                  >
                    {impact.value}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {impact.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
