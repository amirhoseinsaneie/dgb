"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, Download, Filter, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { checkDecisionQuality } from "@/lib/quality-gates";
import { useApp, DEFAULT_COLUMNS } from "@/lib/store";
import { cn, toJalali } from "@/lib/utils";

const statusColors: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  "Ready for Review": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  Review: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  Approved: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  Implementing: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
  Done: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  Reversed: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
};

export default function DecisionsListPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, getBoardDecisions, deleteDecision, updateDecision, config, isLoading } = useApp();

  const board = getBoard(boardId);
  const decisions = getBoardDecisions(boardId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState<
    "all" | "Low" | "Medium" | "High"
  >("all");
  const [qualityFilter, setQualityFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const ownerOptions = useMemo(() => {
    const names = new Set<string>();
    for (const decision of decisions) {
      if (decision.ownerName) {
        names.add(decision.ownerName);
      }
    }
    return Array.from(names);
  }, [decisions]);

  const activeAdvancedFilters =
    Number(ownerFilter !== "all") +
    Number(impactFilter !== "all") +
    Number(qualityFilter !== "all") +
    Number(onlyOverdue);

  const filteredDecisions = useMemo(() => {
    if (!board) return [];
    const now = new Date();

    return decisions.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (search && !d.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (ownerFilter !== "all") {
        const ownerName = d.ownerName || "unassigned";
        if (ownerName !== ownerFilter) return false;
      }
      if (impactFilter !== "all" && d.impact !== impactFilter) return false;
      if (qualityFilter !== "all") {
        const qualityScore = checkDecisionQuality(d, board).score;
        if (qualityFilter === "high" && qualityScore < 80) return false;
        if (
          qualityFilter === "medium" &&
          (qualityScore < 50 || qualityScore >= 80)
        )
          return false;
        if (qualityFilter === "low" && qualityScore >= 50) return false;
      }
      if (onlyOverdue) {
        if (!d.dueDate) return false;
        const dueDate = new Date(d.dueDate);
        if (Number.isNaN(dueDate.getTime())) return false;
        if (dueDate >= now) return false;
        if (["Done", "Reversed"].includes(d.status)) return false;
      }
      return true;
    });
  }, [
    board,
    decisions,
    impactFilter,
    onlyOverdue,
    ownerFilter,
    qualityFilter,
    search,
    statusFilter,
  ]);

  const visibleSelectedCount = useMemo(() => {
    const visibleIds = new Set(
      filteredDecisions.map((decision) => decision.id)
    );
    return selectedIds.filter((id) => visibleIds.has(id)).length;
  }, [filteredDecisions, selectedIds]);

  const isAllVisibleSelected =
    filteredDecisions.length > 0 &&
    visibleSelectedCount === filteredDecisions.length;

  const toggleSelectAll = () => {
    const visibleIds = new Set(
      filteredDecisions.map((decision) => decision.id)
    );

    if (isAllVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.has(id))
      );
    } else {
      setSelectedIds((current) =>
        Array.from(
          new Set([...current, ...filteredDecisions.map((d) => d.id)])
        )
      );
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const clearAdvancedFilters = () => {
    setOwnerFilter("all");
    setImpactFilter("all");
    setQualityFilter("all");
    setOnlyOverdue(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <AlertTriangle className="size-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">بورد یافت نشد</p>
      </div>
    );
  }

  if (decisions.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="تصمیمات"
          subtitle={`مشاهده و مدیریت تمام تصمیمات در ${board.name}`}
          breadcrumbs={[
            { label: "بوردها", href: "/boards" },
            { label: board.name, href: `/boards/${boardId}` },
            { label: "تصمیمات", href: `/boards/${boardId}/decisions` },
          ]}
          actions={
            <Button asChild size="sm" className="shadow-sm">
              <Link href={`/boards/${boardId}/decisions/new`}>
                <Plus className="me-2 size-4" />
                تصمیم جدید
              </Link>
            </Button>
          }
        />

        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/20">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Search className="size-7 text-primary" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-lg font-semibold">هنوز تصمیمی ثبت نشده</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              با ایجاد اولین تصمیم، لیست تصمیمات این بورد را مدیریت کنید.
            </p>
          </div>
          <Button asChild size="sm" className="mt-2 shadow-sm">
            <Link href={`/boards/${boardId}/decisions/new`}>
              <Plus className="me-2 size-4" />
              ایجاد اولین تصمیم
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="تصمیمات"
        subtitle={`مشاهده و مدیریت تمام تصمیمات در ${board.name}`}
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "تصمیمات", href: `/boards/${boardId}/decisions` },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const csv = [
                  ["عنوان", "وضعیت", "مالک", "تاثیر", "سررسید"].join(","),
                  ...filteredDecisions.map((d) =>
                    [d.title, d.status, d.ownerName || "-", d.impact, d.dueDate || "-"].join(",")
                  ),
                ].join("\n");
                const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `decisions-${board.name}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="me-2 size-4" />
              خروجی
            </Button>
            <Button asChild size="sm" className="shadow-sm">
              <Link href={`/boards/${boardId}/decisions/new`}>
                <Plus className="me-2 size-4" />
                تصمیم جدید
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="جستجو در تصمیمات..."
              className="h-9 ps-9 bg-muted/50 border-transparent hover:border-border transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              {(board.columns.length ? board.columns : [...DEFAULT_COLUMNS]).map((col) => (
                <SelectItem key={col} value={col}>
                  {config.defaultColumnLabels[col] || col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Filter className="size-3.5" />
                فیلترهای بیشتر
                {activeAdvancedFilters > 0 && (
                  <Badge className="size-5 rounded-full p-0 text-[10px] justify-center">
                    {activeAdvancedFilters}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">مالک</p>
                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="همه مالک‌ها" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه مالک‌ها</SelectItem>
                    <SelectItem value="unassigned">بدون مالک</SelectItem>
                    {ownerOptions.map((ownerName) => (
                      <SelectItem key={ownerName} value={ownerName}>
                        {ownerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">تاثیر</p>
                <Select
                  value={impactFilter}
                  onValueChange={(value) =>
                    setImpactFilter(
                      value as "all" | "Low" | "Medium" | "High"
                    )
                  }
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="همه سطوح تاثیر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه سطوح تاثیر</SelectItem>
                    <SelectItem value="High">بالا</SelectItem>
                    <SelectItem value="Medium">متوسط</SelectItem>
                    <SelectItem value="Low">کم</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">کیفیت</p>
                <Select
                  value={qualityFilter}
                  onValueChange={(value) =>
                    setQualityFilter(
                      value as "all" | "high" | "medium" | "low"
                    )
                  }
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="همه سطوح کیفیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه سطوح کیفیت</SelectItem>
                    <SelectItem value="high">خوب (80% به بالا)</SelectItem>
                    <SelectItem value="medium">
                      متوسط (50% تا 79%)
                    </SelectItem>
                    <SelectItem value="low">ضعیف (کمتر از 50%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/50 transition-colors">
                <span>فقط تصمیمات سررسید گذشته</span>
                <Checkbox
                  checked={onlyOverdue}
                  onCheckedChange={(checked) =>
                    setOnlyOverdue(checked === true)
                  }
                />
              </label>

              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={clearAdvancedFilters}
                disabled={activeAdvancedFilters === 0}
              >
                پاک کردن فیلترها
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        {visibleSelectedCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl border bg-primary/5 px-4 py-2 text-sm font-medium animate-fade-in">
            <span className="text-primary">{visibleSelectedCount}</span>
            <span>مورد انتخاب شده</span>
            <div className="ms-3 flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => {
                  for (const id of selectedIds) {
                    void updateDecision(id, { status: "Done" });
                  }
                  setSelectedIds([]);
                }}
              >
                بایگانی
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs text-destructive"
                onClick={() => {
                  for (const id of selectedIds) {
                    void deleteDecision(id);
                  }
                  setSelectedIds([]);
                }}
              >
                حذف
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllVisibleSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>عنوان</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>مالک</TableHead>
              <TableHead>تاثیر</TableHead>
              <TableHead>کیفیت</TableHead>
              <TableHead>سررسید</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDecisions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="size-8 text-muted-foreground/40" />
                    <p>تصمیمی یافت نشد.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filteredDecisions.map((decision) => {
              const quality = checkDecisionQuality(decision, board);
              return (
                <TableRow key={decision.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(decision.id)}
                      onCheckedChange={() => toggleSelect(decision.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/boards/${boardId}/decisions/${decision.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {decision.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        statusColors[decision.status]
                      )}
                    >
                      {config.defaultColumnLabels[decision.status] ||
                        decision.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {decision.ownerName ? (
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {decision.ownerName.charAt(0)}
                        </div>
                        <span className="text-sm">{decision.ownerName}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        decision.impact === "High"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {decision.impact === "High"
                        ? "بالا"
                        : decision.impact === "Medium"
                          ? "متوسط"
                          : "کم"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-14 rounded-full bg-muted overflow-hidden">
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
                      <span
                        className={cn(
                          "text-xs font-semibold tabular-nums",
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
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {toJalali(decision.dueDate, "-")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="size-4" />
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
                          className="text-destructive"
                          onClick={() => void deleteDecision(decision.id)}
                        >
                          <Trash2 className="size-4 me-2" />
                          حذف
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
