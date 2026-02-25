"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Archive, Copy, ExternalLink, MoreHorizontal, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { users } from "@/lib/mock-data";
import { checkDecisionQuality } from "@/lib/quality-gates";
import { useApp } from "@/lib/store";
import type { Decision } from "@/lib/types";
import { cn } from "@/lib/utils";

function asCSV(value: string | number | undefined) {
  const normalized = String(value ?? "");
  return `"${normalized.replace(/"/g, '""')}"`;
}

export default function DecisionListPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, getBoardDecisions, updateDecision } = useApp();
  const board = getBoard(boardId);
  const decisions = getBoardDecisions(boardId);

  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reversibleFilter, setReversibleFilter] = useState("all");
  const [missingFilter, setMissingFilter] = useState("all");
  const [confidenceMin, setConfidenceMin] = useState(0);
  const [confidenceMax, setConfidenceMax] = useState(100);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedDecisionIds, setSelectedDecisionIds] = useState<string[]>([]);
  const [bulkOwnerId, setBulkOwnerId] = useState("none");
  const [bulkDueDate, setBulkDueDate] = useState("");

  if (!board) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  const matchesMissingFilter = (decision: Decision) => {
    if (missingFilter === "all") return true;
    if (missingFilter === "owner") return !decision.ownerId;
    if (missingFilter === "criteria") return decision.criteria.length === 0;
    if (missingFilter === "evidence") {
      if (decision.reversible) return false;
      return !decision.evidenceLinks?.length || !decision.keyRisksMitigations;
    }
    return true;
  };

  const filteredDecisions = decisions.filter((decision) => {
    const matchesText =
      !search ||
      decision.title.toLowerCase().includes(search.toLowerCase()) ||
      decision.problemStatement.toLowerCase().includes(search.toLowerCase());
    if (!matchesText) return false;
    if (ownerFilter !== "all" && decision.ownerId !== ownerFilter) return false;
    if (categoryFilter !== "all" && decision.category !== categoryFilter) return false;
    if (impactFilter !== "all" && decision.impact !== impactFilter) return false;
    if (statusFilter !== "all" && decision.status !== statusFilter) return false;
    if (reversibleFilter === "yes" && !decision.reversible) return false;
    if (reversibleFilter === "no" && decision.reversible) return false;
    if (!matchesMissingFilter(decision)) return false;
    if (decision.confidence < confidenceMin || decision.confidence > confidenceMax) return false;

    if (dateFrom || dateTo) {
      if (!decision.dueDate) return false;
      if (dateFrom && decision.dueDate < dateFrom) return false;
      if (dateTo && decision.dueDate > dateTo) return false;
    }

    return true;
  });

  const ownerOptions = users.filter((user) =>
    decisions.some((decision) => decision.ownerId === user.id)
  );

  const toggleSelected = (decisionId: string, checked: boolean) => {
    if (checked) {
      setSelectedDecisionIds((current) =>
        current.includes(decisionId) ? current : [...current, decisionId]
      );
      return;
    }
    setSelectedDecisionIds((current) => current.filter((id) => id !== decisionId));
  };

  const assignOwnerBulk = () => {
    selectedDecisionIds.forEach((decisionId) => {
      if (bulkOwnerId === "none") {
        updateDecision(decisionId, { ownerId: undefined, ownerName: undefined });
      } else {
        const owner = users.find((user) => user.id === bulkOwnerId);
        updateDecision(decisionId, { ownerId: owner?.id, ownerName: owner?.name });
      }
    });
    setSelectedDecisionIds([]);
  };

  const setDueDateBulk = () => {
    if (!bulkDueDate) return;
    selectedDecisionIds.forEach((decisionId) => {
      updateDecision(decisionId, { dueDate: bulkDueDate });
    });
    setSelectedDecisionIds([]);
  };

  const exportCsv = () => {
    const header = [
      "Title",
      "Category",
      "Owner",
      "Status",
      "Due",
      "Confidence",
      "Reversible",
    ];
    const rows = filteredDecisions.map((decision) => [
      asCSV(decision.title),
      asCSV(decision.category),
      asCSV(decision.ownerName || ""),
      asCSV(decision.status),
      asCSV(decision.dueDate || ""),
      asCSV(decision.confidence),
      asCSV(decision.reversible ? "Yes" : "No"),
    ]);

    const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `decisions-${board.name.toLowerCase().replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-sm font-medium">Advanced Filters</p>
        <div className="flex flex-wrap gap-2">
          <Input
            className="w-[250px]"
            placeholder="Search text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All owners</SelectItem>
              {ownerOptions.map((owner) => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Impact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All impacts</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {board.columns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={reversibleFilter} onValueChange={setReversibleFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Reversible" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          <Select value={missingFilter} onValueChange={setMissingFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Missing fields" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Missing: Any</SelectItem>
              <SelectItem value="owner">Missing owner</SelectItem>
              <SelectItem value="criteria">Missing criteria</SelectItem>
              <SelectItem value="evidence">Missing evidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Confidence range</span>
          <Input
            className="w-20"
            type="number"
            min={0}
            max={100}
            value={confidenceMin}
            onChange={(event) => setConfidenceMin(Number(event.target.value || 0))}
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            className="w-20"
            type="number"
            min={0}
            max={100}
            value={confidenceMax}
            onChange={(event) => setConfidenceMax(Number(event.target.value || 100))}
          />
          <span className="ml-4 text-sm text-muted-foreground">Date range</span>
          <Input className="w-[150px]" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <Input className="w-[150px]" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <p className="text-sm font-medium">Bulk Actions</p>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={bulkOwnerId} onValueChange={setBulkOwnerId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Assign owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassign owner</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={selectedDecisionIds.length === 0}
            onClick={assignOwnerBulk}
          >
            Assign owner
          </Button>
          <Input
            className="w-[170px]"
            type="date"
            value={bulkDueDate}
            onChange={(event) => setBulkDueDate(event.target.value)}
          />
          <Button
            variant="outline"
            disabled={selectedDecisionIds.length === 0 || !bulkDueDate}
            onClick={setDueDateBulk}
          >
            Set due date
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            Export CSV
          </Button>
          <Badge variant="secondary">{selectedDecisionIds.length} selected</Badge>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
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
            {filteredDecisions.map((decision) => {
              const quality = checkDecisionQuality(decision, board);
              const missing = quality.checks.filter((item) => !item.passed);
              const overdue = !!decision.dueDate && new Date(decision.dueDate) < new Date();

              return (
                <TableRow key={decision.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedDecisionIds.includes(decision.id)}
                      onCheckedChange={(value) => toggleSelected(decision.id, Boolean(value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/boards/${boardId}/decisions/${decision.id}`} className="font-medium hover:underline">
                      {decision.title}
                    </Link>
                  </TableCell>
                  <TableCell>{decision.category}</TableCell>
                  <TableCell>{decision.ownerName || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{decision.status}</Badge>
                  </TableCell>
                  <TableCell className={cn(overdue && "font-medium text-destructive")}>
                    {decision.dueDate || "-"}
                  </TableCell>
                  <TableCell>{decision.confidence}%</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {quality.score}/100
                      {missing.length > 0 && (
                        <span className="ml-1 text-muted-foreground">
                          ({missing.map((item) => item.label).join(", ")})
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
                          <Link href={`/boards/${boardId}/decisions/${decision.id}`} className="flex items-center gap-2">
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
