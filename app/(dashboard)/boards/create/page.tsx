"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  const [method, setMethod] = useState<Board["method"] | "">("");
  const [availableCategories, setAvailableCategories] = useState<string[]>(defaultCategories);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [newCategory, setNewCategory] = useState("");
  const [qualityGates, setQualityGates] = useState(
    defaultQualityGates.map((gate) => ({ ...gate, enabled: true }))
  );
  const [columns, setColumns] = useState<string[]>(defaultColumns);
  const [newColumn, setNewColumn] = useState("");
  const [highImpactLevel, setHighImpactLevel] = useState<Board["highImpactLevel"]>("High");
  const [confidenceThreshold, setConfidenceThreshold] = useState(60);

  const toggleCategory = (category: string) => {
    setCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const addCustomCategory = () => {
    const candidate = newCategory.trim();
    if (!candidate || availableCategories.includes(candidate)) return;
    setAvailableCategories((current) => [...current, candidate]);
    setCategories((current) => [...current, candidate]);
    setNewCategory("");
  };

  const toggleQualityGate = (id: string) => {
    setQualityGates((current) =>
      current.map((gate) =>
        gate.id === id ? { ...gate, enabled: !gate.enabled } : gate
      )
    );
  };

  const moveColumn = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= columns.length) return;
    const next = [...columns];
    [next[index], next[target]] = [next[target], next[index]];
    setColumns(next);
  };

  const renameColumn = (index: number, value: string) => {
    setColumns((current) =>
      current.map((column, columnIndex) => (columnIndex === index ? value : column))
    );
  };

  const removeColumn = (index: number) => {
    setColumns((current) => current.filter((_, columnIndex) => columnIndex !== index));
  };

  const addColumn = () => {
    const candidate = newColumn.trim();
    if (!candidate || columns.includes(candidate)) return;
    setColumns((current) => [...current, candidate]);
    setNewColumn("");
  };

  const createBoard = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const board: Board = {
      id: crypto.randomUUID(),
      name,
      description: description || undefined,
      method: method || undefined,
      project: name,
      categories,
      qualityGates,
      highImpactLevel,
      confidenceThreshold,
      columns,
      createdAt: now,
      updatedAt: now,
      status: "Active",
    };
    addBoard(board);
    router.push(`/boards/${board.id}`);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
        title="Create Board"
        subtitle="Set board details, decision categories, and quality gates"
        breadcrumbs={[
          { label: "Boards", href: "/boards" },
          { label: "Create", href: "/boards/create" },
        ]}
      />

      <form className="space-y-8" onSubmit={createBoard}>
        <Card>
          <CardHeader>
            <CardTitle>Section A: Board Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Board name *</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={method || "none"} onValueChange={(value) => setMethod(value === "none" ? "" : (value as Board["method"]))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No method</SelectItem>
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
            <CardTitle>Section B: Decision Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableCategories.map((category) => (
              <label key={category} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={categories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                {category}
              </label>
            ))}
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="Add custom category"
              />
              <Button type="button" variant="outline" onClick={addCustomCategory}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Section C: Quality Gates</CardTitle>
            <CardDescription>Required rules before status changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {qualityGates.map((gate) => (
              <label key={gate.id} className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={gate.enabled}
                  onCheckedChange={() => toggleQualityGate(gate.id)}
                />
                <span>{gate.label}</span>
              </label>
            ))}
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>High impact threshold</Label>
                <Select
                  value={highImpactLevel || "High"}
                  onValueChange={(value) => setHighImpactLevel(value as Board["highImpactLevel"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Confidence threshold</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={confidenceThreshold}
                  onChange={(event) => setConfidenceThreshold(Number(event.target.value || 60))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Section D: Default Columns</CardTitle>
            <CardDescription>Editable order and names</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {columns.map((column, index) => (
              <div key={`${column}-${index}`} className="flex items-center gap-2">
                <Input
                  value={column}
                  onChange={(event) => renameColumn(index, event.target.value)}
                />
                <Button type="button" variant="outline" size="icon" onClick={() => moveColumn(index, "up")}>
                  <ArrowUp className="size-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => moveColumn(index, "down")}>
                  <ArrowDown className="size-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={() => removeColumn(index)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={newColumn}
                onChange={(event) => setNewColumn(event.target.value)}
                placeholder="Add column"
              />
              <Button type="button" variant="outline" onClick={addColumn}>
                <Plus className="mr-2 size-4" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button asChild type="button" variant="outline">
            <Link href="/boards">Cancel</Link>
          </Button>
          <Button type="submit">Create Board</Button>
        </div>
      </form>
    </div>
  );
}
