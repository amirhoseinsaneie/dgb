"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, Copy, ExternalLink, MoreHorizontal, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
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
import { useApp } from "@/lib/store";

export default function BoardsListPage() {
  const { boards, getBoardDecisions } = useApp();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "name">("updated");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Archived">("all");

  const filteredBoards = boards
    .filter((board) => {
      if (statusFilter !== "all" && board.status !== statusFilter) return false;
      if (search && !board.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="بوردها"
        breadcrumbs={[{ label: "بوردها", href: "/boards" }]}
        actions={
          <Button asChild>
            <Link href="/boards/create" className="gap-2">
              <Plus className="size-4" />
              ایجاد بورد
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="جستجو..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-xs"
        />
        <Select value={sort} onValueChange={(value) => setSort(value as "updated" | "name")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="مرتب‌سازی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">آخرین بروزرسانی</SelectItem>
            <SelectItem value="name">نام</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "Active" | "Archived")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="Active">فعال</SelectItem>
            <SelectItem value="Archived">بایگانی‌شده</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredBoards.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" />
            <EmptyTitle>هنوز بوردی ایجاد نشده است</EmptyTitle>
            <EmptyDescription>برای شروع یک بورد ایجاد کنید.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/boards/create">ایجاد بورد</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام بورد</TableHead>
                <TableHead>پروژه</TableHead>
                <TableHead>تصمیمات باز</TableHead>
                <TableHead>عقب‌افتاده</TableHead>
                <TableHead>آخرین بروزرسانی</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBoards.map((board) => {
                const boardDecisions = getBoardDecisions(board.id);
                const openCount = boardDecisions.filter(
                  (decision) => !["Done", "Reversed"].includes(decision.status)
                ).length;
                const overdueCount = boardDecisions.filter((decision) => {
                  if (!decision.dueDate) return false;
                  return (
                    new Date(decision.dueDate) < new Date() &&
                    !["Done", "Reversed"].includes(decision.status)
                  );
                }).length;

                return (
                  <TableRow key={board.id}>
                    <TableCell>
                      <Link href={`/boards/${board.id}`} className="font-medium hover:underline">
                        {board.name}
                      </Link>
                    </TableCell>
                    <TableCell>{board.project || "-"}</TableCell>
                    <TableCell>{openCount}</TableCell>
                    <TableCell>{overdueCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true, locale: faIR })}
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
                            <Link href={`/boards/${board.id}`} className="flex items-center gap-2">
                              <ExternalLink className="size-4" />
                              باز کردن
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Copy className="size-4" />
                            تکثیر
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" className="gap-2">
                            <Archive className="size-4" />
                            بایگانی
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
      )}
    </div>
  );
}
