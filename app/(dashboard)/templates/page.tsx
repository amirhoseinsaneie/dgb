"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Play, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/store";
import type { Template } from "@/lib/types";

const requiredFieldOptions = ["owner", "due", "criteria", "options", "evidence", "approvers"];
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(initialTemplate?.id ?? null);
  const [targetBoardId, setTargetBoardId] = useState(boards[0]?.id ?? "");
  const [templateName, setTemplateName] = useState(initialTemplate?.name ?? "");
  const [criteria, setCriteria] = useState<Array<{ name: string; weight: number }>>(
    initialTemplate?.criteria.map((criterion) => ({ ...criterion })) ?? []
  );
  const [requiredFields, setRequiredFields] = useState<string[]>(initialTemplate?.requiredFields ?? []);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || null,
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
    router.push(`/boards/${targetBoardId}/decisions/new?templateId=${template.id}`);
  };

  const createNewTemplate = () => {
    setSelectedTemplateId(null);
    setTemplateName("");
    setCriteria([{ name: "", weight: 3 }]);
    setRequiredFields(["owner", "due", "criteria"]);
  };

  const updateCriterion = (index: number, updates: Partial<{ name: string; weight: number }>) => {
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
    setCriteria((current) => current.filter((_, criterionIndex) => criterionIndex !== index));
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
    <div className="max-w-5xl space-y-8">
      <PageHeader
        title="قالب‌ها"
        subtitle="قالب‌های معیار و ساختار تصمیم"
        breadcrumbs={[{ label: "قالب‌ها", href: "/templates" }]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>لیست قالب‌ها</CardTitle>
            <CardDescription>یک قالب را برای ویرایش یا استفاده انتخاب کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 rounded-lg border p-3">
              <Label>بورد مقصد برای استفاده از قالب</Label>
              <Select
                value={targetBoardId || "__none"}
                onValueChange={(value) => setTargetBoardId(value === "__none" ? "" : value)}
              >
                <SelectTrigger>
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

            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">{template.criteria.length} معیار</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openTemplate(template)}>
                    <Pencil className="me-2 size-4" />
                    ویرایش
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!targetBoardId}
                    onClick={() => applyTemplateToBoard(template)}
                  >
                    <Play className="me-2 size-4" />
                    استفاده
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={createNewTemplate}>
              <Plus className="me-2 size-4" />
              قالب جدید
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ویرایشگر قالب</CardTitle>
            <CardDescription>{selectedTemplate ? "ویرایش قالب" : "ایجاد قالب"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>نام قالب</Label>
              <Input
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="نام قالب"
              />
            </div>

            <div className="space-y-2">
              <Label>معیارهای پیش‌فرض</Label>
              {criteria.map((criterion, index) => (
                <div key={`${criterion.name}-${index}`} className="flex items-center gap-2">
                  <Input
                    value={criterion.name}
                    onChange={(event) => updateCriterion(index, { name: event.target.value })}
                    placeholder="معیار"
                  />
                  <Input
                    className="w-20"
                    type="number"
                    min={1}
                    max={5}
                    value={criterion.weight}
                    onChange={(event) => updateCriterion(index, { weight: Number(event.target.value || 3) })}
                  />
                  <Button variant="outline" size="icon" onClick={() => removeCriterion(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCriterion}>
                <Plus className="me-2 size-4" />
                افزودن معیار
              </Button>
            </div>

            <div className="space-y-2">
              <Label>فیلدهای اجباری</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {requiredFieldOptions.map((field) => (
                  <label key={field} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={requiredFields.includes(field)}
                      onCheckedChange={() => toggleRequiredField(field)}
                    />
                    {requiredFieldLabels[field] || field}
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={saveTemplate}>ذخیره</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
