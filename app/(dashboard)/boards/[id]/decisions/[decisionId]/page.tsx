"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, Archive, Copy, Download, MessageSquare, Plus, Send, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { checkDecisionQuality } from "@/lib/quality-gates";
import { useApp } from "@/lib/store";
import type { Decision } from "@/lib/types";
import { clamp, cn, parseLocalizedInt } from "@/lib/utils";

type ApprovalStatus = "Approved" | "Pending" | "Rejected";

interface LocalApproval {
  approverId: string;
  approverName: string;
  status: ApprovalStatus;
  comment: string;
  date?: string;
}

interface LocalComment {
  id: string;
  content: string;
  createdAt: string;
}

function userName(id: string, users: Array<{ id: string; name: string }>) {
  return users.find((user) => user.id === id)?.name || id;
}

export default function DecisionDetailPage() {
  const params = useParams();
  const boardId = params.id as string;
  const decisionId = params.decisionId as string;
  const { getBoard, getDecision, updateDecision, users, config } = useApp();

  const board = getBoard(boardId);
  const decision = getDecision(decisionId);

  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [status, setStatus] = useState<Decision["status"]>(decision?.status || "Draft");
  const [title, setTitle] = useState(decision?.title || "");
  const [problemStatement, setProblemStatement] = useState(decision?.problemStatement || "");
  const [category, setCategory] = useState(decision?.category || board?.categories[0] || "");
  const [impact, setImpact] = useState<Decision["impact"]>(decision?.impact || "Medium");
  const [urgency, setUrgency] = useState<NonNullable<Decision["urgency"]>>(
    decision?.urgency || "Medium"
  );
  const [confidence, setConfidence] = useState(decision?.confidence ?? 80);
  const [relatedUncertainty, setRelatedUncertainty] = useState(
    decision?.relatedUncertainty || ""
  );
  const [ownerId, setOwnerId] = useState(decision?.ownerId || "");
  const [contributorIds, setContributorIds] = useState<string[]>(
    decision?.contributorIds || []
  );
  const [approverIds] = useState<string[]>(decision?.approverIds || []);
  const [chosenOptionId, setChosenOptionId] = useState(decision?.chosenOptionId || "");
  const [finalRationale, setFinalRationale] = useState(decision?.finalRationale || "");
  const [implementationNotes, setImplementationNotes] = useState(decision?.implementationNotes || "");
  const [outcomeReversible, setOutcomeReversible] = useState(decision?.reversible ?? true);
  const [dueDate, setDueDate] = useState(decision?.dueDate || "");
  const [reviewMeetingDate, setReviewMeetingDate] = useState(
    decision?.reviewMeetingDate || ""
  );
  const [rollbackPlan, setRollbackPlan] = useState(decision?.rollbackExplanation || "");
  const [editableCriteria, setEditableCriteria] = useState(decision?.criteria || []);
  const [editableOptions, setEditableOptions] = useState(decision?.options || []);
  const [riskMitigations, setRiskMitigations] = useState(decision?.keyRisksMitigations || "");
  const [evidenceLinksText, setEvidenceLinksText] = useState(
    (decision?.evidenceLinks || []).join("\n")
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [referenceNow] = useState(() => Date.now());
  const [approvals, setApprovals] = useState<LocalApproval[]>(
    () =>
      approverIds.map((approverId) => ({
        approverId,
        approverName: userName(approverId, users),
        status: "Pending",
        comment: "",
      }))
  );

  if (!board || !decision) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <AlertTriangle className="size-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">تصمیم یافت نشد</p>
      </div>
    );
  }

  const quality = checkDecisionQuality(decision, board);
  const failedChecks = quality.checks.filter((check) => !check.passed);

  const evidenceLinks = evidenceLinksText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const irreversibleWithoutEvidence =
    !outcomeReversible &&
    (!riskMitigations.trim() || evidenceLinks.length === 0 || editableOptions.filter((item) => item.title.trim()).length < 2);
  const highImpactWithoutApprovers =
    impact === "High" && approverIds.length === 0;
  const lowConfidenceWithoutValidation =
    decision.confidence < 60 && !decision.validationPlan?.trim();
  const dueSoon = dueDate
    ? new Date(dueDate).getTime() <= referenceNow + 2 * 24 * 60 * 60 * 1000
    : false;

  const contributorNames = contributorIds.map((id) =>
    userName(id, users)
  );
  const approverNames = approverIds.map((id) =>
    userName(id, users)
  );

  const approvalSummary = {
    required: approvals.length,
    approved: approvals.filter((item) => item.status === "Approved").length,
    pending: approvals.filter((item) => item.status === "Pending").length,
    rejected: approvals.filter((item) => item.status === "Rejected").length,
  };

  const canEditDecision = !["Implementing", "Done"].includes(decision.status);

  const persistDecision = async (updates: Partial<Decision>, successMessage: string) => {
    setIsSaving(true);
    try {
      await updateDecision(decisionId, updates);
      setLastSavedAt(new Date().toISOString());
      setSaveNotice(successMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const updateCriterion = (
    id: string,
    updates: Partial<Decision["criteria"][number]>
  ) => {
    setEditableCriteria((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const addCriterion = () => {
    setEditableCriteria((current) => [
      ...current,
      { id: crypto.randomUUID(), name: "", weight: 3 },
    ]);
  };

  const removeCriterion = (id: string) => {
    setEditableCriteria((current) => current.filter((item) => item.id !== id));
  };

  const updateOption = (
    id: string,
    updates: Partial<Decision["options"][number]>
  ) => {
    setEditableOptions((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const addOption = () => {
    setEditableOptions((current) => [
      ...current,
      { id: crypto.randomUUID(), title: "", pros: "", cons: "", risk: "" },
    ]);
  };

  const removeOption = (id: string) => {
    setEditableOptions((current) => current.filter((item) => item.id !== id));
  };

  const buildNormalizedCriteriaAndOptions = () => {
    const criteria = editableCriteria
      .filter((item) => item.name.trim())
      .map((item) => ({
        id: item.id,
        name: item.name.trim(),
        weight: clamp(parseLocalizedInt(item.weight, 3), 1, 5),
        notes: item.notes?.trim() || undefined,
      }));

    const options = editableOptions
      .filter((item) => item.title.trim())
      .map((item) => ({
        id: item.id,
        title: item.title.trim(),
        pros: item.pros.trim(),
        cons: item.cons.trim(),
        risk: item.risk?.trim() || undefined,
      }));

    return { criteria, options };
  };

  const saveCriteriaAndOptions = () => {
    const { criteria, options } = buildNormalizedCriteriaAndOptions();
    void persistDecision({ criteria, options }, "معیارها و گزینه‌ها ذخیره شد.");
  };

  const toggleContributor = (id: string) => {
    setContributorIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const buildBasicDetailsPayload = (): Partial<Decision> => {
    const ownerName = ownerId ? userName(ownerId, users) : undefined;
    return {
      title: title.trim() || decision.title,
      problemStatement: problemStatement.trim() || decision.problemStatement,
      category,
      impact,
      urgency,
      confidence: clamp(parseLocalizedInt(confidence, decision.confidence || 80), 0, 100),
      relatedUncertainty: relatedUncertainty.trim() || undefined,
      ownerId: ownerId || undefined,
      ownerName,
      contributorIds,
      approverIds,
      dueDate: dueDate || undefined,
      reviewMeetingDate: reviewMeetingDate || undefined,
    };
  };

  const saveBasicDetails = () => {
    void persistDecision(buildBasicDetailsPayload(), "خلاصه و بیان مسئله ذخیره شد.");
  };

  const focusField = (id: string) => {
    const target = document.getElementById(id);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.focus();
    }
  };

  const onStatusChange = (value: string) => {
    const next = value as Decision["status"];
    setStatus(next);
    void persistDecision({ status: next }, "وضعیت ذخیره شد.");
  };

  const postComment = () => {
    if (!newComment.trim()) return;
    setComments((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewComment("");
  };

  const saveOutcome = () => {
    const normalized = canEditDecision ? buildNormalizedCriteriaAndOptions() : null;

    void persistDecision({
      ...buildBasicDetailsPayload(),
      ...(normalized ?? {}),
      chosenOptionId: chosenOptionId || undefined,
      finalRationale: finalRationale || undefined,
      implementationNotes: implementationNotes || undefined,
      reversible: outcomeReversible,
      keyRisksMitigations: riskMitigations.trim() || undefined,
      evidenceLinks: evidenceLinks.length ? evidenceLinks : undefined,
      rollbackExplanation: outcomeReversible ? undefined : rollbackPlan || undefined,
    }, "همه تغییرات تصمیم ذخیره شد.");
  };

  const setApprovalStatus = (approverId: string, approvalStatus: ApprovalStatus) => {
    setApprovals((current) =>
      current.map((item) =>
        item.approverId === approverId
          ? { ...item, status: approvalStatus, date: new Date().toISOString() }
          : item
      )
    );
  };

  const hasPendingCoreChanges =
    title.trim() !== decision.title ||
    problemStatement.trim() !== decision.problemStatement ||
    category !== decision.category ||
    impact !== decision.impact ||
    urgency !== (decision.urgency || "Medium") ||
    clamp(parseLocalizedInt(confidence, decision.confidence), 0, 100) !==
      decision.confidence ||
    relatedUncertainty.trim() !== (decision.relatedUncertainty || "") ||
    ownerId !== (decision.ownerId || "") ||
    dueDate !== (decision.dueDate || "") ||
    reviewMeetingDate !== (decision.reviewMeetingDate || "") ||
    JSON.stringify([...contributorIds].sort()) !==
      JSON.stringify([...(decision.contributorIds || [])].sort()) ||
    JSON.stringify([...approverIds].sort()) !==
      JSON.stringify([...(decision.approverIds || [])].sort());

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <PageHeader
          title={`تصمیم: ${decision.title}`}
          subtitle={`${config.defaultColumnLabels[decision.status] || decision.status} | ${decision.ownerName || "بدون مالک"} | سررسید: ${decision.dueDate || "-"} | کیفیت: ${quality.score}/100`}
          breadcrumbs={[
            { label: "بوردها", href: "/boards" },
            { label: board.name, href: `/boards/${boardId}` },
            { label: "تصمیمات", href: `/boards/${boardId}/decisions` },
            { label: decision.title, href: `/boards/${boardId}/decisions/${decisionId}` },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="تغییر وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  {board.columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {config.defaultColumnLabels[column] || column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <MessageSquare className="me-2 size-4" />
                افزودن پیام
              </Button>
              <Button variant="outline" size="sm">
                <Send className="me-2 size-4" />
                درخواست تایید
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="me-2 size-4" />
                تکثیر
              </Button>
              <Button variant="outline" size="sm">
                <Archive className="me-2 size-4" />
                بایگانی
              </Button>
              <Button variant="outline" size="sm">
                <Download className="me-2 size-4" />
                خروجی
              </Button>
            </div>
          }
        />

        {canEditDecision && (
          <div className="sticky top-16 z-20 rounded-xl border bg-background/95 p-3.5 backdrop-blur-xl shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isSaving ? (
                  <>
                    <div className="size-2 animate-pulse rounded-full bg-amber-500" />
                    در حال ذخیره تغییرات...
                  </>
                ) : saveNotice ? (
                  <>
                    <div className="size-2 rounded-full bg-emerald-500" />
                    {saveNotice}
                  </>
                ) : lastSavedAt ? (
                  <>
                    <div className="size-2 rounded-full bg-emerald-500" />
                    آخرین ذخیره: {new Date(lastSavedAt).toLocaleTimeString("fa-IR")}
                  </>
                ) : (
                  <>
                    <div className="size-2 rounded-full bg-muted-foreground/30" />
                    تغییری ذخیره نشده است
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={saveBasicDetails}
                  disabled={isSaving || !hasPendingCoreChanges}
                >
                  ذخیره خلاصه
                </Button>
                <Button size="sm" onClick={saveOutcome} disabled={isSaving} className="shadow-sm">
                  ذخیره همه تغییرات
                </Button>
              </div>
            </div>
          </div>
        )}

        {irreversibleWithoutEvidence && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>ریسک بالا: تصمیم غیرقابل بازگشت نیاز به شواهد + ریسک‌ها + گزینه‌ها دارد.</AlertTitle>
            <AlertDescription className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => focusField("evidence-links-field")}
              >
                افزودن شواهد
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => focusField("risk-mitigations-field")}
              >
                افزودن ریسک‌ها
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!canEditDecision) return;
                  addOption();
                }}
              >
                افزودن گزینه‌ها
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {highImpactWithoutApprovers && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>تایید‌کنندگان برای تصمیمات با تاثیر بالا الزامی هستند.</AlertTitle>
            <AlertDescription>
              لطفاً تایید‌کنندگان را قبل از شروع جریان تایید اضافه کنید.
            </AlertDescription>
          </Alert>
        )}

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-base">خلاصه</CardTitle>
          </CardHeader>
          <CardContent className="text-sm pt-6">
            {canEditDecision ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>عنوان تصمیم</Label>
                  <Input
                    value={title}
                    placeholder="عنوان تصمیم"
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>دسته‌بندی</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب دسته‌بندی" />
                      </SelectTrigger>
                      <SelectContent>
                        {board.categories.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>تاثیر</Label>
                    <Select
                      value={impact}
                      onValueChange={(value) => setImpact(value as Decision["impact"])}
                    >
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

                  <div className="space-y-2">
                    <Label>فوریت</Label>
                    <Select
                      value={urgency}
                      onValueChange={(value) =>
                        setUrgency(value as NonNullable<Decision["urgency"]>)
                      }
                    >
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

                  <div className="space-y-2">
                    <Label>اطمینان (۰ تا ۱۰۰)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={confidence}
                      onChange={(event) =>
                        setConfidence(
                          clamp(parseLocalizedInt(event.target.value, 80), 0, 100)
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>مالک</Label>
                    <Select
                      value={ownerId || "__none"}
                      onValueChange={(value) =>
                        setOwnerId(value === "__none" ? "" : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب مالک" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">بدون مالک</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>تاریخ سررسید</Label>
                    <DatePicker value={dueDate} onValueChange={setDueDate} />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label>تاریخ جلسه بررسی</Label>
                    <DatePicker
                      value={reviewMeetingDate}
                      onValueChange={setReviewMeetingDate}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>مشارکت‌کنندگان</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {users.map((user) => {
                      const checked = contributorIds.includes(user.id);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => toggleContributor(user.id)}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-start transition-colors",
                            checked
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50"
                          )}
                        >
                          {user.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>تایید‌کنندگان</Label>
                  <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                    {approverNames.length > 0 ? approverNames.join("، ") : "-"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>عدم قطعیت مرتبط</Label>
                  <Textarea
                    rows={2}
                    value={relatedUncertainty}
                    placeholder="ابهام‌های مهم این تصمیم"
                    onChange={(event) => setRelatedUncertainty(event.target.value)}
                  />
                </div>

                <p>
                  <span className="text-muted-foreground">ایجاد شده:</span>{" "}
                  {new Date(decision.createdAt).toLocaleDateString("fa-IR")}
                </p>

                <div className="flex justify-end">
                  <Button onClick={saveBasicDetails}>ذخیره خلاصه</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{category}</Badge>
                  <Badge
                    variant={
                      impact === "High"
                        ? "destructive"
                        : impact === "Medium"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {impact === "High" ? "بالا" : impact === "Medium" ? "متوسط" : "کم"}
                  </Badge>
                </div>
                <p><span className="text-muted-foreground">مالک:</span> {ownerId ? userName(ownerId, users) : "-"}</p>
                <p>
                  <span className="text-muted-foreground">مشارکت‌کنندگان:</span>{" "}
                  {contributorNames.length > 0 ? contributorNames.join(", ") : "-"}
                </p>
                <p>
                  <span className="text-muted-foreground">تایید‌کنندگان:</span>{" "}
                  {approverNames.length > 0 ? approverNames.join(", ") : "-"}
                </p>
                <p><span className="text-muted-foreground">تاریخ سررسید:</span> {dueDate || "-"}</p>
                <p><span className="text-muted-foreground">تاریخ جلسه بررسی:</span> {reviewMeetingDate || "-"}</p>
                <p><span className="text-muted-foreground">ایجاد شده:</span> {new Date(decision.createdAt).toLocaleDateString("fa-IR")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-base">بیان مسئله</CardTitle>
          </CardHeader>
          <CardContent>
            {canEditDecision ? (
              <div className="space-y-3">
                <Textarea
                  rows={5}
                  value={problemStatement}
                  placeholder="مسئله تصمیم را شرح دهید"
                  onChange={(event) => setProblemStatement(event.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={saveBasicDetails}>ذخیره بیان مسئله</Button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-sm">{problemStatement}</p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-base">معیارها</CardTitle>
          </CardHeader>
          <CardContent>
            {canEditDecision ? (
              <div className="space-y-3">
                {editableCriteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-2 rounded-lg border p-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_110px_40px]">
                      <Input
                        value={criterion.name}
                        placeholder="نام معیار"
                        onChange={(event) =>
                          updateCriterion(criterion.id, { name: event.target.value })
                        }
                      />
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={criterion.weight}
                        placeholder="وزن (۱ تا ۵)"
                        onChange={(event) =>
                          updateCriterion(criterion.id, {
                            weight: clamp(
                              parseLocalizedInt(event.target.value, 3),
                              1,
                              5
                            ),
                          })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCriterion(criterion.id)}
                        disabled={editableCriteria.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="یادداشت معیار (اختیاری)"
                      value={criterion.notes || ""}
                      onChange={(event) =>
                        updateCriterion(criterion.id, { notes: event.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      وزن معیار یعنی اهمیت آن در تصمیم: ۱ کمترین، ۵ بیشترین.
                    </p>
                  </div>
                ))}
                <Button variant="outline" onClick={addCriterion}>
                  <Plus className="me-2 size-4" />
                  افزودن معیار
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>معیار</TableHead>
                    <TableHead>وزن</TableHead>
                    <TableHead>یادداشت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {decision.criteria.map((criterion) => (
                    <TableRow key={criterion.id}>
                      <TableCell>{criterion.name}</TableCell>
                      <TableCell>{criterion.weight}</TableCell>
                      <TableCell>{criterion.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-base">گزینه‌ها و ارزیابی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canEditDecision ? (
              <div className="space-y-3">
                {editableOptions.map((option) => (
                  <div key={option.id} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={option.title}
                        placeholder="عنوان گزینه"
                        onChange={(event) =>
                          updateOption(option.id, { title: event.target.value })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(option.id)}
                        disabled={editableOptions.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Textarea
                        rows={2}
                        placeholder="مزایا"
                        value={option.pros}
                        onChange={(event) =>
                          updateOption(option.id, { pros: event.target.value })
                        }
                      />
                      <Textarea
                        rows={2}
                        placeholder="معایب"
                        value={option.cons}
                        onChange={(event) =>
                          updateOption(option.id, { cons: event.target.value })
                        }
                      />
                    </div>
                    <Input
                      value={option.risk || ""}
                      placeholder="ریسک"
                      onChange={(event) =>
                        updateOption(option.id, { risk: event.target.value })
                      }
                    />
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={addOption}>
                    <Plus className="me-2 size-4" />
                    افزودن گزینه
                  </Button>
                  <Button onClick={saveCriteriaAndOptions}>ذخیره معیارها و گزینه‌ها</Button>
                </div>
              </div>
            ) : (
              <>
                {decision.options.length === 0 && (
                  <p className="text-sm text-muted-foreground">گزینه‌ای اضافه نشده است.</p>
                )}
                {decision.options.map((option) => (
                  <div key={option.id} className="space-y-1 rounded-lg border p-3 text-sm">
                    <p className="font-medium">{option.title}</p>
                    <p><span className="text-muted-foreground">مزایا:</span> {option.pros}</p>
                    <p><span className="text-muted-foreground">معایب:</span> {option.cons}</p>
                    <p><span className="text-muted-foreground">ریسک:</span> {option.risk || "-"}</p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-base">خروجی تصمیم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>گزینه انتخاب شده</Label>
              <Select value={chosenOptionId} onValueChange={setChosenOptionId}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب گزینه" />
                </SelectTrigger>
                <SelectContent>
                  {(canEditDecision ? editableOptions : decision.options).map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {canEditDecision && (
              <div className="space-y-2">
                <Label>تاریخ سررسید</Label>
                <DatePicker
                  value={dueDate}
                  onValueChange={(value) => {
                    setDueDate(value);
                    void persistDecision(
                      { dueDate: value || undefined },
                      "تاریخ سررسید ذخیره شد."
                    );
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>دلیل نهایی *</Label>
              <Textarea
                rows={4}
                value={finalRationale}
                onChange={(event) => setFinalRationale(event.target.value)}
                placeholder="چرا این گزینه انتخاب شد"
              />
            </div>

            <div className="space-y-2">
              <Label>ریسک‌ها و راهکار کاهش</Label>
              <Textarea
                id="risk-mitigations-field"
                rows={3}
                value={riskMitigations}
                onChange={(event) => setRiskMitigations(event.target.value)}
                placeholder="ریسک‌های اصلی و روش کاهش آن‌ها"
              />
            </div>

            <div className="space-y-2">
              <Label>شواهد (هر خط یک مورد)</Label>
              <Textarea
                id="evidence-links-field"
                rows={3}
                value={evidenceLinksText}
                onChange={(event) => setEvidenceLinksText(event.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={outcomeReversible}
                onCheckedChange={(checked) => {
                  setOutcomeReversible(checked);
                  void persistDecision({
                    reversible: checked,
                    rollbackExplanation: checked
                      ? undefined
                      : rollbackPlan || undefined,
                  }, "قابلیت بازگشت به‌روزرسانی شد.");
                }}
              />
              <Label>قابل بازگشت؟</Label>
            </div>

            {!outcomeReversible && (
              <div className="space-y-2">
                <Label>برنامه بازگشت</Label>
                <Textarea
                  rows={3}
                  value={rollbackPlan}
                  onChange={(event) => setRollbackPlan(event.target.value)}
                  placeholder="در صورت نیاز به بازگشت چه اقدامی انجام می‌شود؟"
                />
              </div>
            )}

            <Button onClick={saveOutcome}>ذخیره خروجی</Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="comments">
          <TabsList className="w-full justify-start rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="comments" className="data-[state=active]:shadow-sm">
              <MessageSquare className="me-1.5 size-3.5" />
              نظرات و گفتگو
            </TabsTrigger>
            <TabsTrigger value="approvals" className="data-[state=active]:shadow-sm">
              تاییدها
              {approvalSummary.pending > 0 && (
                <Badge variant="secondary" className="ms-1.5 size-5 justify-center rounded-full p-0 text-[10px]">
                  {approvalSummary.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:shadow-sm">سوابق تغییرات</TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="mt-4">
            <Card className="overflow-hidden">
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start gap-2">
                  <Textarea
                    rows={2}
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder="افزودن نظر..."
                    className="transition-shadow focus:shadow-sm"
                  />
                  <Button onClick={postComment} className="shadow-sm">ارسال</Button>
                </div>
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <MessageSquare className="size-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">نظری ثبت نشده است</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="rounded-xl border p-3 text-sm transition-all hover:shadow-sm">
                      <p>{comment.content}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString("fa-IR")}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="mt-4">
            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">خلاصه تاییدها</CardTitle>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>تایید: <strong className="text-emerald-600">{approvalSummary.approved}</strong></span>
                    <span>در انتظار: <strong className="text-amber-600">{approvalSummary.pending}</strong></span>
                    <span>رد: <strong className="text-destructive">{approvalSummary.rejected}</strong></span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>نام</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>تاریخ</TableHead>
                      <TableHead className="text-end">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvals.map((approval) => (
                      <TableRow key={approval.approverId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                              {approval.approverName.charAt(0)}
                            </div>
                            <span className="font-medium text-sm">{approval.approverName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            approval.status === "Approved" ? "default" :
                            approval.status === "Rejected" ? "destructive" : "secondary"
                          } className="text-[10px]">
                            {approval.status === "Approved" ? "تایید شده" : approval.status === "Rejected" ? "رد شده" : "در انتظار"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {approval.date ? new Date(approval.date).toLocaleDateString("fa-IR") : "-"}
                        </TableCell>
                        <TableCell className="text-end">
                          {approval.status === "Pending" && (
                            <Button size="sm" className="h-7 text-xs shadow-sm" onClick={() => setApprovalStatus(approval.approverId, "Approved")}>
                              تایید
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden sticky top-20">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">چک‌لیست کیفیت</CardTitle>
              <div className={cn(
                "flex size-10 items-center justify-center rounded-xl text-sm font-bold",
                quality.score >= 80
                  ? "bg-emerald-500/10 text-emerald-600"
                  : quality.score >= 50
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-destructive/10 text-destructive"
              )}>
                {quality.score}
              </div>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  quality.score >= 80
                    ? "bg-emerald-500"
                    : quality.score >= 50
                      ? "bg-amber-500"
                      : "bg-destructive"
                )}
                style={{ width: `${quality.score}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 pt-4">
            {quality.checks.map((check) => (
              <div key={check.id} className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                check.passed ? "text-foreground" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px]",
                  check.passed ? "bg-emerald-500/15 text-emerald-600" : "bg-destructive/10 text-destructive"
                )}>
                  {check.passed ? "✓" : "✗"}
                </div>
                <span className="text-xs leading-tight">{check.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {(failedChecks.length > 0 || !decision.ownerId || decision.criteria.length === 0) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">اقدامات سریع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!decision.ownerId && (
                <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={() => focusField("owner-field")}>
                  <div className="size-2 rounded-full bg-amber-500" />
                  تعیین مالک
                </Button>
              )}
              {decision.criteria.length === 0 && (
                <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={addCriterion}>
                  <div className="size-2 rounded-full bg-amber-500" />
                  افزودن معیار
                </Button>
              )}
              {!decision.dueDate && (
                <Button size="sm" variant="outline" className="w-full justify-start gap-2" onClick={() => focusField("due-date-field")}>
                  <div className="size-2 rounded-full bg-amber-500" />
                  تعیین سررسید
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


