"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, MoreHorizontal, Archive, Copy, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";
import { checkDecisionQuality } from "@/lib/quality-gates";
import { cn } from "@/lib/utils";

export default function DecisionListPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, getBoardDecisions } = useApp();
  const board = getBoard(boardId);
  const decisions = getBoardDecisions(boardId);

  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [impactFilter, setImpactFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = decisions.filter((d) => {
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (ownerFilter !== "all" && d.ownerId !== ownerFilter) return false;
    if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
    if (impactFilter !== "all" && d.impact !== impactFilter) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    return true;
  });

  const owners = [...new Set(decisions.map((d) => d.ownerId).filter(Boolean))];

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
        title="Decisions"
        subtitle="Filterable and sortable list of decisions"
        breadcrumbs={[
          { label: "Boards", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "Decisions", href: `/boards/${boardId}/decisions` },
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

      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search decisions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            {owners.map((id) => {
              const d = decisions.find((x) => x.ownerId === id);
              return (
                <SelectItem key={id} value={id!}>
                  {d?.ownerName || id}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
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
        <Select value={impactFilter} onValueChange={setImpactFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Impact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {board.columns.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((decision) => {
              const { score, checks } = checkDecisionQuality(decision, board);
              const failedChecks = checks.filter((c) => !c.passed);
              return (
                <TableRow key={decision.id}>
                  <TableCell>
                    <Link
                      href={`/boards/${boardId}/decisions/${decision.id}`}
                      className="font-medium hover:underline"
                    >
                      {decision.title}
                    </Link>
                  </TableCell>
                  <TableCell>{decision.category}</TableCell>
                  <TableCell>{decision.ownerName || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{decision.status}</Badge>
                  </TableCell>
                  <TableCell className={cn(
                    decision.dueDate && new Date(decision.dueDate) < new Date() && "text-destructive"
                  )}>
                    {decision.dueDate || "—"}
                  </TableCell>
                  <TableCell>{decision.confidence}%</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {score}/100
                      {failedChecks.length > 0 && (
                        <span className="text-muted-foreground ml-1">
                          ({failedChecks.map((c) => c.label).join(", ")})
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/boards/${boardId}/decisions/${decision.id}`}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="size-4" />
                            Open
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Copy className="size-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" className="gap-2">
                          <Archive className="size-4" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
