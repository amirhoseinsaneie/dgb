"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
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

export default function SearchPage() {
  const { decisions, templates } = useApp();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [missingFilter, setMissingFilter] = useState("all");

  const categories = useMemo(
    () => [...new Set(decisions.map((decision) => decision.category).filter(Boolean))],
    [decisions]
  );
  const owners = useMemo(
    () => [...new Set(decisions.map((decision) => decision.ownerName).filter(Boolean))],
    [decisions]
  );

  const filteredDecisions = decisions.filter((decision) => {
    const textMatch =
      !query ||
      decision.title.toLowerCase().includes(query.toLowerCase()) ||
      decision.problemStatement.toLowerCase().includes(query.toLowerCase()) ||
      (decision.ownerName || "").toLowerCase().includes(query.toLowerCase());
    if (!textMatch) return false;
    if (categoryFilter !== "all" && decision.category !== categoryFilter) return false;
    if (statusFilter !== "all" && decision.status !== statusFilter) return false;
    if (impactFilter !== "all" && decision.impact !== impactFilter) return false;
    if (ownerFilter !== "all" && decision.ownerName !== ownerFilter) return false;
    if (missingFilter === "owner" && decision.ownerId) return false;
    if (missingFilter === "criteria" && decision.criteria.length > 0) return false;
    if (missingFilter === "evidence") {
      if (decision.reversible) return false;
      if (decision.evidenceLinks?.length && decision.keyRisksMitigations) return false;
    }
    return true;
  });

  const filteredTemplates = templates.filter((template) =>
    !query ? true : template.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader title="جستجو" breadcrumbs={[{ label: "جستجو", href: "/search" }]} />

      <div className="relative">
        <SearchIcon className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-12 ps-10 text-base"
          placeholder="عنوان، تگ، مالک و... را جستجو کنید..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[170px]">
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
          <SelectTrigger className="w-[170px]">
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
          <SelectTrigger className="w-[130px]">
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
          <SelectTrigger className="w-[150px]">
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
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="فیلدهای ناقص" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ناقص: هر کدام</SelectItem>
            <SelectItem value="owner">بدون مالک</SelectItem>
            <SelectItem value="criteria">بدون معیار</SelectItem>
            <SelectItem value="evidence">بدون شواهد</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 font-semibold">تصمیمات</h2>
          <div className="space-y-2">
            {filteredDecisions.map((decision) => (
              <Card key={decision.id}>
                <CardContent className="space-y-2 p-4">
                  <Link href={`/boards/${decision.boardId}/decisions/${decision.id}`} className="font-medium hover:underline">
                    {decision.title}
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{decision.status}</Badge>
                    <Badge variant="secondary">{decision.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      سررسید: {decision.dueDate || "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredDecisions.length === 0 && (
              <p className="text-sm text-muted-foreground">نتیجه‌ای یافت نشد</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">قالب‌ها</h2>
          <div className="space-y-2">
            {filteredTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-4">
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">{template.criteria.length} معیار</p>
                </CardContent>
              </Card>
            ))}
            {filteredTemplates.length === 0 && (
              <p className="text-sm text-muted-foreground">نتیجه‌ای یافت نشد</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
