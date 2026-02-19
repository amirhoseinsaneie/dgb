"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, Check, X, GripVertical } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { useApp } from "@/lib/store";
import { canMoveToReview } from "@/lib/quality-gates";
import type { Decision } from "@/lib/types";
import { cn } from "@/lib/utils";

function DecisionCard({
  decision,
  boardId,
  showQualityBadges,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  decision: Decision;
  boardId: string;
  showQualityBadges: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const isOverdue =
    decision.dueDate && new Date(decision.dueDate) < new Date();
  const hasOwner = !!decision.ownerId;
  const hasCriteria = decision.criteria && decision.criteria.length > 0;
  const hasDue = !!decision.dueDate;

  return (
    <Card
      className={cn(
        "cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
        isDragging && "opacity-50"
      )}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("decisionId", decision.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-2">
          <GripVertical className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1 mb-1">
              <Badge variant="outline" className="text-xs">
                {decision.category}
              </Badge>
              <Badge
                variant={
                  decision.impact === "High"
                    ? "destructive"
                    : decision.impact === "Medium"
                      ? "default"
                      : "secondary"
                }
              >
                {decision.impact}
              </Badge>
            </div>
            <Link
              href={`/boards/${boardId}/decisions/${decision.id}`}
              className="font-medium text-sm hover:underline line-clamp-2 block"
            >
              {decision.title}
            </Link>
            <p className="text-muted-foreground text-xs mt-1">
              Owner: {decision.ownerName || "Missing"}
            </p>
            <p
              className={cn(
                "text-xs",
                isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
              )}
            >
              Due: {decision.dueDate || "—"}
            </p>
            <p className="text-muted-foreground text-xs">
              Confidence: {decision.confidence}%
            </p>
            <p className="text-muted-foreground text-xs">
              Reversible: {decision.reversible ? "Yes" : "No"}
            </p>
            {showQualityBadges && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    hasOwner ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  Owner {hasOwner ? "✅" : "❌"}
                </span>
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    hasCriteria ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  Criteria {hasCriteria ? "✅" : "❌"}
                </span>
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    hasDue ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  Due {hasDue ? "✅" : "❌"}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function KanbanBoardPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, getBoardDecisions, updateDecision } = useApp();
  const board = getBoard(boardId);
  const decisions = getBoardDecisions(boardId);

  const [showQualityBadges, setShowQualityBadges] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [blockedMove, setBlockedMove] = useState<{
    decision: Decision;
    newStatus: string;
    missing: string[];
  } | null>(null);
  const [draggedDecision, setDraggedDecision] = useState<Decision | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const columns = board?.columns ?? [];
  const reviewColumn = "Review";

  const decisionsByColumn = columns.reduce(
    (acc, col) => {
      acc[col] = decisions.filter((d) => d.status === col);
      return acc;
    },
    {} as Record<string, Decision[]>
  );

  const filteredDecisionsByColumn = Object.fromEntries(
    Object.entries(decisionsByColumn).map(([col, items]) => [
      col,
      categoryFilter === "all"
        ? items
        : items.filter((d) => d.category === categoryFilter),
    ])
  );

  const handleDragStart = useCallback((decision: Decision) => {
    setDraggedDecision(decision);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedDecision(null);
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (targetStatus: string, decisionId: string) => {
      const decision = decisions.find((d) => d.id === decisionId);
      if (!decision || !board) return;
      setDragOverColumn(null);

      if (targetStatus === reviewColumn) {
        const { allowed, missing } = canMoveToReview(decision, board);
        if (!allowed) {
          setBlockedMove({ decision, newStatus: targetStatus, missing });
          return;
        }
      }

      updateDecision(decisionId, { status: targetStatus as Decision["status"] });
      setDraggedDecision(null);
    },
    [decisions, board, updateDecision]
  );

  const handleFixNow = () => {
    if (blockedMove) {
      window.location.href = `/boards/${boardId}/decisions/${blockedMove.decision.id}`;
    }
    setBlockedMove(null);
  };

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban Board"
        subtitle="Move decisions from Draft to Done with quality gates"
        breadcrumbs={[
          { label: "Boards", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "Kanban", href: `/boards/${boardId}/kanban` },
        ]}
        actions={
          <Button asChild>
            <Link href={`/boards/${boardId}/decisions/new`} className="gap-2">
              <Plus className="size-4" />
              New Decision
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {board.categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch
            id="quality-badges"
            checked={showQualityBadges}
            onCheckedChange={setShowQualityBadges}
          />
          <Label htmlFor="quality-badges" className="text-sm">
            Show quality badges
          </Label>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {columns.map((column) => (
            <div
              key={column}
              className={cn(
                "w-72 shrink-0 rounded-lg border-2 border-dashed p-4 min-h-[400px] transition-colors",
                dragOverColumn === column && "border-primary bg-primary/5"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(column);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => {
                e.preventDefault();
                const decisionId = e.dataTransfer.getData("decisionId");
                if (decisionId) handleDrop(column, decisionId);
              }}
            >
              <h3 className="font-semibold mb-4">{column}</h3>
              <div className="space-y-3">
                {filteredDecisionsByColumn[column]?.map((decision) => (
                  <DecisionCard
                    key={decision.id}
                    decision={decision}
                    boardId={boardId}
                    showQualityBadges={showQualityBadges}
                    onDragStart={() => handleDragStart(decision)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedDecision?.id === decision.id}
                  />
                ))}
                {(!filteredDecisionsByColumn[column] ||
                  filteredDecisionsByColumn[column].length === 0) && (
                  <Empty className="py-8">
                    <EmptyHeader>
                      <EmptyTitle className="text-sm">
                        No decisions in this column
                      </EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button asChild size="sm">
                        <Link href={`/boards/${boardId}/decisions/new`}>
                          + New Decision
                        </Link>
                      </Button>
                    </EmptyContent>
                  </Empty>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={!!blockedMove} onOpenChange={(o) => !o && setBlockedMove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot move to Review</AlertDialogTitle>
            <AlertDialogDescription>
              Missing required fields: {blockedMove?.missing.join(", ")}
              <br />
              Please fix these before moving to Review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel Move</AlertDialogCancel>
            <AlertDialogAction onClick={handleFixNow}>Fix Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
