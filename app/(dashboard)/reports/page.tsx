"use client";

import { useState } from "react";
import { BarChart3, FileDown, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
  count: {
    label: "Count",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function ReportsPage() {
  const { boards, decisions } = useApp();
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
      const cat = d.category || "Other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        subtitle="Decision health and trends"
        breadcrumbs={[{ label: "Reports", href: "/reports" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="size-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              Export CSV
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
          Decision Health Report
        </Button>
        <Button
          variant={reportType === "overdue" ? "default" : "outline"}
          size="sm"
          onClick={() => setReportType("overdue")}
        >
          Overdue & Risks
        </Button>
        <Button
          variant={reportType === "cycle" ? "default" : "outline"}
          size="sm"
          onClick={() => setReportType("cycle")}
        >
          Cycle Time
        </Button>
        <Button
          variant={reportType === "quality" ? "default" : "outline"}
          size="sm"
          onClick={() => setReportType("quality")}
        >
          Quality Coverage
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              % with owner
            </CardTitle>
            <BarChart3 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pctOwner}%</div>
            <p className="text-muted-foreground text-xs">
              {withOwner} of {total} decisions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              % with criteria
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pctCriteria}%</div>
            <p className="text-muted-foreground text-xs">
              {withCriteria} of {total} decisions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              % irreversible with evidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pctEvidence}%</div>
            <p className="text-muted-foreground text-xs">
              Irreversible decisions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg approval time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 days</div>
            <p className="text-muted-foreground text-xs">
              Average
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Decisions by Category</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
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
            <CardTitle>Top 10 at Risk</CardTitle>
            <CardDescription>Decisions at risk</CardDescription>
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
                  No decisions at risk
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
