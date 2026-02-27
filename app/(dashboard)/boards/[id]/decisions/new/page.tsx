"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronLeft, ChevronRight, Plus, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/store";
import type { Decision, Template } from "@/lib/types";
import { clamp, cn, parseLocalizedInt } from "@/lib/utils";

const steps = [
  { id: "basic", title: "اطلاعات پایه" },
  { id: "context", title: "زمینه و مسئله" },
  { id: "criteria", title: "معیارهای تصمیم" },
  { id: "options", title: "گزینه‌ها" },
  { id: "risk", title: "ریسک و اطمینان" },
];

const requiredFieldLabels: Record<string, string> = {
  owner: "مالک",
  due: "سررسید",
  criteria: "معیارها",
  options: "گزینه‌ها",
  evidence: "شواهد",
  approvers: "تاییدکنندگان",
};

const requiredFieldStepMap: Record<string, number> = {
  owner: 0,
  due: 0,
  criteria: 2,
  options: 3,
  evidence: 4,
  approvers: 4,
};

const normalizeDecisionWeight = (
  value: string | number | null | undefined
) => clamp(parseLocalizedInt(value, 3), 1, 5);

export default function NewDecisionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const boardId = params.id as string;
  const { getBoard, addDecision, users, templates } = useApp();
  const board = getBoard(boardId);
  const templateIdFromQuery = searchParams.get("templateId") || "";
  const initialTemplateFromQuery =
    templates.find((template) => template.id === templateIdFromQuery) || null;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialTemplateFromQuery?.id || ""
  );
  const [formError, setFormError] = useState("");
  const [templateNotice, setTemplateNotice] = useState(
    initialTemplateFromQuery ? `قالب «${initialTemplateFromQuery.name}» اعمال شد.` : ""
  );
  const [formData, setFormData] = useState({
    title: "",
    problemStatement: "",
    category: board?.categories[0] || "",
    impact: "Medium" as Decision["impact"],
    urgency: "Medium" as NonNullable<Decision["urgency"]>,
    relatedUncertainty: "",
    ownerId: "",
    approverIds: [] as string[],
    dueDate: "",
    reversible: true,
    confidence: 80,
    validationPlan: "",
    keyRisksMitigations: "",
    evidenceLinksText: "",
  });

  const [criteria, setCriteria] = useState<Decision["criteria"]>(() => {
    if (!initialTemplateFromQuery || initialTemplateFromQuery.criteria.length === 0) {
      return [{ id: crypto.randomUUID(), name: "", weight: 3, notes: "" }];
    }

    return initialTemplateFromQuery.criteria.map((criterion) => ({
      id: crypto.randomUUID(),
      name: criterion.name,
      weight: normalizeDecisionWeight(criterion.weight),
      notes: "",
    }));
  });

  const [options, setOptions] = useState<Decision["options"]>([
    { id: crypto.randomUUID(), title: "", pros: "", cons: "", risk: "متوسط" },
    { id: crypto.randomUUID(), title: "", pros: "", cons: "", risk: "متوسط" },
  ]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || null,
    [selectedTemplateId, templates]
  );

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData((current) => ({ ...current, ...updates }));
  };

  const updateCriterion = (
    id: string,
    updates: Partial<Decision["criteria"][number]>
  ) => {
    setCriteria((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const addCriterion = () => {
    setCriteria((current) => [
      ...current,
      { id: crypto.randomUUID(), name: "", weight: 3, notes: "" },
    ]);
  };

  const removeCriterion = (id: string) => {
    setCriteria((current) => current.filter((item) => item.id !== id));
  };

  const updateOption = (
    id: string,
    updates: Partial<Decision["options"][number]>
  ) => {
    setOptions((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const addOption = () => {
    setOptions((current) => [
      ...current,
      { id: crypto.randomUUID(), title: "", pros: "", cons: "", risk: "متوسط" },
    ]);
  };

  const removeOption = (id: string) => {
    setOptions((current) => current.filter((item) => item.id !== id));
  };

  const toggleApprover = (id: string) => {
    setFormData((current) => ({
      ...current,
      approverIds: current.approverIds.includes(id)
        ? current.approverIds.filter((item) => item !== id)
        : [...current.approverIds, id],
    }));
  };

  const applyTemplate = (template: Template) => {
    const nextCriteria =
      template.criteria.length > 0
        ? template.criteria.map((criterion) => ({
            id: crypto.randomUUID(),
            name: criterion.name,
            weight: normalizeDecisionWeight(criterion.weight),
            notes: "",
          }))
        : [{ id: crypto.randomUUID(), name: "", weight: 3, notes: "" }];

    setCriteria(nextCriteria);
    setSelectedTemplateId(template.id);
    setFormError("");
    setTemplateNotice(`قالب «${template.name}» اعمال شد.`);
  };

  const onSave = async () => {
    setFormError("");
    const normalizedCriteria = criteria
      .filter((item) => item.name.trim())
      .map((item) => ({
        id: item.id,
        name: item.name.trim(),
        weight: normalizeDecisionWeight(item.weight),
        notes: item.notes?.trim() || undefined,
      }));

    const normalizedOptions = options
      .filter((item) => item.title.trim())
      .map((item) => ({
        id: item.id,
        title: item.title.trim(),
        pros: item.pros.trim(),
        cons: item.cons.trim(),
        risk: item.risk?.trim() || undefined,
      }));

    const evidenceLinks = formData.evidenceLinksText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (selectedTemplate) {
      const missingRequiredFields = selectedTemplate.requiredFields.filter((field) => {
        if (field === "owner") return !formData.ownerId;
        if (field === "due") return !formData.dueDate;
        if (field === "criteria") return normalizedCriteria.length === 0;
        if (field === "options") return normalizedOptions.length === 0;
        if (field === "evidence") return evidenceLinks.length === 0;
        if (field === "approvers") return formData.approverIds.length === 0;
        return false;
      });

      if (missingRequiredFields.length > 0) {
        const firstMissingField = missingRequiredFields[0];
        setCurrentStep(requiredFieldStepMap[firstMissingField] ?? 0);
        setFormError(
          `برای قالب «${selectedTemplate.name}» این موارد اجباری هستند: ${missingRequiredFields
            .map((field) => requiredFieldLabels[field] || field)
            .join("، ")}`
        );
        return;
      }
    }

    const newDecision: Decision = {
      id: crypto.randomUUID(),
      boardId,
      title: formData.title,
      problemStatement: formData.problemStatement,
      status: "Draft",
      category: formData.category,
      impact: formData.impact,
      urgency: formData.urgency,
      relatedUncertainty: formData.relatedUncertainty || undefined,
      ownerId: formData.ownerId,
      ownerName: users.find((u) => u.id === formData.ownerId)?.name || "",
      contributorIds: [],
      approverIds: formData.approverIds,
      dueDate: formData.dueDate || undefined,
      criteria: normalizedCriteria,
      options: normalizedOptions,
      confidence: formData.confidence,
      reversible: formData.reversible,
      validationPlan: formData.validationPlan || undefined,
      keyRisksMitigations: formData.keyRisksMitigations || undefined,
      evidenceLinks: evidenceLinks.length ? evidenceLinks : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addDecision(newDecision);
    router.push(`/boards/${boardId}/kanban`);
  };

  const next = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  if (!board) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="ثبت تصمیم جدید"
        subtitle="مستندسازی فرآیند تصمیم‌گیری بر اساس استانداردهای بورد"
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "تصمیم جدید", href: `/boards/${boardId}/decisions/new` },
        ]}
      />

      <div className="rounded-xl border bg-muted/30 px-4 py-5">
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(index)}
                className="relative z-10 flex flex-col items-center gap-2 group"
              >
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                    isComplete
                      ? "bg-emerald-500 text-white shadow-sm"
                      : isCurrent
                        ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? "✓" : index + 1}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium leading-tight text-center max-w-[72px] transition-colors",
                    isCurrent
                      ? "text-foreground"
                      : isComplete
                        ? "text-emerald-600"
                        : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
          <div className="pointer-events-none absolute top-4 right-0 left-0 flex items-center px-[10%]">
            <div className="h-0.5 w-full rounded-full bg-muted" />
            <div
              className="absolute h-0.5 rounded-full bg-emerald-500 transition-all duration-500 right-[10%]"
              style={{ width: `${(currentStep / (steps.length - 1)) * 80}%` }}
            />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <span className="text-sm font-bold text-primary">
                {currentStep + 1}
              </span>
            </div>
            <div>
              <CardTitle className="text-base">{steps[currentStep].title}</CardTitle>
              <CardDescription>لطفا فیلدهای زیر را تکمیل کنید</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {formError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <span className="shrink-0 mt-0.5">⚠</span>
              {formError}
            </div>
          )}

          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>قالب تصمیم (اختیاری)</Label>
                <Select
                  value={selectedTemplateId || "__none"}
                  onValueChange={(value) => {
                    if (value === "__none") {
                      setSelectedTemplateId("");
                      setTemplateNotice("");
                      setCriteria([{ id: crypto.randomUUID(), name: "", weight: 3, notes: "" }]);
                    } else {
                      const tmpl = templates.find((t) => t.id === value);
                      if (tmpl) applyTemplate(tmpl);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="انتخاب قالب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">بدون قالب</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <p className="text-xs text-muted-foreground">
                    {selectedTemplate.criteria.length} معیار پیش‌فرض | الزامی‌ها:{" "}
                    {selectedTemplate.requiredFields.length > 0
                      ? selectedTemplate.requiredFields
                          .map((field) => requiredFieldLabels[field] || field)
                          .join("، ")
                      : "ندارد"}
                  </p>
                )}
                {templateNotice && (
                  <p className="text-xs text-emerald-600">{templateNotice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>عنوان تصمیم *</Label>
                <Input
                  placeholder="مثلا: انتخاب فریم‌ورک فرانت‌اند"
                  value={formData.title}
                  onChange={(e) => updateForm({ title: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>مالک تصمیم</Label>
                  <Select
                    value={formData.ownerId}
                    onValueChange={(v) => updateForm({ ownerId: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="انتخاب مالک" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>تاریخ سررسید</Label>
                  <DatePicker
                    value={formData.dueDate}
                    onValueChange={(value) => updateForm({ dueDate: value })}
                  />
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
                  <Select
                    value={formData.category}
                    onValueChange={(v) => updateForm({ category: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {board.categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>سطح تاثیر</Label>
                  <Select
                    value={formData.impact}
                    onValueChange={(v) =>
                      updateForm({ impact: v as Decision["impact"] })
                    }
                  >
                    <SelectTrigger className="w-full">
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

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                معیارها مشخص می‌کنند که تصمیم بر اساس چه عواملی ارزیابی می‌شود. هر معیار یک وزن (۱ تا ۵) دارد که اهمیت آن را نشان می‌دهد.
              </p>
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  معیارها
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{criteria.length}</span>
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={addCriterion} className="gap-2 border-dashed">
                  <Plus className="size-3.5" />
                  افزودن معیار
                </Button>
              </div>
              <div className="space-y-3">
                {criteria.map((criterion, index) => (
                  <div key={criterion.id} className="group space-y-3 rounded-xl border p-4 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className="flex size-5 items-center justify-center rounded-md bg-muted text-[10px] font-bold">{index + 1}</span>
                      معیار {index + 1}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">نام معیار</Label>
                      <Input
                        placeholder="مثلا: هزینه پیاده‌سازی، زمان تحویل، مقیاس‌پذیری"
                        value={criterion.name}
                        onChange={(e) =>
                          updateCriterion(criterion.id, { name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <div className="space-y-1.5">
                        <Label className="text-xs">توضیحات (اختیاری)</Label>
                        <Textarea
                          rows={2}
                          placeholder="چرا این معیار مهم است؟ چطور اندازه‌گیری می‌شود؟"
                          value={criterion.notes || ""}
                          onChange={(e) =>
                            updateCriterion(criterion.id, { notes: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">وزن (اهمیت)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={criterion.weight}
                          placeholder="۱ تا ۵"
                          className="w-24"
                          onChange={(e) =>
                            updateCriterion(criterion.id, {
                              weight: normalizeDecisionWeight(e.target.value),
                            })
                          }
                        />
                        <p className="text-[10px] text-muted-foreground">۱ = کم، ۵ = بسیار زیاد</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriterion(criterion.id)}
                        disabled={criteria.length === 1}
                        className="gap-1.5 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                گزینه‌های مختلف را تعریف کنید و برای هر کدام مزایا، معایب و سطح ریسک مشخص نمایید تا مقایسه آسان‌تر شود.
              </p>
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  گزینه‌ها
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{options.length}</span>
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-2 border-dashed">
                  <Plus className="size-3.5" />
                  افزودن گزینه
                </Button>
              </div>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={option.id} className="group space-y-3 rounded-xl border p-4 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <span className="flex size-5 items-center justify-center rounded-md bg-muted text-[10px] font-bold">{String.fromCharCode(65 + index)}</span>
                      گزینه {String.fromCharCode(65 + index)}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">عنوان گزینه</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="مثلا: استفاده از React، استفاده از Vue"
                          value={option.title}
                          onChange={(e) => updateOption(option.id, { title: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(option.id)}
                          disabled={options.length === 1}
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                        >
                          <Trash2 className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-emerald-600">مزایا</Label>
                        <Textarea
                          rows={2}
                          placeholder="نقاط قوت این گزینه چیست؟"
                          value={option.pros}
                          onChange={(e) => updateOption(option.id, { pros: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-destructive">معایب</Label>
                        <Textarea
                          rows={2}
                          placeholder="نقاط ضعف یا محدودیت‌های این گزینه چیست؟"
                          value={option.cons}
                          onChange={(e) => updateOption(option.id, { cons: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">سطح ریسک</Label>
                      <Select
                        value={option.risk || "متوسط"}
                        onValueChange={(v) => updateOption(option.id, { risk: v })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="سطح ریسک" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="کم">کم</SelectItem>
                          <SelectItem value="متوسط">متوسط</SelectItem>
                          <SelectItem value="زیاد">زیاد</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>فوریت</Label>
                  <Select
                    value={formData.urgency}
                    onValueChange={(v) =>
                      updateForm({ urgency: v as NonNullable<Decision["urgency"]> })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">کم</SelectItem>
                      <SelectItem value="Medium">متوسط</SelectItem>
                      <SelectItem value="High">زیاد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>اطمینان (0 تا 100)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.confidence}
                    onChange={(e) =>
                      updateForm({ confidence: Number(e.target.value || 0) })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>عدم قطعیت مرتبط</Label>
                <Textarea
                  rows={2}
                  placeholder="چه ابهام‌هایی درباره این تصمیم وجود دارد؟"
                  value={formData.relatedUncertainty}
                  onChange={(e) => updateForm({ relatedUncertainty: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>ریسک‌ها و راهکار کاهش</Label>
                <Textarea
                  rows={3}
                  placeholder="ریسک‌های کلیدی و راهکار کاهش آن‌ها"
                  value={formData.keyRisksMitigations}
                  onChange={(e) =>
                    updateForm({ keyRisksMitigations: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>برنامه اعتبارسنجی (برای اطمینان پایین مهم است)</Label>
                <Textarea
                  rows={3}
                  placeholder="چطور قبل از اجرا تصمیم را اعتبارسنجی می‌کنید؟"
                  value={formData.validationPlan}
                  onChange={(e) => updateForm({ validationPlan: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>لینک شواهد (هر خط یک لینک)</Label>
                <Textarea
                  rows={3}
                  placeholder="https://..."
                  value={formData.evidenceLinksText}
                  onChange={(e) => updateForm({ evidenceLinksText: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">تصمیم قابل بازگشت است؟</p>
                  <p className="text-xs text-muted-foreground">
                    اگر برگشت‌ناپذیر است این گزینه را خاموش کنید
                  </p>
                </div>
                <Switch
                  checked={formData.reversible}
                  onCheckedChange={(checked) => updateForm({ reversible: checked })}
                />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  تاییدکنندگان
                  {formData.approverIds.length > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">
                      {formData.approverIds.length}
                    </span>
                  )}
                </Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {users.map((user) => {
                    const checked = formData.approverIds.includes(user.id);
                    return (
                      <button
                        type="button"
                        key={user.id}
                        onClick={() => toggleApprover(user.id)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-start text-sm transition-all",
                          checked
                            ? "border-primary/30 bg-primary/5 shadow-sm ring-1 ring-primary/10"
                            : "border-border hover:bg-muted/50 hover:shadow-sm"
                        )}
                      >
                        <div className={cn(
                          "flex size-7 items-center justify-center rounded-full text-[10px] font-bold",
                          checked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                        {checked && <CheckCircle2 className="ms-auto size-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t bg-muted/20 px-6 py-4">
          <Button variant="ghost" onClick={prev} disabled={currentStep === 0} className="gap-2">
            <ChevronRight className="size-4" />
            قبلی
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onSave} className="gap-2">
              <Save className="size-4" />
              ذخیره پیش‌نویس
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button onClick={next} className="gap-2 shadow-sm">
                بعدی
                <ChevronLeft className="size-4" />
              </Button>
            ) : (
              <Button onClick={onSave} className="gap-2 shadow-md bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="size-4" />
                ثبت تصمیم
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
