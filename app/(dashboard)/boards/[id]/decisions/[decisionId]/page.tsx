"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  ListChecks,
  MessageSquare,
  Plus,
  Scale,
  Send,
  Shield,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  Users,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
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
import { clamp, cn, parseLocalizedInt, toJalali, toJalaliDateTime, toJalaliTime } from "@/lib/utils";

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

  const statusColorMap: Record<string, { bg: string; text: string; dot: string }> = {
    Draft: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-400" },
    "Ready for Review": { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
    Review: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
    Approved: { bg: "bg-indigo-50 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-500" },
    Implementing: { bg: "bg-violet-50 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
    Done: { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
    Reversed: { bg: "bg-rose-50 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
  };

  const currentStatusColors = statusColorMap[decision.status] || statusColorMap.Draft;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <PageHeader
          title={decision.title}
          breadcrumbs={[
            { label: "بوردها", href: "/boards" },
            { label: board.name, href: `/boards/${boardId}` },
            { label: "تصمیمات", href: `/boards/${boardId}/decisions` },
            { label: decision.title, href: `/boards/${boardId}/decisions/${decisionId}` },
          ]}
          actions={
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className={cn("w-[180px] rounded-full border-0 font-medium", currentStatusColors.bg, currentStatusColors.text)}>
                <div className="flex items-center gap-2">
                  <div className={cn("size-2 rounded-full", currentStatusColors.dot)} />
                  <SelectValue placeholder="تغییر وضعیت" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {board.columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {config.defaultColumnLabels[column] || column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />

        {/* At-a-glance metrics strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-all hover:shadow-sm">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <User className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{decision.ownerName || "—"}</p>
              <p className="text-[11px] text-muted-foreground">مالک</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-all hover:shadow-sm">
            <div className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              impact === "High" ? "bg-destructive/10" : impact === "Medium" ? "bg-amber-500/10" : "bg-emerald-500/10"
            )}>
              <Zap className={cn("size-4", impact === "High" ? "text-destructive" : impact === "Medium" ? "text-amber-600" : "text-emerald-600")} />
            </div>
            <div>
              <p className="text-sm font-medium">{impact === "High" ? "زیاد" : impact === "Medium" ? "متوسط" : "کم"}</p>
              <p className="text-[11px] text-muted-foreground">تاثیر</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-all hover:shadow-sm">
            <div className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              confidence >= 70 ? "bg-emerald-500/10" : confidence >= 40 ? "bg-amber-500/10" : "bg-destructive/10"
            )}>
              <Gauge className={cn("size-4", confidence >= 70 ? "text-emerald-600" : confidence >= 40 ? "text-amber-600" : "text-destructive")} />
            </div>
            <div>
              <p className="text-sm font-medium tabular-nums">{confidence}٪</p>
              <p className="text-[11px] text-muted-foreground">اطمینان</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-all hover:shadow-sm">
            <div className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              dueSoon ? "bg-destructive/10" : "bg-muted"
            )}>
              <Calendar className={cn("size-4", dueSoon ? "text-destructive" : "text-muted-foreground")} />
            </div>
            <div>
              <p className={cn("text-sm font-medium", dueSoon && "text-destructive")}>{toJalali(dueDate)}</p>
              <p className="text-[11px] text-muted-foreground">سررسید</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-full">
            <Send className="size-3.5" />
            درخواست تایید
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-full">
            <Copy className="size-3.5" />
            تکثیر
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-full">
            <Archive className="size-3.5" />
            بایگانی
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-full">
            <Download className="size-3.5" />
            خروجی
          </Button>
        </div>

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
                    آخرین ذخیره: {toJalaliTime(lastSavedAt)}
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

        {(irreversibleWithoutEvidence || highImpactWithoutApprovers || lowConfidenceWithoutValidation) && (
          <div className="space-y-3">
            {irreversibleWithoutEvidence && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                    <Shield className="size-4.5 text-destructive" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-semibold text-destructive">تصمیم غیرقابل بازگشت - اطلاعات ناقص</p>
                    <p className="text-xs text-destructive/80">شواهد، ریسک‌ها و حداقل ۲ گزینه برای تصمیمات برگشت‌ناپذیر الزامی هستند.</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" variant="outline" className="h-7 rounded-full border-destructive/30 text-xs text-destructive hover:bg-destructive/10" onClick={() => focusField("evidence-links-field")}>
                        افزودن شواهد
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 rounded-full border-destructive/30 text-xs text-destructive hover:bg-destructive/10" onClick={() => focusField("risk-mitigations-field")}>
                        افزودن ریسک‌ها
                      </Button>
                      {canEditDecision && (
                        <Button size="sm" variant="outline" className="h-7 rounded-full border-destructive/30 text-xs text-destructive hover:bg-destructive/10" onClick={addOption}>
                          افزودن گزینه
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {highImpactWithoutApprovers && (
              <div className="rounded-xl border border-amber-300/40 bg-amber-50/60 p-4 dark:border-amber-700/40 dark:bg-amber-900/10">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                    <Users className="size-4.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">تاییدکنندگان الزامی</p>
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/70">تصمیمات با تاثیر بالا باید حداقل یک تاییدکننده داشته باشند.</p>
                  </div>
                </div>
              </div>
            )}

            {lowConfidenceWithoutValidation && (
              <div className="rounded-xl border border-blue-300/40 bg-blue-50/60 p-4 dark:border-blue-700/40 dark:bg-blue-900/10">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                    <Target className="size-4.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">طرح اعتبارسنجی نیاز است</p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/70">اطمینان زیر ۶۰٪ است. یک طرح اعتبارسنجی قبل از اجرا تعریف کنید.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="size-4.5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">خلاصه تصمیم</CardTitle>
                <CardDescription>اطلاعات اصلی و افراد مرتبط</CardDescription>
              </div>
              {canEditDecision && (
                <Button size="sm" variant="outline" className="gap-2 rounded-full" onClick={saveBasicDetails} disabled={isSaving || !hasPendingCoreChanges}>
                  ذخیره خلاصه
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-sm pt-4">
            {canEditDecision ? (
              <div className="space-y-4">
                <Input
                  value={title}
                  placeholder="عنوان تصمیم"
                  onChange={(event) => setTitle(event.target.value)}
                  className="text-base font-medium transition-shadow focus:shadow-sm"
                />

                <div className="grid gap-x-3 gap-y-3 sm:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">دسته‌بندی</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-9 w-full"><SelectValue placeholder="انتخاب" /></SelectTrigger>
                      <SelectContent>
                        {board.categories.map((item) => (
                          <SelectItem key={item} value={item}>{item}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">تاثیر</Label>
                    <Select value={impact} onValueChange={(value) => setImpact(value as Decision["impact"])}>
                      <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">کم</SelectItem>
                        <SelectItem value="Medium">متوسط</SelectItem>
                        <SelectItem value="High">زیاد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">فوریت</Label>
                    <Select value={urgency} onValueChange={(value) => setUrgency(value as NonNullable<Decision["urgency"]>)}>
                      <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">کم</SelectItem>
                        <SelectItem value="Medium">متوسط</SelectItem>
                        <SelectItem value="High">زیاد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">اطمینان</Label>
                    <Input
                      className="h-9"
                      type="number"
                      min={0}
                      max={100}
                      value={confidence}
                      onChange={(event) => setConfidence(clamp(parseLocalizedInt(event.target.value, 80), 0, 100))}
                    />
                  </div>
                </div>

                <div className="grid gap-x-3 gap-y-3 sm:grid-cols-4">
                  <div className="space-y-1" id="owner-field">
                    <Label className="text-[11px] text-muted-foreground">مالک</Label>
                    <Select value={ownerId || "__none"} onValueChange={(value) => setOwnerId(value === "__none" ? "" : value)}>
                      <SelectTrigger className="h-9 w-full"><SelectValue placeholder="انتخاب" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">بدون مالک</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1" id="due-date-field">
                    <Label className="text-[11px] text-muted-foreground">سررسید</Label>
                    <DatePicker value={dueDate} onValueChange={setDueDate} className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">جلسه بررسی</Label>
                    <DatePicker value={reviewMeetingDate} onValueChange={setReviewMeetingDate} className="h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">تاییدکنندگان</Label>
                    <div className="flex flex-wrap items-center gap-1 rounded-md border px-2 py-1.5 min-h-9">
                      {approverNames.length > 0 ? approverNames.map((name) => (
                        <Badge key={name} variant="secondary" className="text-[10px] px-1.5 py-0">{name}</Badge>
                      )) : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    مشارکت‌کنندگان
                    {contributorIds.length > 0 && (
                      <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[9px]">{contributorIds.length}</Badge>
                    )}
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {users.map((user) => {
                      const checked = contributorIds.includes(user.id);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => toggleContributor(user.id)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all",
                            checked ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          <div className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold",
                            checked ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            {user.name.charAt(0)}
                          </div>
                          {user.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {relatedUncertainty || true ? (
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">عدم قطعیت مرتبط</Label>
                    <Textarea
                      rows={2}
                      value={relatedUncertainty}
                      placeholder="ابهام‌های مهم این تصمیم"
                      onChange={(event) => setRelatedUncertainty(event.target.value)}
                      className="text-xs transition-shadow focus:shadow-sm"
                    />
                  </div>
                ) : null}

                <p className="text-[11px] text-muted-foreground">ایجاد شده: {toJalali(decision.createdAt)}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-full px-3">{category}</Badge>
                  <Badge variant={impact === "High" ? "destructive" : impact === "Medium" ? "default" : "secondary"} className="rounded-full px-3">
                    تاثیر: {impact === "High" ? "بالا" : impact === "Medium" ? "متوسط" : "کم"}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3">
                    فوریت: {urgency === "High" ? "بالا" : urgency === "Medium" ? "متوسط" : "کم"}
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "مالک", value: ownerId ? userName(ownerId, users) : "—", icon: User },
                    { label: "مشارکت‌کنندگان", value: contributorNames.length > 0 ? contributorNames.join("، ") : "—", icon: Users },
                    { label: "تایید‌کنندگان", value: approverNames.length > 0 ? approverNames.join("، ") : "—", icon: CheckCircle2 },
                    { label: "تاریخ سررسید", value: toJalali(dueDate), icon: Calendar },
                    { label: "جلسه بررسی", value: toJalali(reviewMeetingDate), icon: Clock },
                    { label: "تاریخ ایجاد", value: toJalali(decision.createdAt), icon: FileText },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5 rounded-xl border bg-muted/20 p-3">
                      <item.icon className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">{item.label}</p>
                        <p className="truncate font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10">
                <Target className="size-4.5 text-violet-600" />
              </div>
              <CardTitle className="text-base">بیان مسئله</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {canEditDecision ? (
              <div className="space-y-3">
                <Textarea
                  rows={5}
                  value={problemStatement}
                  placeholder="چه مسئله‌ای باید حل شود؟ زمینه و محدودیت‌ها را شرح دهید..."
                  onChange={(event) => setProblemStatement(event.target.value)}
                  className="transition-shadow focus:shadow-sm leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    {problemStatement.length > 0 ? `${problemStatement.length} کاراکتر` : "بیان واضح مسئله به تصمیم‌گیری بهتر کمک می‌کند"}
                  </p>
                  <Button size="sm" variant="outline" className="gap-2 rounded-full" onClick={saveBasicDetails}>
                    ذخیره
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-muted/20 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{problemStatement || "بیان مسئله‌ای ثبت نشده است."}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10">
                  <ListChecks className="size-4.5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-base">معیارها</CardTitle>
                  <CardDescription>{editableCriteria.length} معیار تعریف شده</CardDescription>
                </div>
              </div>
              {canEditDecision && (
                <Button variant="outline" size="sm" onClick={addCriterion} className="gap-2 border-dashed rounded-full">
                  <Plus className="size-3.5" />
                  افزودن
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {canEditDecision ? (
              <div className="space-y-3">
                {editableCriteria.map((criterion, index) => (
                  <div key={criterion.id} className="group space-y-2 rounded-xl border p-3 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="size-6 shrink-0 justify-center rounded-lg p-0 text-[10px] font-mono">{index + 1}</Badge>
                      <Input
                        value={criterion.name}
                        placeholder="نام معیار"
                        onChange={(event) => updateCriterion(criterion.id, { name: event.target.value })}
                        className="flex-1 min-w-0 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 font-medium"
                      />
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground">وزن</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => updateCriterion(criterion.id, { weight: w })}
                                className={cn(
                                  "size-5 rounded-md text-[10px] font-bold transition-all",
                                  w <= (criterion.weight || 3)
                                    ? "bg-amber-500 text-white shadow-sm"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="w-px h-5 bg-border" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => removeCriterion(criterion.id)}
                          disabled={editableCriteria.length === 1}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="یادداشت معیار (اختیاری)"
                      value={criterion.notes || ""}
                      onChange={(event) => updateCriterion(criterion.id, { notes: event.target.value })}
                      className="text-xs transition-shadow focus:shadow-sm"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {decision.criteria.map((criterion, index) => (
                  <div key={criterion.id} className="flex items-center gap-3 rounded-xl border p-3">
                    <Badge variant="secondary" className="size-7 shrink-0 justify-center rounded-lg p-0 font-mono text-xs">{index + 1}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{criterion.name}</p>
                      {criterion.notes && <p className="text-xs text-muted-foreground mt-0.5">{criterion.notes}</p>}
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((w) => (
                        <div key={w} className={cn("size-4 rounded-sm", w <= criterion.weight ? "bg-amber-500" : "bg-muted")} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10">
                  <Scale className="size-4.5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">گزینه‌ها و ارزیابی</CardTitle>
                  <CardDescription>{editableOptions.length} گزینه</CardDescription>
                </div>
              </div>
              {canEditDecision && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addOption} className="gap-2 border-dashed rounded-full">
                    <Plus className="size-3.5" />
                    افزودن
                  </Button>
                  <Button size="sm" onClick={saveCriteriaAndOptions} className="gap-2 rounded-full shadow-sm">
                    ذخیره
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {canEditDecision ? (
              <div className="space-y-3">
                {editableOptions.map((option, index) => {
                  const isChosen = chosenOptionId === option.id;
                  return (
                    <div key={option.id} className={cn(
                      "group space-y-3 rounded-xl border p-4 transition-all hover:shadow-sm",
                      isChosen && "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/10"
                    )}>
                      <div className="flex items-center gap-2">
                        <Badge variant={isChosen ? "default" : "secondary"} className="size-7 shrink-0 justify-center rounded-lg p-0 font-mono text-xs">
                          {String.fromCharCode(65 + index)}
                        </Badge>
                        <Input
                          value={option.title}
                          placeholder="عنوان گزینه"
                          onChange={(event) => updateOption(option.id, { title: event.target.value })}
                          className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 font-medium"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeOption(option.id)}
                          disabled={editableOptions.length === 1}
                        >
                          <Trash2 className="size-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                            <ThumbsUp className="size-3" />
                            مزایا
                          </div>
                          <Textarea
                            rows={2}
                            placeholder="مزایای این گزینه..."
                            value={option.pros}
                            onChange={(event) => updateOption(option.id, { pros: event.target.value })}
                            className="text-xs transition-shadow focus:shadow-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-destructive">
                            <ThumbsDown className="size-3" />
                            معایب
                          </div>
                          <Textarea
                            rows={2}
                            placeholder="معایب این گزینه..."
                            value={option.cons}
                            onChange={(event) => updateOption(option.id, { cons: event.target.value })}
                            className="text-xs transition-shadow focus:shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-3 text-muted-foreground shrink-0" />
                        <Select
                          value={option.risk || "متوسط"}
                          onValueChange={(v) => updateOption(option.id, { risk: v })}
                        >
                          <SelectTrigger className="h-8 w-full text-xs">
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
                  );
                })}
              </div>
            ) : (
              <>
                {decision.options.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <Scale className="size-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">گزینه‌ای اضافه نشده است</p>
                  </div>
                )}
                {decision.options.map((option, index) => {
                  const isChosen = decision.chosenOptionId === option.id;
                  return (
                    <div key={option.id} className={cn(
                      "space-y-2 rounded-xl border p-4 text-sm transition-all",
                      isChosen && "border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-200 dark:border-emerald-700 dark:bg-emerald-900/10 dark:ring-emerald-800"
                    )}>
                      <div className="flex items-center gap-2">
                        <Badge variant={isChosen ? "default" : "secondary"} className="size-7 shrink-0 justify-center rounded-lg p-0 font-mono text-xs">
                          {String.fromCharCode(65 + index)}
                        </Badge>
                        <p className="font-semibold">{option.title}</p>
                        {isChosen && <Badge className="ms-auto bg-emerald-600 text-[10px]">انتخاب شده</Badge>}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 pt-1">
                        <div className="rounded-lg bg-emerald-50/50 p-2.5 dark:bg-emerald-900/10">
                          <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mb-1"><ThumbsUp className="size-3" /> مزایا</p>
                          <p className="text-xs leading-relaxed">{option.pros || "—"}</p>
                        </div>
                        <div className="rounded-lg bg-rose-50/50 p-2.5 dark:bg-rose-900/10">
                          <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mb-1"><ThumbsDown className="size-3" /> معایب</p>
                          <p className="text-xs leading-relaxed">{option.cons || "—"}</p>
                        </div>
                      </div>
                      {option.risk && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-amber-50/50 p-2 text-xs dark:bg-amber-900/10">
                          <AlertTriangle className="size-3 text-amber-600 shrink-0" />
                          <span className="text-amber-700 dark:text-amber-400">{option.risk}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="size-4.5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-base">خروجی تصمیم</CardTitle>
                  <CardDescription>نتیجه نهایی، شواهد و ریسک‌ها</CardDescription>
                </div>
              </div>
              <Button size="sm" onClick={saveOutcome} className="gap-2 rounded-full shadow-sm">
                ذخیره خروجی
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                گزینه انتخاب شده
              </Label>
              <Select value={chosenOptionId} onValueChange={setChosenOptionId}>
                <SelectTrigger className="transition-shadow focus:shadow-sm">
                  <SelectValue placeholder="انتخاب گزینه نهایی" />
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

            <div className="space-y-2">
              <Label>دلیل نهایی *</Label>
              <Textarea
                rows={4}
                value={finalRationale}
                onChange={(event) => setFinalRationale(event.target.value)}
                placeholder="چرا این گزینه انتخاب شد؟ استدلال اصلی چیست؟"
                className="transition-shadow focus:shadow-sm leading-relaxed"
              />
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Shield className="size-3.5 text-amber-600" />
                ریسک‌ها و راهکار کاهش
              </Label>
              <Textarea
                id="risk-mitigations-field"
                rows={3}
                value={riskMitigations}
                onChange={(event) => setRiskMitigations(event.target.value)}
                placeholder="ریسک‌های اصلی و روش کاهش آن‌ها"
                className="transition-shadow focus:shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <ExternalLink className="size-3.5 text-blue-600" />
                شواهد و مستندات
                {evidenceLinks.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] rounded-full">{evidenceLinks.length}</Badge>
                )}
              </Label>
              <Textarea
                id="evidence-links-field"
                rows={3}
                value={evidenceLinksText}
                onChange={(event) => setEvidenceLinksText(event.target.value)}
                placeholder="هر خط یک لینک: https://..."
                className="font-mono text-xs transition-shadow focus:shadow-sm"
              />
            </div>

            <div className="h-px bg-border" />

            <div className={cn(
              "flex items-center justify-between rounded-xl border p-4 transition-all",
              !outcomeReversible
                ? "border-destructive/20 bg-destructive/5"
                : "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10"
            )}>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">قابل بازگشت؟</p>
                <p className={cn(
                  "text-xs",
                  !outcomeReversible ? "text-destructive/80" : "text-emerald-600/80"
                )}>
                  {outcomeReversible ? "بله — بازگشت ممکن است" : "خیر — تصمیم برگشت‌ناپذیر است"}
                </p>
              </div>
              <Switch
                checked={outcomeReversible}
                onCheckedChange={(checked) => {
                  setOutcomeReversible(checked);
                  void persistDecision({
                    reversible: checked,
                    rollbackExplanation: checked ? undefined : rollbackPlan || undefined,
                  }, "قابلیت بازگشت به‌روزرسانی شد.");
                }}
              />
            </div>

            {!outcomeReversible && (
              <div className="space-y-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <Label className="text-destructive">برنامه بازگشت (ضروری)</Label>
                <Textarea
                  rows={3}
                  value={rollbackPlan}
                  onChange={(event) => setRollbackPlan(event.target.value)}
                  placeholder="در صورت شکست یا نیاز به بازگشت، دقیقا چه اقدامی انجام می‌شود؟"
                  className="transition-shadow focus:shadow-sm"
                />
              </div>
            )}
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
                        {toJalaliDateTime(comment.createdAt)}
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
                          {toJalali(approval.date, "-")}
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
        {/* Decision info sidebar card */}
        <Card className="overflow-hidden">
          <CardContent className="space-y-3 pt-5 pb-4">
            <div className="flex items-center gap-2">
              <div className={cn("rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5", currentStatusColors.bg, currentStatusColors.text)}>
                <div className={cn("size-1.5 rounded-full", currentStatusColors.dot)} />
                {config.defaultColumnLabels[decision.status] || decision.status}
              </div>
              {!outcomeReversible && (
                <Badge variant="destructive" className="text-[10px]">غیرقابل بازگشت</Badge>
              )}
            </div>
            <div className="h-px bg-border" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">دسته‌بندی</span>
                <Badge variant="outline" className="text-[10px] rounded-full">{category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">تاثیر</span>
                <span className={cn(
                  "text-xs font-medium",
                  impact === "High" ? "text-destructive" : impact === "Medium" ? "text-amber-600" : "text-emerald-600"
                )}>
                  {impact === "High" ? "زیاد" : impact === "Medium" ? "متوسط" : "کم"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">فوریت</span>
                <span className="text-xs font-medium">
                  {urgency === "High" ? "زیاد" : urgency === "Medium" ? "متوسط" : "کم"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">اطمینان</span>
                <span className={cn(
                  "text-xs font-bold tabular-nums",
                  confidence >= 70 ? "text-emerald-600" : confidence >= 40 ? "text-amber-600" : "text-destructive"
                )}>
                  {confidence}٪
                </span>
              </div>
              {approverIds.length > 0 && (
                <>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">تاییدها</span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-emerald-600 font-bold">{approvalSummary.approved}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="font-medium">{approvalSummary.required}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

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


