"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GripVertical, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { users } from "@/lib/mock-data";
import { canMoveToReview } from "@/lib/quality-gates";
import { useApp } from "@/lib/store";
import type { Decision } from "@/lib/types";
import { cn } from "@/lib/utils";

function qualityBadge(label: string, passed: boolean) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-xs",
        passed
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      )}
    >
      {label} {passed ? "OK" : "Missing"}
    </span>
  );
}

function DecisionCard({
  boardId,
  decision,
  isSelected,
  isDragging,
  onSelect,
  onDragEnd,
  onDragStart,
  showQualityBadges,
}: {
  boardId: string;
  decision: Decision;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (checked: boolean) => void;
  onDragEnd: () => void;
  onDragStart: () => void;
  showQualityBadges: boolean;
}) {
  const overdue = decision.dueDate && new Date(decision.dueDate) < new Date();
  const hasOwner = !!decision.ownerId;
  const hasCriteria = decision.criteria.length > 0;
  const hasDueDate = !!decision.dueDate;
  const evidenceRequired = decision.reversible === false;
  const hasEvidence = !evidenceRequired
    ? true
    : !!decision.keyRisksMitigations && !!decision.evidenceLinks?.length;

  return (
    <Card
      className={cn(
        "cursor-grab transition-shadow hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("decisionId", decision.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
    >
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start gap-2">
          <Checkbox checked={isSelected} onCheckedChange={(value) => onSelect(Boolean(value))} />
          <GripVertical className="mt-1 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap gap-1">
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
              className="block line-clamp-2 text-sm font-medium hover:underline"
              href={`/boards/${boardId}/decisions/${decision.id}`}
            >
              {decision.title}
            </Link>
            <p className="text-xs text-muted-foreground">Owner: {decision.ownerName || "Missing"}</p>
            <p className={cn("text-xs", overdue ? "font-medium text-destructive" : "text-muted-foreground")}>
              Due: {decision.dueDate || "-"}
            </p>
            <p className="text-xs text-muted-foreground">Confidence: {decision.confidence}%</p>
            <p className="text-xs text-muted-foreground">
              Reversible: {decision.reversible ? "Yes" : "No"}
            </p>

            {showQualityBadges && (
              <div className="mt-2 flex flex-wrap gap-1">
                {qualityBadge("Owner", hasOwner)}
                {qualityBadge("Criteria", hasCriteria)}
                {qualityBadge("Due", hasDueDate)}
                {evidenceRequired && qualityBadge("Evidence", hasEvidence)}
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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dueFilter, setDueFilter] = useState<"all" | "overdue" | "7days">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [blockedMove, setBlockedMove] = useState<{
    decision: Decision;
    missing: string[];
  } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [referenceNow] = useState(() => Date.now());

  const owners = users.filter((user) =>
    decisions.some((decision) => decision.ownerId === user.id)
  );

  if (!board) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  const columns = board.columns;
  const matchesFilters = (decision: Decision) => {
    if (categoryFilter !== "all" && decision.category !== categoryFilter) return false;
    if (impactFilter !== "all" && decision.impact !== impactFilter) return false;
    if (ownerFilter !== "all" && decision.ownerId !== ownerFilter) return false;
    if (statusFilter !== "all" && decision.status !== statusFilter) return false;

    if (dueFilter === "overdue") {
      return !!decision.dueDate && new Date(decision.dueDate) < new Date();
    }

    if (dueFilter === "7days") {
      if (!decision.dueDate) return false;
      const dueDate = new Date(decision.dueDate).getTime();
      return (
        dueDate >= referenceNow &&
        dueDate <= referenceNow + 7 * 24 * 60 * 60 * 1000
      );
    }

    return true;
  };

  const decisionsByColumn = columns.reduce<Record<string, Decision[]>>((accumulator, column) => {
    accumulator[column] = decisions.filter(
      (decision) => decision.status === column && matchesFilters(decision)
    );
    return accumulator;
  }, {});

  const toggleSelected = (decisionId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((current) => (current.includes(decisionId) ? current : [...current, decisionId]));
      return;
    }
    setSelectedIds((current) => current.filter((id) => id !== decisionId));
  };

  const bulkMoveToReadyForReview = () => {
    selectedIds.forEach((decisionId) => {
      updateDecision(decisionId, { status: "Ready for Review" });
    });
    setSelectedIds([]);
  };

  const handleDrop = (targetStatus: string, decisionId: string) => {
    const decision = decisions.find((item) => item.id === decisionId);
    if (!decision) return;

    if (targetStatus === "Review") {
      const gate = canMoveToReview(decision, board);
      if (!gate.allowed) {
        setBlockedMove({ decision, missing: gate.missing });
        return;
      }
    }

    updateDecision(decisionId, { status: targetStatus as Decision["status"] });
    setDragOverColumn(null);
    setDraggingId(null);
  };

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
      />

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/boards/${boardId}/decisions/new`} className="gap-2">
              <Plus className="size-4" />
              New Decision
            </Link>
          </Button>
          <Button
            variant="outline"
            disabled={selectedIds.length === 0}
            onClick={bulkMoveToReadyForReview}
          >
            Bulk actions ({selectedIds.length})
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Switch
              id="quality-toggle"
              checked={showQualityBadges}
              onCheckedChange={setShowQualityBadges}
            />
            <Label htmlFor="quality-toggle">Show quality badges</Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {board.categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={impactFilter} onValueChange={setImpactFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All impacts</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All owners</SelectItem>
              {owners.map((owner) => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {board.columns.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dueFilter} onValueChange={(value) => setDueFilter(value as "all" | "overdue" | "7days")}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Due filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All due dates</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="7days">Due in 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4">
          {columns.map((column) => (
            <div
              key={column}
              className={cn(
                "min-h-[420px] w-72 shrink-0 rounded-lg border-2 border-dashed p-4 transition-colors",
                dragOverColumn === column && "border-primary bg-primary/5"
              )}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverColumn(column);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(event) => {
                event.preventDefault();
                const decisionId = event.dataTransfer.getData("decisionId");
                if (decisionId) handleDrop(column, decisionId);
              }}
            >
              <h3 className="mb-4 font-semibold">{column}</h3>
              <div className="space-y-3">
                {decisionsByColumn[column].map((decision) => (
                  <DecisionCard
                    key={decision.id}
                    boardId={boardId}
                    decision={decision}
                    isDragging={draggingId === decision.id}
                    isSelected={selectedIds.includes(decision.id)}
                    onSelect={(checked) => toggleSelected(decision.id, checked)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverColumn(null);
                    }}
                    onDragStart={() => setDraggingId(decision.id)}
                    showQualityBadges={showQualityBadges}
                  />
                ))}

                {decisionsByColumn[column].length === 0 && (
                  <Empty className="py-8">
                    <EmptyHeader>
                      <EmptyTitle className="text-sm">No decisions in this column</EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button asChild size="sm">
                        <Link href={`/boards/${boardId}/decisions/new`}>+ New Decision</Link>
                      </Button>
                    </EmptyContent>
                  </Empty>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={!!blockedMove} onOpenChange={(open) => !open && setBlockedMove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot move to Review</AlertDialogTitle>
            <AlertDialogDescription>
              Cannot move to Review. Missing required fields: {blockedMove?.missing.join(", ")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel Move</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href={blockedMove ? `/boards/${boardId}/decisions/${blockedMove.decision.id}` : "#"}>
                Fix Now
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
