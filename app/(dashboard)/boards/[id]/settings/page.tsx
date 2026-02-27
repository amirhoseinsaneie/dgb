"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Columns,
  FolderCog,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp, DEFAULT_COLUMNS, DEFAULT_COLUMN_LABELS } from "@/lib/store";

export default function BoardSettingsPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, updateBoard } = useApp();
  const board = getBoard(boardId);

  const [name, setName] = useState(board?.name || "");
  const [project, setProject] = useState(board?.project || "");
  const [categories, setCategories] = useState(board?.categories || []);
  const [newCategory, setNewCategory] = useState("");
  const [columns, setColumns] = useState(board?.columns || [...DEFAULT_COLUMNS]);
  const [newColumn, setNewColumn] = useState("");

  useEffect(() => {
    if (board) {
      setName(board.name);
      setProject(board.project || "");
      setCategories(board.categories);
      setColumns(board.columns?.length ? board.columns : [...DEFAULT_COLUMNS]);
    }
  }, [board?.id]);

  if (!board) return null;

  const saveGeneral = () => {
    void updateBoard(boardId, { name, project });
  };

  const addCategory = () => {
    if (!newCategory.trim() || categories.includes(newCategory.trim())) return;
    setCategories((current) => [...current, newCategory.trim()]);
    setNewCategory("");
  };

  const removeCategory = (cat: string) => {
    setCategories((current) => current.filter((c) => c !== cat));
  };

  const saveCategories = () => {
    void updateBoard(boardId, { categories });
  };

  const addColumn = () => {
    const trimmed = newColumn.trim();
    if (!trimmed || columns.includes(trimmed)) return;
    setColumns((current) => [...current, trimmed]);
    setNewColumn("");
  };

  const removeColumn = (col: string) => {
    setColumns((current) => current.filter((c) => c !== col));
  };

  const saveColumns = () => {
    void updateBoard(boardId, { columns });
  };

  const restoreDefaultColumns = () => {
    setColumns([...DEFAULT_COLUMNS]);
  };

  const tabItems = [
    { value: "general", label: "عمومی", icon: Settings },
    { value: "columns", label: "ستون‌ها", icon: Columns },
    { value: "categories", label: "دسته‌بندی‌ها", icon: Tag },
    { value: "roles", label: "نقش‌ها", icon: Users },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`تنظیمات: ${board.name}`}
        subtitle="پیکربندی بورد و دسته‌بندی‌ها"
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "تنظیمات", href: `/boards/${boardId}/settings` },
        ]}
      />

      <Tabs defaultValue="general">
        <TabsList className="w-full justify-start rounded-xl bg-muted/50 p-1">
          {tabItems.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-2 data-[state=active]:shadow-sm"
            >
              <tab.icon className="size-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                  <FolderCog className="size-4.5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">اطلاعات پایه</CardTitle>
                  <CardDescription>
                    نام و پروژه مرتبط با بورد
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>نام بورد</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="transition-shadow focus:shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>پروژه</Label>
                <Input
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="transition-shadow focus:shadow-sm"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={saveGeneral} className="gap-2 shadow-sm">
                  <Save className="size-4" />
                  ذخیره تغییرات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="columns" className="mt-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10">
                    <Columns className="size-4.5 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">ستون‌های کانبان</CardTitle>
                    <CardDescription>مراحل گردش کار تصمیمات در این بورد</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  onClick={restoreDefaultColumns}
                >
                  <RotateCcw className="size-3.5" />
                  بازگردانی پیش‌فرض
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-2">
                {columns.map((col, index) => (
                  <div
                    key={col}
                    className="flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-6 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">{col}</span>
                      {DEFAULT_COLUMN_LABELS[col] && (
                        <span className="text-xs text-muted-foreground">({DEFAULT_COLUMN_LABELS[col]})</span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeColumn(col)}
                      disabled={columns.length <= 1}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="نام ستون جدید (مثلاً: Blocked)"
                  value={newColumn}
                  onChange={(e) => setNewColumn(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addColumn()}
                  className="transition-shadow focus:shadow-sm"
                />
                <Button variant="outline" onClick={addColumn}>
                  <Plus className="me-2 size-4" />
                  افزودن
                </Button>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveColumns} className="gap-2 shadow-sm">
                  <Save className="size-4" />
                  ذخیره ستون‌ها
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10">
                  <Tag className="size-4.5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-base">دسته‌بندی‌ها</CardTitle>
                  <CardDescription>
                    مدیریت دسته‌بندی‌های تصمیمات بورد
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="gap-1.5 py-1.5 pe-1.5 ps-3 text-sm"
                  >
                    {cat}
                    <button
                      type="button"
                      title="حذف دسته‌بندی"
                      onClick={() => removeCategory(cat)}
                      className="flex size-5 items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="نام دسته‌بندی جدید"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  className="transition-shadow focus:shadow-sm"
                />
                <Button variant="outline" onClick={addCategory}>
                  <Plus className="me-2 size-4" />
                  افزودن
                </Button>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveCategories} className="gap-2 shadow-sm">
                  <Save className="size-4" />
                  ذخیره دسته‌بندی‌ها
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10">
                  <Users className="size-4.5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">نقش‌ها</CardTitle>
                  <CardDescription>
                    نقش‌های تعریف‌شده برای این بورد
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {(board.roles ?? []).map((role) => (
                  <Badge
                    key={role}
                    variant="outline"
                    className="px-3 py-1.5 text-sm"
                  >
                    {role}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                مدیریت نقش‌ها به زودی اضافه خواهد شد.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
