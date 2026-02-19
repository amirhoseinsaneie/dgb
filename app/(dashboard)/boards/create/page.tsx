"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  defaultCategories,
  defaultColumns,
  defaultQualityGates,
} from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import type { Board } from "@/lib/types";

export default function CreateBoardPage() {
  const router = useRouter();
  const { addBoard } = useApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<string>("");
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [qualityGates, setQualityGates] = useState(
    defaultQualityGates.map((g) => ({ ...g, enabled: true }))
  );
  const [columns, setColumns] = useState(defaultColumns);

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleQualityGate = (id: string) => {
    setQualityGates((prev) =>
      prev.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const board: Board = {
      id: crypto.randomUUID(),
      name,
      description: description || undefined,
      method: method as Board["method"],
      project: name,
      categories,
      qualityGates: qualityGates.map(({ id, label, description: desc, enabled }) => ({
        id,
        label,
        description: desc,
        enabled,
      })),
      columns,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Active",
    };
    addBoard(board);
    router.push(`/boards/${board.id}`);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title="Create Board"
        subtitle="Specify name, roles, and decision quality rules"
        breadcrumbs={[
          { label: "Boards", href: "/boards" },
          { label: "Create", href: "/boards/create" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Board Info</CardTitle>
            <CardDescription>Basic board information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Board name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Project X"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Board description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Method (optional)</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scrum">Scrum</SelectItem>
                  <SelectItem value="Kanban">Kanban</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision Categories</CardTitle>
            <CardDescription>Decision type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {defaultCategories.map((cat) => (
              <div key={cat} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat}`}
                  checked={categories.includes(cat)}
                  onCheckedChange={() => toggleCategory(cat)}
                />
                <Label htmlFor={`cat-${cat}`} className="font-normal cursor-pointer">
                  {cat}
                </Label>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm">
              Add custom category
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Gates</CardTitle>
            <CardDescription>Required rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {qualityGates.map((gate) => (
              <div key={gate.id} className="flex items-center gap-2">
                <Checkbox
                  id={`gate-${gate.id}`}
                  checked={gate.enabled}
                  onCheckedChange={() => toggleQualityGate(gate.id)}
                />
                <Label htmlFor={`gate-${gate.id}`} className="font-normal cursor-pointer">
                  {gate.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default Columns</CardTitle>
            <CardDescription>Kanban board columns (editable)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {columns.join(" → ")}
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" asChild>
            <Link href="/boards">Cancel</Link>
          </Button>
          <Button type="submit">Create Board</Button>
        </div>
      </form>
    </div>
  );
}
