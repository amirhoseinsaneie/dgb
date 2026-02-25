"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, Filter, MoreHorizontal, Plus, Search } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { defaultColumnLabels } from "@/lib/mock-data";
import { checkDecisionQuality } from "@/lib/quality-gates";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function DecisionsListPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, getBoardDecisions } = useApp();

  const board = getBoard(boardId);
  const decisions = getBoardDecisions(boardId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState<"all" | "Low" | "Medium" | "High">("all");
  const [qualityFilter, setQualityFilter] = useState<"all" | "high" | "medium" | "low">("all");
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
      if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (ownerFilter !== "all") {
        const ownerName = d.ownerName || "unassigned";
        if (ownerName !== ownerFilter) return false;
      }
      if (impactFilter !== "all" && d.impact !== impactFilter) return false;
      if (qualityFilter !== "all") {
        const qualityScore = checkDecisionQuality(d, board).score;
        if (qualityFilter === "high" && qualityScore < 80) return false;
        if (qualityFilter === "medium" && (qualityScore < 50 || qualityScore >= 80)) return false;
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
  }, [board, decisions, impactFilter, onlyOverdue, ownerFilter, qualityFilter, search, statusFilter]);

  const visibleSelectedCount = useMemo(() => {
    const visibleIds = new Set(filteredDecisions.map((decision) => decision.id));
    return selectedIds.filter((id) => visibleIds.has(id)).length;
  }, [filteredDecisions, selectedIds]);

  const isAllVisibleSelected =
    filteredDecisions.length > 0 && visibleSelectedCount === filteredDecisions.length;

  const toggleSelectAll = () => {
    const visibleIds = new Set(filteredDecisions.map((decision) => decision.id));

    if (isAllVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !visibleIds.has(id)));
    } else {
      setSelectedIds((current) => Array.from(new Set([...current, ...filteredDecisions.map((d) => d.id)])));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const clearAdvancedFilters = () => {
    setOwnerFilter("all");
    setImpactFilter("all");
    setQualityFilter("all");
    setOnlyOverdue(false);
  };

  if (!board) return null;

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
            <Button variant="outline" size="sm">
              <Download className="me-2 size-4" />
              خروجی
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="جستجو در تصمیمات..."
              className="h-9 ps-9"
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
              {board.columns.map((col) => (
                <SelectItem key={col} value={col}>
                  {defaultColumnLabels[col] || col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="me-2 size-4" />
                فیلترهای بیشتر
                {activeAdvancedFilters > 0 && (
                  <Badge variant="secondary" className="ms-2 px-1.5 text-xs">
                    {activeAdvancedFilters}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 space-y-3">
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
                  onValueChange={(value) => setImpactFilter(value as "all" | "Low" | "Medium" | "High")}
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
                  onValueChange={(value) => setQualityFilter(value as "all" | "high" | "medium" | "low")}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="همه سطوح کیفیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه سطوح کیفیت</SelectItem>
                    <SelectItem value="high">خوب (80% به بالا)</SelectItem>
                    <SelectItem value="medium">متوسط (50% تا 79%)</SelectItem>
                    <SelectItem value="low">ضعیف (کمتر از 50%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>فقط تصمیمات سررسید گذشته</span>
                <Checkbox
                  checked={onlyOverdue}
                  onCheckedChange={(checked) => setOnlyOverdue(checked === true)}
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
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1 text-sm font-medium">
            {visibleSelectedCount} مورد انتخاب شده
            <div className="ms-4 flex gap-2">
              <Button variant="ghost" size="sm" className="h-7 px-2">تغییر وضعیت</Button>
              <Button variant="ghost" size="sm" className="h-7 px-2">بایگانی</Button>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive">حذف</Button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  تصمیمی یافت نشد.
                </TableCell>
              </TableRow>
            )}
            {filteredDecisions.map((decision) => {
              const quality = checkDecisionQuality(decision, board);
              return (
                <TableRow key={decision.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(decision.id)}
                      onCheckedChange={() => toggleSelect(decision.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/boards/${boardId}/decisions/${decision.id}`}
                      className="font-medium hover:underline"
                    >
                      {decision.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{defaultColumnLabels[decision.status] || decision.status}</Badge>
                  </TableCell>
                  <TableCell>{decision.ownerName || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={decision.impact === "High" ? "destructive" : "secondary"}>
                      {decision.impact === "High" ? "بالا" : decision.impact === "Medium" ? "متوسط" : "کم"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-12 rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            quality.score >= 80 ? "bg-green-600" : quality.score >= 50 ? "bg-amber-600" : "bg-destructive"
                          )}
                          style={{ width: `${quality.score}%` }}
                        />
                      </div>
                      <span className="text-xs">{quality.score}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{decision.dueDate || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/boards/${boardId}/decisions/${decision.id}`}>مشاهده</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>ویرایش</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">حذف</DropdownMenuItem>
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
