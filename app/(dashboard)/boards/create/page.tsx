"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Columns3,
  FolderPlus,
  Info,
  Plus,
  ShieldCheck,
  Trash2,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";
import type { Board } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function CreateBoardPage() {
  const router = useRouter();
  const { addBoard, config } = useApp();

  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [columns, setColumns] = useState<string[]>(config.defaultColumns);
  const [qualityGates, setQualityGates] = useState(
    config.defaultQualityGates.map((gate) => ({ ...gate }))
  );
  const [categories, setCategories] = useState<string[]>(
    config.defaultCategories
  );
  const [roles, setRoles] = useState<string[]>([
    "مالک",
    "مشارکت‌کننده",
    "تاییدکننده",
  ]);

  const toggleColumn = (col: string) => {
    setColumns((current) =>
      current.includes(col)
        ? current.filter((c) => c !== col)
        : [...current, col]
    );
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

  const removeGate = (index: number) => {
    setQualityGates((current) => current.filter((_, i) => i !== index));
  };

  const onSubmit = () => {
    if (!name.trim()) return;
    const newBoard: Board = {
      id: crypto.randomUUID(),
      name,
      project,
      status: "Active",
      columns,
      qualityGates: qualityGates.filter((g) => g.label.trim()),
      categories,
      roles,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    void addBoard(newBoard);
    router.push(`/boards/${newBoard.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="ایجاد بورد جدید"
        subtitle="تنظیم بورد سامانه مدیریت تصمیم برای تیم یا پروژه شما"
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: "ایجاد", href: "/boards/create" },
        ]}
      />

      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                <Info className="size-4.5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">اطلاعات پایه</CardTitle>
                <CardDescription>
                  نام بورد و پروژه مرتبط را وارد کنید
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">نام بورد *</Label>
              <Input
                id="name"
                placeholder="مثلاً: معماری پلتفرم"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="transition-shadow focus:shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">پروژه (اختیاری)</Label>
              <Input
                id="project"
                placeholder="نام پروژه یا تیم"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="transition-shadow focus:shadow-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10">
                <Columns3 className="size-4.5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-base">ستون‌های چرخه عمر</CardTitle>
                <CardDescription>
                  مراحل فرآیند تصمیم‌گیری خود را انتخاب کنید
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {config.defaultColumns.map((col) => {
                const isSelected = columns.includes(col);
                return (
                  <label
                    key={col}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition-all hover:bg-muted/50",
                      isSelected &&
                        "border-primary/30 bg-primary/5 shadow-sm ring-1 ring-primary/10"
                    )}
                  >
                    <Checkbox
                      id={`col-${col}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleColumn(col)}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {config.defaultColumnLabels[col] || col}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              <Badge variant="secondary" className="me-1.5 text-[10px]">
                {columns.length}
              </Badge>
              ستون انتخاب شده
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10">
                <ShieldCheck className="size-4.5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base">دروازه‌های کیفیت</CardTitle>
                <CardDescription>
                  بررسی‌هایی که قبل از تایید یا انجام الزامی هستند
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {qualityGates.map((gate, index) => (
              <div
                key={gate.id}
                className="group flex items-center gap-2 rounded-xl border p-2.5 transition-all hover:border-border/80 hover:shadow-sm"
              >
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <Input
                  value={gate.label}
                  onChange={(e) => updateGate(index, e.target.value)}
                  placeholder="توضیح دروازه کیفیت"
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeGate(index)}
                >
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addGate}
              className="gap-2 border-dashed"
            >
              <Plus className="size-4" />
              افزودن دروازه کیفیت
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <FolderPlus className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">آماده ایجاد بورد هستید؟</p>
              <p className="text-xs text-muted-foreground">
                بعد از ایجاد می‌توانید تنظیمات را ویرایش کنید
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              انصراف
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!name.trim()}
              className="shadow-md"
            >
              <FolderPlus className="me-2 size-4" />
              ایجاد بورد
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
