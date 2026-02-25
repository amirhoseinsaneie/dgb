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
        <p className="text-muted-foreground">Board not found</p>
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
        title={`Board: ${board.name}`}
        subtitle="Decision health, open decisions, and upcoming deadlines"
        breadcrumbs={[
          { label: "Boards", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
        ]}
      />

      <div className="flex flex-wrap gap-4 rounded-lg bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Open:</span>
          <Badge variant="secondary">{openCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Overdue:</span>
          <Badge variant={overdueCount > 0 ? "destructive" : "secondary"}>{overdueCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Missing Owner:</span>
          <Badge variant="secondary">{missingOwnerCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Missing Criteria:</span>
          <Badge variant="secondary">{missingCriteriaCount}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Irreversible pending:</span>
          <Badge variant="secondary">{irreversiblePending}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Avg time to approve:</span>
          <span className="font-medium">4.2 days</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Priority Alerts</CardTitle>
            <CardDescription>Items requiring action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityAlerts.length === 0 && (
              <p className="text-sm text-muted-foreground">No alerts</p>
            )}
            {priorityAlerts.map((decision) => (
              <div key={decision.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{decision.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {!decision.ownerId && "Missing owner "}
                    {decision.criteria.length === 0 && "Missing criteria "}
                    {decision.dueDate && new Date(decision.dueDate) < new Date() && "Overdue"}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/boards/${boardId}/decisions/${decision.id}`}>Go to Decision</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Near due date decisions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
            )}
            {upcomingDeadlines.map((decision) => (
              <div key={decision.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{decision.title}</p>
                  <p className="text-xs text-muted-foreground">Due: {decision.dueDate}</p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/boards/${boardId}/kanban`}>Go to Board</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href={`/boards/${boardId}/decisions/new`} className="gap-2">
              <Plus className="size-4" />
              New Decision
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/boards/${boardId}/kanban`} className="gap-2">
              <LayoutGrid className="size-4" />
              Open Kanban Board
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/boards/${boardId}/decisions`} className="gap-2">
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
          <Button asChild variant="outline">
            <Link href={`/boards/${boardId}/settings`} className="gap-2">
              <Settings className="size-4" />
              Settings
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
