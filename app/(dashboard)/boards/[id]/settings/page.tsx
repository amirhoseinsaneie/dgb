"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/store";

export default function BoardSettingsPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, updateBoard } = useApp();
  const board = getBoard(boardId);

  const [name, setName] = useState(board?.name || "");
  const [project, setProject] = useState(board?.project || "");
  const [columns, setColumns] = useState(board?.columns || []);
  const [qualityGates, setQualityGates] = useState(board?.qualityGates || []);
  const [categories, setCategories] = useState(board?.categories || []);

  if (!board) return null;

  const saveGeneral = () => {
    updateBoard(boardId, { name, project });
  };

  const updateGate = (index: number, label: string) => {
    setQualityGates((current) =>
      current.map((gate, i) => (i === index ? { ...gate, label } : gate))
    );
  };

  const addGate = () => {
    setQualityGates((current) => [...current, { id: crypto.randomUUID(), label: "" }]);
  };

  const saveGates = () => {
    updateBoard(boardId, { qualityGates: qualityGates.filter((g) => g.label.trim()) });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title={`تنظیمات: ${board.name}`}
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "تنظیمات", href: `/boards/${boardId}/settings` },
        ]}
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">عمومی</TabsTrigger>
          <TabsTrigger value="columns">ستون‌ها</TabsTrigger>
          <TabsTrigger value="quality">دروازه‌های کیفیت</TabsTrigger>
          <TabsTrigger value="categories">دسته‌بندی‌ها</TabsTrigger>
          <TabsTrigger value="roles">نقش‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات پایه</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>نام بورد</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>پروژه</Label>
                <Input value={project} onChange={(e) => setProject(e.target.value)} />
              </div>
              <Button onClick={saveGeneral}>ذخیره تغییرات</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="columns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>مدیریت ستون‌ها</CardTitle>
              <CardDescription>تعریف وضعیت‌های چرخه عمر تصمیم</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {columns.map((col, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={col} readOnly />
                  <Button variant="ghost" size="icon" disabled>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" disabled>
                <Plus className="me-2 size-4" />
                افزودن ستون (به زودی)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>دروازه‌های کیفیت بورد</CardTitle>
              <CardDescription>بررسی‌های استاندارد برای این بورد</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qualityGates.map((gate, index) => (
                <div key={gate.id} className="flex items-center gap-2">
                  <Input
                    value={gate.label}
                    onChange={(e) => updateGate(index, e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQualityGates(qualityGates.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addGate}>
                <Plus className="me-2 size-4" />
                افزودن دروازه
              </Button>
              <Separator className="my-4" />
              <Button onClick={saveGates}>ذخیره دروازه‌ها</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories and Roles would follow similar patterns */}
      </Tabs>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border", className)} />;
}
