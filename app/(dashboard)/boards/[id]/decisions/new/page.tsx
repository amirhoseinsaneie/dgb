"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { users } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import type { Decision } from "@/lib/types";

const steps = [
  { id: "basic", title: "اطلاعات پایه" },
  { id: "context", title: "زمینه و مسئله" },
  { id: "options", title: "گزینه‌ها و معیارها" },
  { id: "risk", title: "ریسک و اطمینان" },
];

export default function NewDecisionPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, addDecision } = useApp();
  const board = getBoard(boardId);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    problemStatement: "",
    category: board?.categories[0] || "",
    impact: "Medium" as Decision["impact"],
    ownerId: "",
    dueDate: "",
    reversible: true,
    confidence: 80,
  });

  if (!board) return null;

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData((current) => ({ ...current, ...updates }));
  };

  const onSave = () => {
    const newDecision: Decision = {
      id: crypto.randomUUID(),
      boardId,
      title: formData.title,
      problemStatement: formData.problemStatement,
      status: "Draft",
      category: formData.category,
      impact: formData.impact,
      ownerId: formData.ownerId,
      ownerName: users.find(u => u.id === formData.ownerId)?.name || "",
      contributorIds: [],
      approverIds: [],
      dueDate: formData.dueDate || undefined,
      criteria: [],
      options: [],
      confidence: formData.confidence,
      reversible: formData.reversible,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addDecision(newDecision);
    router.push(`/boards/${boardId}/kanban`);
  };

  const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title="ثبت تصمیم جدید"
        subtitle="مستندسازی فرآیند تصمیم‌گیری بر اساس استانداردهای بورد"
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "تصمیم جدید", href: `/boards/${boardId}/decisions/new` },
        ]}
      />

      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {index + 1}
            </div>
            <span className={`ms-2 text-xs font-medium hidden sm:inline ${index <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
              {step.title}
            </span>
            {index < steps.length - 1 && <div className="mx-4 h-px w-8 bg-muted sm:w-16" />}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>لطفاً فیلدهای زیر را تکمیل کنید</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>عنوان تصمیم *</Label>
                <Input
                  placeholder="مثلاً: انتخاب فریم‌ورک فرانت‌اند"
                  value={formData.title}
                  onChange={(e) => updateForm({ title: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>مالک تصمیم</Label>
                  <Select value={formData.ownerId} onValueChange={(v) => updateForm({ ownerId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب مالک" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>تاریخ سررسید</Label>
                  <Input type="date" value={formData.dueDate} onChange={(e) => updateForm({ dueDate: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>بیان مسئله</Label>
                <Textarea
                  placeholder="چه مشکلی را حل می‌کنیم؟"
                  rows={5}
                  value={formData.problemStatement}
                  onChange={(e) => updateForm({ problemStatement: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>دسته‌بندی</Label>
                  <Select value={formData.category} onValueChange={(v) => updateForm({ category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {board.categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>سطح تاثیر</Label>
                  <Select value={formData.impact} onValueChange={(v: any) => updateForm({ impact: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">کم</SelectItem>
                      <SelectItem value="Medium">متوسط</SelectItem>
                      <SelectItem value="High">زیاد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep > 1 && (
            <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground">
              <p>بخش‌های پیشرفته در این نسخه آزمایشی در دسترس نیستند.</p>
              <p className="text-sm italic">شما می‌توانید پیش‌نویس را هم‌اکنون ذخیره کنید.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="ghost" onClick={prev} disabled={currentStep === 0}>
            <ChevronRight className="me-2 size-4" />
            قبلی
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onSave} className="gap-2">
              <Save className="size-4" />
              ذخیره پیش‌نویس
            </Button>
            {currentStep < steps.length - 1 && (
              <Button onClick={next}>
                بعدی
                <ChevronLeft className="ms-2 size-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
