"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";
import type { Board } from "@/lib/types";

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
      current.includes(col) ? current.filter((c) => c !== col) : [...current, col]
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
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title="ایجاد بورد جدید"
        subtitle="تنظیم بورد سامانه مدیریت تصمیم برای تیم یا پروژه شما"
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: "ایجاد", href: "/boards/create" },
        ]}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات پایه</CardTitle>
            <CardDescription>نام بورد و پروژه مرتبط را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">نام بورد *</Label>
              <Input
                id="name"
                placeholder="مثلاً: معماری پلتفرم"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">پروژه (اختیاری)</Label>
              <Input
                id="project"
                placeholder="نام پروژه یا تیم"
                value={project}
                onChange={(e) => setProject(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ستون‌های چرخه عمر</CardTitle>
            <CardDescription>مراحل فرآیند تصمیم‌گیری خود را انتخاب کنید</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {config.defaultColumns.map((col) => (
              <div key={col} className="flex items-center gap-2">
                <Checkbox
                  id={`col-${col}`}
                  checked={columns.includes(col)}
                  onCheckedChange={() => toggleColumn(col)}
                />
                <Label htmlFor={`col-${col}`}>
                  {config.defaultColumnLabels[col] || col}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>دروازه‌های کیفیت</CardTitle>
            <CardDescription>بررسی‌هایی که قبل از تایید یا انجام الزامی هستند</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {qualityGates.map((gate, index) => (
              <div key={gate.id} className="flex items-center gap-2">
                <Input
                  value={gate.label}
                  onChange={(e) => updateGate(index, e.target.value)}
                  placeholder="توضیح دروازه کیفیت"
                />
                <Button variant="ghost" size="icon" onClick={() => removeGate(index)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addGate} className="gap-2">
              <Plus className="size-4" />
              افزودن دروازه کیفیت
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            انصراف
          </Button>
          <Button onClick={onSubmit} disabled={!name.trim()}>
            ایجاد بورد
          </Button>
        </div>
      </div>
    </div>
  );
}
