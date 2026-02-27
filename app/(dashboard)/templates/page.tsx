"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FileStack,
  ListChecks,
  Pencil,
  Play,
  Plus,
  Save,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/store";
import type { Template } from "@/lib/types";
import { cn } from "@/lib/utils";

const requiredFieldOptions = [
  "owner",
  "due",
  "criteria",
  "options",
  "evidence",
  "approvers",
];
const requiredFieldLabels: Record<string, string> = {
  owner: "مالک",
  due: "سررسید",
  criteria: "معیار",
  options: "گزینه‌ها",
  evidence: "شواهد",
  approvers: "تایید‌کنندگان",
};

export default function TemplatesPage() {
  const router = useRouter();
  const { templates, boards, addTemplate, updateTemplate } = useApp();
  const initialTemplate = templates[0] ?? null;
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    initialTemplate?.id ?? null
  );
  const [targetBoardId, setTargetBoardId] = useState(boards[0]?.id ?? "");
  const [templateName, setTemplateName] = useState(
    initialTemplate?.name ?? ""
  );
  const [criteria, setCriteria] = useState<
    Array<{ name: string; weight: number }>
  >(
    initialTemplate?.criteria.map((criterion) => ({ ...criterion })) ?? []
  );
  const [requiredFields, setRequiredFields] = useState<string[]>(
    initialTemplate?.requiredFields ?? []
  );

  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template.id === selectedTemplateId) || null,
    [selectedTemplateId, templates]
  );

  const loadTemplate = (template: Template | null) => {
    if (!template) {
      setTemplateName("");
      setCriteria([]);
      setRequiredFields([]);
      return;
    }
    setTemplateName(template.name);
    setCriteria(template.criteria.map((criterion) => ({ ...criterion })));
    setRequiredFields([...template.requiredFields]);
  };

  const openTemplate = (template: Template) => {
    setSelectedTemplateId(template.id);
    loadTemplate(template);
  };

  const applyTemplateToBoard = (template: Template) => {
    if (!targetBoardId) return;
    router.push(
      `/boards/${targetBoardId}/decisions/new?templateId=${template.id}`
    );
  };

  const createNewTemplate = () => {
    setSelectedTemplateId(null);
    setTemplateName("");
    setCriteria([{ name: "", weight: 3 }]);
    setRequiredFields(["owner", "due", "criteria"]);
  };

  const updateCriterion = (
    index: number,
    updates: Partial<{ name: string; weight: number }>
  ) => {
    setCriteria((current) =>
      current.map((criterion, criterionIndex) =>
        criterionIndex === index ? { ...criterion, ...updates } : criterion
      )
    );
  };

  const addCriterion = () => {
    setCriteria((current) => [...current, { name: "", weight: 3 }]);
  };

  const removeCriterion = (index: number) => {
    setCriteria((current) =>
      current.filter((_, criterionIndex) => criterionIndex !== index)
    );
  };

  const toggleRequiredField = (field: string) => {
    setRequiredFields((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field]
    );
  };

  const saveTemplate = async () => {
    const payload: Template = {
      id: selectedTemplateId || crypto.randomUUID(),
      name: templateName || "قالب بدون عنوان",
      criteria: criteria.filter((criterion) => criterion.name.trim()),
      requiredFields,
    };

    if (selectedTemplateId) {
      await updateTemplate(selectedTemplateId, payload);
    } else {
      await addTemplate(payload);
      setSelectedTemplateId(payload.id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="قالب‌ها"
        subtitle="قالب‌های معیار و ساختار تصمیم برای استانداردسازی فرآیند"
        breadcrumbs={[{ label: "قالب‌ها", href: "/templates" }]}
        actions={
          <Button onClick={createNewTemplate} className="gap-2 shadow-sm">
            <Plus className="size-4" />
            قالب جدید
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                  <FileStack className="size-4.5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">لیست قالب‌ها</CardTitle>
                  <CardDescription>
                    یک قالب را برای ویرایش یا استفاده انتخاب کنید
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="space-y-2 rounded-xl border bg-muted/20 p-3">
                <Label className="text-xs text-muted-foreground">
                  بورد مقصد برای استفاده از قالب
                </Label>
                <Select
                  value={targetBoardId || "__none"}
                  onValueChange={(value) =>
                    setTargetBoardId(value === "__none" ? "" : value)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="انتخاب بورد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">انتخاب نشده</SelectItem>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id}>
                        {board.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {templates.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                    <FileStack className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    هنوز قالبی ایجاد نشده است
                  </p>
                </div>
              )}

              {templates.map((template) => {
                const isActive = selectedTemplateId === template.id;
                return (
                  <div
                    key={template.id}
                    className={cn(
                      "group flex items-center justify-between rounded-xl border p-3.5 transition-all hover:shadow-sm",
                      isActive && "border-primary/30 bg-primary/5 ring-1 ring-primary/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <ListChecks className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{template.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">
                            {template.criteria.length} معیار
                          </span>
                          <span className="text-muted-foreground/30">|</span>
                          <span className="text-[11px] text-muted-foreground">
                            {template.requiredFields.length} اجباری
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-8 p-0"
                        onClick={() => openTemplate(template)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-8 p-0"
                        disabled={!targetBoardId}
                        onClick={() => applyTemplateToBoard(template)}
                      >
                        <Play className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden h-fit sticky top-20">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10">
                <Pencil className="size-4.5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-base">ویرایشگر قالب</CardTitle>
                <CardDescription>
                  {selectedTemplate ? `ویرایش: ${selectedTemplate.name}` : "ایجاد قالب جدید"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label>نام قالب</Label>
              <Input
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="نام قالب"
                className="transition-shadow focus:shadow-sm"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>معیارهای پیش‌فرض</Label>
                <Badge variant="secondary" className="text-[10px]">
                  {criteria.length}
                </Badge>
              </div>
              {criteria.map((criterion, index) => (
                <div
                  key={`${criterion.name}-${index}`}
                  className="group flex items-center gap-2 rounded-xl border p-2 transition-all hover:shadow-sm"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    value={criterion.name}
                    onChange={(event) =>
                      updateCriterion(index, { name: event.target.value })
                    }
                    placeholder="معیار"
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                  <Input
                    className="w-16 shrink-0 text-center"
                    type="number"
                    min={1}
                    max={5}
                    value={criterion.weight}
                    onChange={(event) =>
                      updateCriterion(index, {
                        weight: Number(event.target.value || 3),
                      })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeCriterion(index)}
                  >
                    <Trash2 className="size-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addCriterion}
                className="gap-2 border-dashed"
              >
                <Plus className="size-3.5" />
                افزودن معیار
              </Button>
            </div>

            <div className="space-y-3">
              <Label>فیلدهای اجباری</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {requiredFieldOptions.map((field) => {
                  const checked = requiredFields.includes(field);
                  return (
                    <label
                      key={field}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-sm transition-all hover:bg-muted/50",
                        checked && "border-primary/30 bg-primary/5"
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleRequiredField(field)}
                      />
                      {requiredFieldLabels[field] || field}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-border" />

            <Button
              onClick={saveTemplate}
              className="w-full gap-2 shadow-sm"
            >
              <Save className="size-4" />
              {selectedTemplate ? "بروزرسانی قالب" : "ذخیره قالب"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
