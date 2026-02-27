"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Archive,
  Copy,
  ExternalLink,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import { cn } from "@/lib/utils";

export default function BoardsListPage() {
  const { boards, getBoardDecisions, addBoard, updateBoard, deleteBoard } = useApp();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "name">("updated");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Active" | "Archived"
  >("all");

  const filteredBoards = boards
    .filter((board) => {
      if (statusFilter !== "all" && board.status !== statusFilter) return false;
      if (search && !board.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="بوردها"
        breadcrumbs={[{ label: "بوردها", href: "/boards" }]}
        actions={
          <Button asChild className="shadow-sm">
            <Link href="/boards/create" className="gap-2">
              <Plus className="size-4" />
              ایجاد بورد
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="جستجو..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-xs"
        />
        <Select
          value={sort}
          onValueChange={(value) => setSort(value as "updated" | "name")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="مرتب‌سازی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">آخرین بروزرسانی</SelectItem>
            <SelectItem value="name">نام</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as "all" | "Active" | "Archived")
          }
        >
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
            <EmptyDescription>
              برای شروع یک بورد ایجاد کنید.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/boards/create">ایجاد بورد</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
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
                  (decision) =>
                    !["Done", "Reversed"].includes(decision.status)
                ).length;
                const overdueCount = boardDecisions.filter((decision) => {
                  if (!decision.dueDate) return false;
                  return (
                    new Date(decision.dueDate) < new Date() &&
                    !["Done", "Reversed"].includes(decision.status)
                  );
                }).length;

                return (
                  <TableRow key={board.id} className="group">
                    <TableCell>
                      <Link
                        href={`/boards/${board.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          <FolderOpen className="size-3.5" />
                        </div>
                        <span className="font-medium group-hover:text-primary transition-colors">
                          {board.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {board.project || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {openCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          overdueCount > 0 ? "destructive" : "secondary"
                        }
                        className="font-mono"
                      >
                        {overdueCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(board.updatedAt), {
                        addSuffix: true,
                        locale: faIR,
                      })}
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
                              href={`/boards/${board.id}`}
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="size-4" />
                              باز کردن
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => {
                              const clone = {
                                ...board,
                                id: crypto.randomUUID(),
                                name: `${board.name} (کپی)`,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              };
                              void addBoard(clone);
                            }}
                          >
                            <Copy className="size-4" />
                            تکثیر
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() =>
                              void updateBoard(board.id, { status: board.status === "Archived" ? "Active" : "Archived" })
                            }
                          >
                            <Archive className="size-4" />
                            {board.status === "Archived" ? "فعال‌سازی" : "بایگانی"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            className="gap-2"
                            onClick={() => void deleteBoard(board.id)}
                          >
                            <Trash2 className="size-4" />
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
      )}
    </div>
  );
}
