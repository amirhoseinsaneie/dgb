"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Columns3,
  FolderCog,
  Grid3X3,
  Plus,
  Save,
  Settings,
  Shield,
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
import { useApp } from "@/lib/store";



export default function BoardSettingsPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, updateBoard, config } = useApp();
  const board = getBoard(boardId);

  const [name, setName] = useState(board?.name || "");
  const [project, setProject] = useState(board?.project || "");
  const [columns, setColumns] = useState(board?.columns || []);
  const [qualityGates, setQualityGates] = useState(board?.qualityGates || []);
  const [categories, setCategories] = useState(board?.categories || []);
  const [newCategory, setNewCategory] = useState("");

  if (!board) return null;

  const saveGeneral = () => {
    void updateBoard(boardId, { name, project });
  };

  const updateGate = (index: number, label: string) => {
    setQualityGates((current) =>
      current.map((gate, i) => (i === index ? { ...gate, label } : gate))
    );
  };

  const addGate = () => {
    setQualityGates((current) => [
      ...current,
      { id: crypto.randomUUID(), label: "", enabled: true },
    ]);
  };

  const saveGates = () => {
    void updateBoard(boardId, {
      qualityGates: qualityGates.filter((g) => g.label.trim()),
    });
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

  const tabItems = [
    { value: "general", label: "عمومی", icon: Settings },
    { value: "columns", label: "ستون‌ها", icon: Columns3 },
    { value: "quality", label: "دروازه‌های کیفیت", icon: Shield },
    { value: "categories", label: "دسته‌بندی‌ها", icon: Tag },
    { value: "roles", label: "نقش‌ها", icon: Users },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`تنظیمات: ${board.name}`}
        subtitle="پیکربندی بورد، ستون‌ها، دروازه‌های کیفیت و دسته‌بندی‌ها"
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
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10">
                  <Grid3X3 className="size-4.5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-base">مدیریت ستون‌ها</CardTitle>
                  <CardDescription>
                    تعریف وضعیت‌های چرخه عمر تصمیم
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {columns.map((col, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3"
                >
                  <Badge
                    variant="secondary"
                    className="size-7 shrink-0 justify-center rounded-lg font-mono text-xs"
                  >
                    {index + 1}
                  </Badge>
                  <span className="flex-1 text-sm font-medium">
                    {config.defaultColumnLabels[col] || col}
                  </span>
                  <Button variant="ghost" size="icon" className="size-8" disabled>
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" disabled className="border-dashed gap-2">
                <Plus className="size-4" />
                افزودن ستون (به زودی)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="mt-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Shield className="size-4.5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    دروازه‌های کیفیت بورد
                  </CardTitle>
                  <CardDescription>
                    بررسی‌های استاندارد برای این بورد
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {qualityGates.map((gate, index) => (
                <div
                  key={gate.id}
                  className="group flex items-center gap-2 rounded-xl border p-2.5 transition-all hover:shadow-sm"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                  <Input
                    value={gate.label}
                    onChange={(e) => updateGate(index, e.target.value)}
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                    placeholder="توضیح دروازه"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() =>
                      setQualityGates(
                        qualityGates.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addGate}
                className="border-dashed gap-2"
              >
                <Plus className="size-4" />
                افزودن دروازه
              </Button>
              <div className="h-px bg-border" />
              <div className="flex justify-end">
                <Button onClick={saveGates} className="gap-2 shadow-sm">
                  <Save className="size-4" />
                  ذخیره دروازه‌ها
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
