"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, LayoutGrid, List, BarChart3, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";

export default function BoardDashboardPage() {
  const params = useParams();
  const id = params.id as string;
  const { getBoard, getBoardDecisions } = useApp();
  const board = getBoard(id);
  const boardDecisions = getBoardDecisions(id);

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  const openCount = boardDecisions.filter(
    (d) =>
      !["Done", "Reversed"].includes(d.status)
  ).length;
  const overdueCount = boardDecisions.filter((d) => {
    if (!d.dueDate) return false;
    return new Date(d.dueDate) < new Date() && !["Done", "Reversed"].includes(d.status);
  }).length;
  const missingOwnerCount = boardDecisions.filter(
    (d) => !d.ownerId && !["Done", "Reversed"].includes(d.status)
  ).length;
  const missingCriteriaCount = boardDecisions.filter(
    (d) =>
      (!d.criteria || d.criteria.length === 0) &&
      !["Done", "Reversed"].includes(d.status)
  ).length;
  const irreversiblePending = boardDecisions.filter(
    (d) =>
      !d.reversible &&
      !["Done", "Reversed"].includes(d.status) &&
      (!d.keyRisksMitigations || !d.evidenceLinks?.length)
  ).length;

  const priorityAlerts = boardDecisions
    .filter((d) => {
      if (["Done", "Reversed"].includes(d.status)) return false;
      if (!d.ownerId || !d.criteria?.length || !d.dueDate) return true;
      if (d.dueDate && new Date(d.dueDate) < new Date()) return true;
      return false;
    })
    .slice(0, 5);

  const upcomingDeadlines = boardDecisions
    .filter((d) => d.dueDate && !["Done", "Reversed"].includes(d.status))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Board: ${board.name}`}
        subtitle="Decision health, open decisions, and upcoming deadlines"
        breadcrumbs={[
          { label: "Boards", href: "/boards" },
          { label: board.name, href: `/boards/${id}` },
        ]}
      />

      <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Open:</span>
          <Badge variant="secondary">{openCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Overdue:</span>
          <Badge variant={overdueCount > 0 ? "destructive" : "secondary"}>
            {overdueCount}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Missing Owner:</span>
          <Badge variant="secondary">{missingOwnerCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Missing Criteria:</span>
          <Badge variant="secondary">{missingCriteriaCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Irreversible pending:</span>
          <Badge variant="secondary">{irreversiblePending}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Avg time to approve:</span>
          <span className="font-medium">4.2 days</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Priority Alerts</CardTitle>
            <CardDescription>Priority alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityAlerts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No alerts</p>
            ) : (
              priorityAlerts.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium text-sm">{d.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {!d.ownerId && "Missing owner"}
                      {(!d.criteria?.length) && " • Missing criteria"}
                      {d.dueDate && new Date(d.dueDate) < new Date() && " • Overdue"}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/boards/${id}/decisions/${d.id}`}>Go to Decision</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Upcoming deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming deadlines</p>
            ) : (
              upcomingDeadlines.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium text-sm">{d.title}</p>
                    <p className="text-muted-foreground text-xs">
                      Due: {d.dueDate}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/boards/${id}/kanban`}>Go to Board</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href={`/boards/${id}/decisions/new`} className="gap-2">
              <Plus className="size-4" />
              New Decision
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/boards/${id}/kanban`} className="gap-2">
              <LayoutGrid className="size-4" />
              Open Kanban Board
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/boards/${id}/decisions`} className="gap-2">
              <List className="size-4" />
              Decision List
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/reports" className="gap-2">
              <BarChart3 className="size-4" />
              Reports
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
