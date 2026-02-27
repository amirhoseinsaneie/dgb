"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FileStack,
  FileText,
  Filter,
  Search as SearchIcon,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  Draft:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  "Ready for Review":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  Review:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  Approved:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  Implementing:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
  Done: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  Reversed:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
};

export default function SearchPage() {
  const { decisions, templates } = useApp();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [missingFilter, setMissingFilter] = useState("all");

  const categories = useMemo(
    () => [
      ...new Set(
        decisions.map((decision) => decision.category).filter(Boolean),
      ),
    ],
    [decisions],
  );
  const owners = useMemo(
    () => [
      ...new Set(
        decisions
          .map((decision) => decision.ownerName)
          .filter((owner): owner is string => Boolean(owner)),
      ),
    ],
    [decisions],
  );

  const activeFilterCount =
    Number(categoryFilter !== "all") +
    Number(statusFilter !== "all") +
    Number(impactFilter !== "all") +
    Number(ownerFilter !== "all") +
    Number(missingFilter !== "all");

  const clearAllFilters = () => {
    setCategoryFilter("all");
    setStatusFilter("all");
    setImpactFilter("all");
    setOwnerFilter("all");
    setMissingFilter("all");
  };

  const filteredDecisions = decisions.filter((decision) => {
    const textMatch =
      !query ||
      decision.title.toLowerCase().includes(query.toLowerCase()) ||
      decision.problemStatement.toLowerCase().includes(query.toLowerCase()) ||
      (decision.ownerName || "").toLowerCase().includes(query.toLowerCase());
    if (!textMatch) return false;
    if (categoryFilter !== "all" && decision.category !== categoryFilter)
      return false;
    if (statusFilter !== "all" && decision.status !== statusFilter)
      return false;
    if (impactFilter !== "all" && decision.impact !== impactFilter)
      return false;
    if (ownerFilter !== "all" && decision.ownerName !== ownerFilter)
      return false;
    if (missingFilter === "owner" && decision.ownerId) return false;
    if (missingFilter === "criteria" && decision.criteria.length > 0)
      return false;
    if (missingFilter === "evidence") {
      if (decision.reversible) return false;
      if (decision.evidenceLinks?.length && decision.keyRisksMitigations)
        return false;
    }
    return true;
  });

  const filteredTemplates = templates.filter((template) =>
    !query ? true : template.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="جستجو"
        subtitle="یافتن تصمیمات، قالب‌ها و محتوای سامانه"
      />

      <div className="relative">
        <SearchIcon className="absolute inset-s-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-14 rounded-2xl border-2 ps-12 text-base shadow-sm transition-all focus:border-primary focus:shadow-md"
          placeholder="عنوان، تگ، مالک و... را جستجو کنید..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute inset-e-3 top-1/2 size-8 -translate-y-1/2"
            onClick={() => setQuery("")}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Filter className="size-3.5" />
          فیلترها
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-8 w-auto min-w-[130px] rounded-full text-xs">
            <SelectValue placeholder="دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-auto min-w-[130px] rounded-full text-xs">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
            <SelectItem value="Draft">پیش‌نویس</SelectItem>
            <SelectItem value="Ready for Review">آماده بررسی</SelectItem>
            <SelectItem value="Review">بررسی</SelectItem>
            <SelectItem value="Approved">تایید شده</SelectItem>
            <SelectItem value="Implementing">در حال پیاده‌سازی</SelectItem>
            <SelectItem value="Done">انجام شده</SelectItem>
            <SelectItem value="Reversed">برگشت خورده</SelectItem>
          </SelectContent>
        </Select>

        <Select value={impactFilter} onValueChange={setImpactFilter}>
          <SelectTrigger className="h-8 w-auto min-w-[100px] rounded-full text-xs">
            <SelectValue placeholder="تاثیر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه تاثیرها</SelectItem>
            <SelectItem value="Low">کم</SelectItem>
            <SelectItem value="Medium">متوسط</SelectItem>
            <SelectItem value="High">زیاد</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="h-8 w-auto min-w-[120px] rounded-full text-xs">
            <SelectValue placeholder="مالک" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه مالکان</SelectItem>
            {owners.map((owner) => (
              <SelectItem key={owner} value={owner}>
                {owner}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={missingFilter} onValueChange={setMissingFilter}>
          <SelectTrigger className="h-8 w-auto min-w-[130px] rounded-full text-xs">
            <SelectValue placeholder="فیلدهای ناقص" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ناقص: هر کدام</SelectItem>
            <SelectItem value="owner">بدون مالک</SelectItem>
            <SelectItem value="criteria">بدون معیار</SelectItem>
            <SelectItem value="evidence">بدون شواهد</SelectItem>
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-full text-xs text-muted-foreground"
            onClick={clearAllFilters}
          >
            <X className="size-3" />
            پاک کردن ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className="space-y-8">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h2 className="font-semibold">تصمیمات</h2>
            <Badge
              variant="secondary"
              className="rounded-full px-2 text-[10px] font-mono"
            >
              {filteredDecisions.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {filteredDecisions.map((decision) => (
              <Link
                key={decision.id}
                href={`/boards/${decision.boardId}/decisions/${decision.id}`}
                className="block"
              >
                <Card className="group transition-all hover:shadow-md hover:border-primary/20">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0 space-y-1.5">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {decision.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            statusColors[decision.status],
                          )}
                        >
                          {decision.status}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {decision.category}
                        </Badge>
                        {decision.ownerName && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary text-[8px] font-bold">
                              {decision.ownerName.charAt(0)}
                            </span>
                            {decision.ownerName}
                          </span>
                        )}
                        {decision.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            سررسید: {decision.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        decision.impact === "High" ? "destructive" : "secondary"
                      }
                      className="shrink-0 text-[10px]"
                    >
                      {decision.impact === "High"
                        ? "بالا"
                        : decision.impact === "Medium"
                          ? "متوسط"
                          : "کم"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {filteredDecisions.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                  <SearchIcon className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">نتیجه‌ای یافت نشد</p>
                  <p className="text-sm text-muted-foreground">
                    عبارت جستجو یا فیلترها را تغییر دهید
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <FileStack className="size-4 text-violet-600" />
            <h2 className="font-semibold">قالب‌ها</h2>
            <Badge
              variant="secondary"
              className="rounded-full px-2 text-[10px] font-mono"
            >
              {filteredTemplates.length}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="group transition-all hover:shadow-md hover:border-primary/20"
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                    <FileStack className="size-4.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {template.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {template.criteria.length} معیار |{" "}
                      {template.requiredFields.length} فیلد اجباری
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredTemplates.length === 0 && (
              <p className="col-span-2 text-sm text-muted-foreground text-center py-8">
                قالبی یافت نشد
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
