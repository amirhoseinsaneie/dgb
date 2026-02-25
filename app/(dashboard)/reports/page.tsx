"use client";

import { useState } from "react";
import { BarChart3, FileDown, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { useApp } from "@/lib/store";

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
  const pctCriteria = total > 0 ? Math.round((withCriteria / total) * 100) : 0;
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
  const impactData = decisions.reduce<Record<string, number>>((acc, decision) => {
    acc[decision.impact] = (acc[decision.impact] || 0) + 1;
    return acc;
  }, {});
  const missingFieldCounts = {
    owner: decisions.filter((decision) => !decision.ownerId).length,
    criteria: decisions.filter((decision) => decision.criteria.length === 0).length,
    dueDate: decisions.filter((decision) => !decision.dueDate).length,
    evidence: decisions.filter(
      (decision) =>
        !decision.reversible &&
        (!decision.evidenceLinks?.length || !decision.keyRisksMitigations)
    ).length,
  };

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

      <div className="flex flex-wrap gap-2">
        <Button
          variant={reportType === "health" ? "default" : "outline"}
          size="sm"
          onClick={() => setReportType("health")}
        >
          گزارش سلامت تصمیمات
        </Button>
        <Button
          variant={reportType === "overdue" ? "default" : "outline"}
          size="sm"
          onClick={() => setReportType("overdue")}
        >
          عقب‌افتاده و ریسک‌ها
        </Button>
        <Button
          variant={reportType === "cycle" ? "default" : "outline"}
          size="sm"
          onClick={() => setReportType("cycle")}
        >
          زمان چرخه
        </Button>
        <Button
          variant={reportType === "quality" ? "default" : "outline"}
          size="sm"
          onClick={() => setReportType("quality")}
        >
          پوشش کیفیت
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              % دارای مالک
            </CardTitle>
            <BarChart3 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pctOwner}%</div>
            <p className="text-muted-foreground text-xs">
              {withOwner} از {total} تصمیم
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              % دارای معیار
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pctCriteria}%</div>
            <p className="text-muted-foreground text-xs">
              {withCriteria} از {total} تصمیم
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              % غیرقابل بازگشت با شواهد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pctEvidence}%</div>
            <p className="text-muted-foreground text-xs">
              تصمیمات غیرقابل بازگشت
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              میانگین زمان تایید
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">۴.۲ روز</div>
            <p className="text-muted-foreground text-xs">
              میانگین
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>تصمیمات بر اساس دسته‌بندی</CardTitle>
            <CardDescription>توزیع بر اساس دسته‌بندی</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>۱۰ مورد در معرض خطر</CardTitle>
            <CardDescription>تصمیمات در معرض خطر</CardDescription>
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
                    className="flex justify-between rounded border p-2 text-sm"
                  >
                    <span className="truncate">{d.title}</span>
                    <span className="text-muted-foreground shrink-0">
                      {d.status}
                    </span>
                  </div>
                ))}
              {decisions.filter(
                (d) =>
                  !["Done", "Reversed"].includes(d.status) &&
                  (!d.ownerId || !d.criteria?.length || !d.dueDate)
              ).length === 0 && (
                <p className="text-muted-foreground text-sm">
                  تصمیمی در معرض خطر نیست
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>رایج‌ترین فیلدهای ناقص</CardTitle>
            <CardDescription>نقاط داغ پوشش کیفیت</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>مالک: {missingFieldCounts.owner}</p>
            <p>معیار: {missingFieldCounts.criteria}</p>
            <p>تاریخ سررسید: {missingFieldCounts.dueDate}</p>
            <p>شواهد (غیرقابل بازگشت): {missingFieldCounts.evidence}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>تصمیمات بر اساس تاثیر</CardTitle>
            <CardDescription>کم / متوسط / زیاد</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>کم: {impactData.Low || 0}</p>
            <p>متوسط: {impactData.Medium || 0}</p>
            <p>زیاد: {impactData.High || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
