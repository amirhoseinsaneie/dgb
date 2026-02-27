"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, Filter, MoreHorizontal, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function KanbanPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, getBoardDecisions, updateDecision, config } = useApp();

  const board = getBoard(boardId);
  const decisions = getBoardDecisions(boardId);

  const [searchQuery, setSearchQuery] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);

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

  const onDrop = (column: string) => {
    if (!draggedId) return;
    void updateDecision(draggedId, { status: column as Decision["status"] });
    setDraggedId(null);
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
                className="h-9 ps-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="me-2 size-4" />
              فیلتر
            </Button>
            <Button asChild size="sm">
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
          const colDecisions = filteredDecisions.filter((d) => d.status === column);
          return (
            <div
              key={column}
              className="group flex w-80 shrink-0 flex-col gap-3 rounded-lg bg-muted/50 p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(column)}
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold">
                  {config.defaultColumnLabels[column] || column}
                </h3>
                <Badge variant="secondary" className="rounded-full">
                  {colDecisions.length}
                </Badge>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                {colDecisions.map((decision) => {
                  const quality = checkDecisionQuality(decision, board);
                  const isHighRisk = !decision.reversible && (!decision.keyRisksMitigations || !decision.evidenceLinks?.length);

                  return (
                    <Card
                      key={decision.id}
                      draggable
                      onDragStart={() => onDragStart(decision.id)}
                      className="cursor-move transition-shadow hover:shadow-md"
                    >
                      <CardHeader className="p-3 pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/boards/${boardId}/decisions/${decision.id}`}
                            className="text-sm font-medium leading-tight hover:underline"
                          >
                            {decision.title}
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-6 shrink-0">
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/boards/${boardId}/decisions/${decision.id}`}>مشاهده</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>ویرایش</DropdownMenuItem>
                              <DropdownMenuItem variant="destructive">حذف</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {decision.category}
                          </Badge>
                          <Badge
                            variant={decision.impact === "High" ? "destructive" : "secondary"}
                            className="text-[10px] px-1 py-0"
                          >
                            {decision.impact === "High" ? "بالا" : decision.impact === "Medium" ? "متوسط" : "کم"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pb-2 pt-2">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">کیفیت:</span>
                            <span className={cn(
                              "font-medium",
                              quality.score >= 80 ? "text-green-600" : quality.score >= 50 ? "text-amber-600" : "text-destructive"
                            )}>
                              {quality.score}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full transition-all",
                                quality.score >= 80 ? "bg-green-600" : quality.score >= 50 ? "bg-amber-600" : "bg-destructive"
                              )}
                              style={{ width: `${quality.score}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 pt-0 flex items-center justify-between">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          <div className="z-10 flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium uppercase">
                            {decision.ownerName?.charAt(0) || "?" }
                          </div>
                        </div>
                        {isHighRisk && (
                          <AlertCircle className="size-4 text-destructive" />
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
              <Button variant="ghost" className="h-10 w-full justify-start gap-2 border-2 border-dashed border-transparent hover:border-muted-foreground/20 hover:bg-background/50">
                <Plus className="size-4" />
                افزودن تصمیم
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
