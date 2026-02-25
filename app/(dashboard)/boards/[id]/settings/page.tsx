"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/store";
import type { Board } from "@/lib/types";

export default function BoardSettingsPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, updateBoard } = useApp();
  const board = getBoard(boardId);

  const [columns, setColumns] = useState<string[]>(board?.columns || []);
  const [newColumn, setNewColumn] = useState("");
  const [qualityGates, setQualityGates] = useState(board?.qualityGates || []);
  const [categories, setCategories] = useState<string[]>(board?.categories || []);
  const [newCategory, setNewCategory] = useState("");
  const [highImpactLevel, setHighImpactLevel] = useState<Board["highImpactLevel"]>(board?.highImpactLevel || "High");
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(board?.confidenceThreshold ?? 60);

  const hasChanges = useMemo(() => {
    if (!board) return false;
    return JSON.stringify(columns) !== JSON.stringify(board.columns) ||
      JSON.stringify(qualityGates) !== JSON.stringify(board.qualityGates) ||
      JSON.stringify(categories) !== JSON.stringify(board.categories) ||
      highImpactLevel !== board.highImpactLevel ||
      confidenceThreshold !== (board.confidenceThreshold ?? 60);
  }, [board, categories, columns, confidenceThreshold, highImpactLevel, qualityGates]);

  if (!board) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

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

  const toggleGate = (id: string) => {
    setQualityGates((current) =>
      current.map((gate) =>
        gate.id === id ? { ...gate, enabled: !gate.enabled } : gate
      )
    );
  };

  const addCategory = () => {
    const candidate = newCategory.trim();
    if (!candidate || categories.includes(candidate)) return;
    setCategories((current) => [...current, candidate]);
    setNewCategory("");
  };

  const removeCategory = (category: string) => {
    setCategories((current) => current.filter((item) => item !== category));
  };

  const saveChanges = () => {
    updateBoard(boardId, {
      columns,
      categories,
      qualityGates,
      highImpactLevel,
      confidenceThreshold,
    });
  };

  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
        title="Board Settings"
        breadcrumbs={[
          { label: "Boards", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "Settings", href: `/boards/${boardId}/settings` },
        ]}
        actions={
          <Button onClick={saveChanges} disabled={!hasChanges}>
            Save Changes
          </Button>
        }
      />

      <Tabs defaultValue="columns">
        <TabsList>
          <TabsTrigger value="columns">Columns</TabsTrigger>
          <TabsTrigger value="gates">Quality Gates</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="columns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Columns</CardTitle>
              <CardDescription>Reorder, rename, add, or remove</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {columns.map((column, index) => (
                <div key={`${column}-${index}`} className="flex items-center gap-2">
                  <Input value={column} onChange={(event) => renameColumn(index, event.target.value)} />
                  <Button variant="outline" size="icon" onClick={() => moveColumn(index, "up")}>
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => moveColumn(index, "down")}>
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => removeColumn(index)}>
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
                <Button variant="outline" onClick={addColumn}>
                  <Plus className="mr-2 size-4" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Gates</CardTitle>
              <CardDescription>Set required rules and thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {qualityGates.map((gate) => (
                <label key={gate.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={gate.enabled} onCheckedChange={() => toggleGate(gate.id)} />
                  {gate.label}
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
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage decision categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center justify-between rounded border p-2">
                  <span>{category}</span>
                  <Button variant="outline" size="sm" onClick={() => removeCategory(category)}>
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Input
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  placeholder="Add category"
                />
                <Button variant="outline" onClick={addCategory}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Admin / Editor / Viewer</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Role model is available as UI placeholder in MVP.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
