"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { checkDecisionQuality } from "@/lib/quality-gates";
import { useApp } from "@/lib/store";
import type { Decision } from "@/lib/types";
import { cn } from "@/lib/utils";

const columnColors: Record<string, string> = {
  Draft: "border-t-slate-400",
  "Ready for Review": "border-t-amber-400",
  Review: "border-t-blue-400",
  Approved: "border-t-indigo-400",
  Implementing: "border-t-violet-400",
  Done: "border-t-emerald-400",
  Reversed: "border-t-rose-400",
};

const columnDotColors: Record<string, string> = {
  Draft: "bg-slate-400",
  "Ready for Review": "bg-amber-400",
  Review: "bg-blue-400",
  Approved: "bg-indigo-400",
  Implementing: "bg-violet-400",
  Done: "bg-emerald-400",
  Reversed: "bg-rose-400",
};

export default function KanbanPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, getBoardDecisions, updateDecision, deleteDecision, config } = useApp();

  const board = getBoard(boardId);
  const decisions = getBoardDecisions(boardId);

  const [searchQuery, setSearchQuery] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const columns = board?.columns || [];

  const filteredDecisions = useMemo(() => {
    return decisions.filter((d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [decisions, searchQuery]);

  if (!board) return null;

  const onDragStart = (id: string) => {
    setDraggedId(id);
  };

  const onDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const onDragLeave = () => {
    setDragOverColumn(null);
  };

  const onDrop = (column: string) => {
    if (!draggedId) return;
    void updateDecision(draggedId, { status: column as Decision["status"] });
    setDraggedId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      <PageHeader
        title="بورد کانبان"
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "کانبان", href: `/boards/${boardId}/kanban` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="جستجو..."
                className="h-9 ps-9 w-56 bg-muted/50 border-transparent hover:border-border transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button asChild size="sm" className="shadow-sm">
              <Link href={`/boards/${boardId}/decisions/new`}>
                <Plus className="me-2 size-4" />
                تصمیم جدید
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex grow gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const colDecisions = filteredDecisions.filter(
            (d) => d.status === column
          );
          const isDragOver = dragOverColumn === column;
          return (
            <div
              key={column}
              className={cn(
                "flex w-80 shrink-0 flex-col gap-3 rounded-xl border-t-2 bg-muted/30 p-3 transition-all",
                columnColors[column] || "border-t-muted-foreground",
                isDragOver && "bg-primary/5 ring-2 ring-primary/20"
              )}
              onDragOver={(e) => onDragOver(e, column)}
              onDragLeave={onDragLeave}
              onDrop={() => onDrop(column)}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "size-2 rounded-full",
                      columnDotColors[column] || "bg-muted-foreground"
                    )}
                  />
                  <h3 className="text-sm font-semibold">
                    {config.defaultColumnLabels[column] || column}
                  </h3>
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-full px-2 text-xs font-mono"
                >
                  {colDecisions.length}
                </Badge>
              </div>

              <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
                {colDecisions.map((decision) => {
                  const quality = checkDecisionQuality(decision, board);
                  const isHighRisk =
                    !decision.reversible &&
                    (!decision.keyRisksMitigations ||
                      !decision.evidenceLinks?.length);
                  const isDragging = draggedId === decision.id;

                  return (
                    <Card
                      key={decision.id}
                      draggable
                      onDragStart={() => onDragStart(decision.id)}
                      className={cn(
                        "cursor-move transition-all hover:shadow-md group border-border/60",
                        isDragging && "opacity-40 scale-95"
                      )}
                    >
                      <CardHeader className="p-3 pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/boards/${boardId}/decisions/${decision.id}`}
                            className="text-sm font-medium leading-tight hover:text-primary transition-colors"
                          >
                            {decision.title}
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/boards/${boardId}/decisions/${decision.id}`}
                                >
                                  مشاهده / ویرایش
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => void deleteDecision(decision.id)}
                              >
                                <Trash2 className="size-4 me-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {decision.category}
                          </Badge>
                          <Badge
                            variant={
                              decision.impact === "High"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-[10px] px-1.5 py-0"
                          >
                            {decision.impact === "High"
                              ? "بالا"
                              : decision.impact === "Medium"
                                ? "متوسط"
                                : "کم"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-2">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              کیفیت
                            </span>
                            <span
                              className={cn(
                                "font-semibold tabular-nums",
                                quality.score >= 80
                                  ? "text-emerald-600"
                                  : quality.score >= 50
                                    ? "text-amber-600"
                                    : "text-destructive"
                              )}
                            >
                              {quality.score}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                quality.score >= 80
                                  ? "bg-emerald-500"
                                  : quality.score >= 50
                                    ? "bg-amber-500"
                                    : "bg-destructive"
                              )}
                              style={{ width: `${quality.score}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 pt-0 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {decision.ownerName?.charAt(0) || "?"}
                          </div>
                          {decision.ownerName && (
                            <span className="text-[11px] text-muted-foreground truncate max-w-[100px]">
                              {decision.ownerName}
                            </span>
                          )}
                        </div>
                        {isHighRisk && (
                          <AlertCircle className="size-3.5 text-destructive animate-pulse-soft" />
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
              <Button
                asChild
                variant="ghost"
                className="h-9 w-full justify-start gap-2 border border-dashed border-muted-foreground/20 hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all"
              >
                <Link href={`/boards/${boardId}/decisions/new`}>
                  <Plus className="size-3.5" />
                  <span className="text-xs">افزودن تصمیم</span>
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
