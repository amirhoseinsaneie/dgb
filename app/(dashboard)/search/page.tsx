"use client";

import { useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [impactFilter, setImpactFilter] = useState<string>("all");

  const filteredDecisions = decisions.filter((d) => {
    const matchQuery =
      !query ||
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.problemStatement?.toLowerCase().includes(query.toLowerCase()) ||
      d.ownerName?.toLowerCase().includes(query.toLowerCase());
    const matchCategory = categoryFilter === "all" || d.category === categoryFilter;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchImpact = impactFilter === "all" || d.impact === impactFilter;
    return matchQuery && matchCategory && matchStatus && matchImpact;
  });

  const filteredTemplates = templates.filter(
    (t) => !query || t.name.toLowerCase().includes(query.toLowerCase())
  );

  const categories = [...new Set(decisions.map((d) => d.category).filter(Boolean))];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Search"
        breadcrumbs={[{ label: "Search", href: "/search" }]}
      />

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search titles, tags, owners…"
          className="pl-10 h-12 text-base"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c!}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Ready for Review">Ready for Review</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
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
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="font-semibold mb-4">Decisions</h2>
          <div className="space-y-2">
            {filteredDecisions.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <Link
                    href={`/boards/${d.boardId}/decisions/${d.id}`}
                    className="font-medium hover:underline block"
                  >
                    {d.title}
                  </Link>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{d.status}</Badge>
                    <Badge variant="secondary">{d.category}</Badge>
                    <span className="text-muted-foreground text-sm">
                      Due: {d.dueDate || "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredDecisions.length === 0 && (
              <p className="text-muted-foreground text-sm">No results</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-4">Templates</h2>
          <div className="space-y-2">
            {filteredTemplates.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {t.criteria.length} criteria
                  </p>
                </CardContent>
              </Card>
            ))}
            {filteredTemplates.length === 0 && (
              <p className="text-muted-foreground text-sm">No results</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
