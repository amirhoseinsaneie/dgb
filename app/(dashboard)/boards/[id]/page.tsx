"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BarChart3, LayoutGrid, List, Plus, Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/store";

export default function BoardDashboardPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, getBoardDecisions } = useApp();
  const board = getBoard(boardId);
  const boardDecisions = getBoardDecisions(boardId);

  if (!board) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">بورد یافت نشد</p>
      </div>
    );
  }

  const openCount = boardDecisions.filter((decision) => !["Done", "Reversed"].includes(decision.status)).length;
  const overdueCount = boardDecisions.filter((decision) => {
    if (!decision.dueDate) return false;
    return new Date(decision.dueDate) < new Date() && !["Done", "Reversed"].includes(decision.status);
  }).length;
  const missingOwnerCount = boardDecisions.filter((decision) => !decision.ownerId && !["Done", "Reversed"].includes(decision.status)).length;
  const missingCriteriaCount = boardDecisions.filter((decision) => decision.criteria.length === 0 && !["Done", "Reversed"].includes(decision.status)).length;
  const irreversiblePending = boardDecisions.filter((decision) => {
    if (decision.reversible || ["Done", "Reversed"].includes(decision.status)) return false;
    return !decision.keyRisksMitigations || !decision.evidenceLinks?.length;
  }).length;

  const priorityAlerts = boardDecisions.filter((decision) => {
    if (["Done", "Reversed"].includes(decision.status)) return false;
    if (!decision.ownerId || decision.criteria.length === 0 || !decision.dueDate) return true;
    return new Date(decision.dueDate) < new Date();
  }).slice(0, 5);

  const upcomingDeadlines = boardDecisions
    .filter((decision) => decision.dueDate && !["Done", "Reversed"].includes(decision.status))
    .sort((a, b) => new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`بورد: ${board.name}`}
        subtitle="سلامت تصمیمات، تصمیمات باز و سررسیدهای آینده"
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
        ]}
      />

      <div className="flex flex-wrap gap-4 rounded-lg bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">باز:</span>
          <Badge variant="secondary">{openCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">عقب‌افتاده:</span>
          <Badge variant={overdueCount > 0 ? "destructive" : "secondary"}>{overdueCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">بدون مالک:</span>
          <Badge variant="secondary">{missingOwnerCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">بدون معیار:</span>
          <Badge variant="secondary">{missingCriteriaCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">غیرقابل بازگشت معلق:</span>
          <Badge variant="secondary">{irreversiblePending}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">میانگین زمان تایید:</span>
          <span className="font-medium">۴.۲ روز</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>هشدارهای اولویت‌دار</CardTitle>
            <CardDescription>موارد نیازمند اقدام</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityAlerts.length === 0 && (
              <p className="text-sm text-muted-foreground">بدون هشدار</p>
            )}
            {priorityAlerts.map((decision) => (
              <div key={decision.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{decision.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {!decision.ownerId && "بدون مالک "}
                    {decision.criteria.length === 0 && "بدون معیار "}
                    {decision.dueDate && new Date(decision.dueDate) < new Date() && "عقب‌افتاده"}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/boards/${boardId}/decisions/${decision.id}`}>رفتن به تصمیم</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>سررسیدهای آینده</CardTitle>
            <CardDescription>تصمیمات نزدیک به سررسید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.length === 0 && (
              <p className="text-sm text-muted-foreground">سررسید آینده‌ای وجود ندارد</p>
            )}
            {upcomingDeadlines.map((decision) => (
              <div key={decision.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{decision.title}</p>
                  <p className="text-xs text-muted-foreground">سررسید: {decision.dueDate}</p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/boards/${boardId}/kanban`}>رفتن به بورد</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اقدامات سریع</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href={`/boards/${boardId}/decisions/new`} className="gap-2">
              <Plus className="size-4" />
              تصمیم جدید
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/boards/${boardId}/kanban`} className="gap-2">
              <LayoutGrid className="size-4" />
              باز کردن بورد کانبان
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/boards/${boardId}/decisions`} className="gap-2">
              <List className="size-4" />
              لیست تصمیمات
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/reports" className="gap-2">
              <BarChart3 className="size-4" />
              گزارش‌ها
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/boards/${boardId}/settings`} className="gap-2">
              <Settings className="size-4" />
              تنظیمات
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
