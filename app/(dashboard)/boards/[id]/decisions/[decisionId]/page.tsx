"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, Archive, Copy, Download, MessageSquare, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { defaultColumnLabels, users } from "@/lib/mock-data";
import { checkDecisionQuality } from "@/lib/quality-gates";
import { useApp } from "@/lib/store";
import type { Decision } from "@/lib/types";
import { cn } from "@/lib/utils";

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

function userName(id: string) {
  return users.find((user) => user.id === id)?.name || id;
}

export default function DecisionDetailPage() {
  const params = useParams();
  const boardId = params.id as string;
  const decisionId = params.decisionId as string;
  const { getBoard, getDecision, updateDecision } = useApp();

  const board = getBoard(boardId);
  const decision = getDecision(decisionId);

  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [status, setStatus] = useState<Decision["status"]>(decision?.status || "Draft");
  const [chosenOptionId, setChosenOptionId] = useState(decision?.chosenOptionId || "");
  const [finalRationale, setFinalRationale] = useState(decision?.finalRationale || "");
  const [implementationNotes, setImplementationNotes] = useState(decision?.implementationNotes || "");
  const [outcomeReversible, setOutcomeReversible] = useState(decision?.reversible ?? true);
  const [rollbackPlan, setRollbackPlan] = useState(decision?.rollbackExplanation || "");
  const [referenceNow] = useState(() => Date.now());
  const [approvals, setApprovals] = useState<LocalApproval[]>(
    () =>
      (decision?.approverIds || []).map((approverId) => ({
        approverId,
        approverName: userName(approverId),
        status: "Pending",
        comment: "",
      }))
  );

  if (!board || !decision) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">تصمیم یافت نشد</p>
      </div>
    );
  }

  const quality = checkDecisionQuality(decision, board);
  const failedChecks = quality.checks.filter((check) => !check.passed);

  const irreversibleWithoutEvidence =
    !decision.reversible &&
    (!decision.keyRisksMitigations || !decision.evidenceLinks?.length || decision.options.length < 2);
  const highImpactWithoutApprovers =
    decision.impact === "High" && (!decision.approverIds || decision.approverIds.length === 0);
  const lowConfidenceWithoutValidation =
    decision.confidence < 60 && !decision.validationPlan?.trim();
  const dueSoon = decision.dueDate
    ? new Date(decision.dueDate).getTime() <= referenceNow + 2 * 24 * 60 * 60 * 1000
    : false;

  const contributorNames = (decision.contributorIds || []).map(userName);
  const approverNames = (decision.approverIds || []).map(userName);

  const approvalSummary = {
    required: approvals.length,
    approved: approvals.filter((item) => item.status === "Approved").length,
    pending: approvals.filter((item) => item.status === "Pending").length,
    rejected: approvals.filter((item) => item.status === "Rejected").length,
  };

  const onStatusChange = (value: string) => {
    const next = value as Decision["status"];
    setStatus(next);
    updateDecision(decisionId, { status: next });
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
    updateDecision(decisionId, {
      chosenOptionId: chosenOptionId || undefined,
      finalRationale: finalRationale || undefined,
      implementationNotes: implementationNotes || undefined,
      reversible: outcomeReversible,
      rollbackExplanation: outcomeReversible ? undefined : rollbackPlan || undefined,
    });
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

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <PageHeader
          title={`تصمیم: ${decision.title}`}
          subtitle={`${defaultColumnLabels[decision.status] || decision.status} | ${decision.ownerName || "بدون مالک"} | سررسید: ${decision.dueDate || "-"} | کیفیت: ${quality.score}/100`}
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
                      {defaultColumnLabels[column] || column}
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

        {irreversibleWithoutEvidence && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>ریسک بالا: تصمیم غیرقابل بازگشت نیاز به شواهد + ریسک‌ها + گزینه‌ها دارد.</AlertTitle>
            <AlertDescription className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="outline">افزودن شواهد</Button>
              <Button size="sm" variant="outline">افزودن ریسک‌ها</Button>
              <Button size="sm" variant="outline">افزودن گزینه‌ها</Button>
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

        <Card>
          <CardHeader>
            <CardTitle>خلاصه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{decision.category}</Badge>
              <Badge
                variant={
                  decision.impact === "High"
                    ? "destructive"
                    : decision.impact === "Medium"
                      ? "default"
                      : "secondary"
                }
              >
                {decision.impact === "High" ? "بالا" : decision.impact === "Medium" ? "متوسط" : "کم"}
              </Badge>
            </div>
            <p><span className="text-muted-foreground">مالک:</span> {decision.ownerName || "-"}</p>
            <p>
              <span className="text-muted-foreground">مشارکت‌کنندگان:</span>{" "}
              {contributorNames.length > 0 ? contributorNames.join(", ") : "-"}
            </p>
            <p>
              <span className="text-muted-foreground">تایید‌کنندگان:</span>{" "}
              {approverNames.length > 0 ? approverNames.join(", ") : "-"}
            </p>
            <p><span className="text-muted-foreground">تاریخ سررسید:</span> {decision.dueDate || "-"}</p>
            <p><span className="text-muted-foreground">تاریخ جلسه بررسی:</span> {decision.reviewMeetingDate || "-"}</p>
            <p><span className="text-muted-foreground">ایجاد شده:</span> {new Date(decision.createdAt).toLocaleDateString("fa-IR")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>بیان مسئله</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{decision.problemStatement}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معیارها</CardTitle>
          </CardHeader>
          <CardContent>
            {decision.criteria.length === 0 ? (
              <p className="text-sm text-muted-foreground">معیاری اضافه نشده است.</p>
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

        <Card>
          <CardHeader>
            <CardTitle>گزینه‌ها و ارزیابی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>خروجی تصمیم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>گزینه انتخاب شده</Label>
              <Select value={chosenOptionId} onValueChange={setChosenOptionId}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب گزینه" />
                </SelectTrigger>
                <SelectContent>
                  {decision.options.map((option) => (
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
                placeholder="چرا این گزینه انتخاب شد"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={outcomeReversible} onCheckedChange={setOutcomeReversible} />
              <Label>قابل بازگشت؟</Label>
            </div>

            <Button onClick={saveOutcome}>ذخیره خروجی</Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="comments">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="comments">نظرات و گفتگو</TabsTrigger>
            <TabsTrigger value="approvals">تاییدها</TabsTrigger>
            <TabsTrigger value="audit">سوابق تغییرات</TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="mt-4">
            <Card>
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start gap-2">
                  <Textarea
                    rows={2}
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder="افزودن نظر"
                  />
                  <Button onClick={postComment}>ارسال</Button>
                </div>
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">نظری ثبت نشده است.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg border p-3 text-sm">
                      <p>{comment.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString("fa-IR")}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>خلاصه تاییدها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>تاریخ</TableHead>
                      <TableHead>عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvals.map((approval) => (
                      <TableRow key={approval.approverId}>
                        <TableCell>{approval.approverName}</TableCell>
                        <TableCell>{approval.status === "Approved" ? "تایید شده" : approval.status === "Rejected" ? "رد شده" : "در انتظار"}</TableCell>
                        <TableCell>{approval.date ? new Date(approval.date).toLocaleDateString("fa-IR") : "-"}</TableCell>
                        <TableCell className="space-x-2 rtl:space-x-reverse">
                          <Button size="sm" variant="outline" onClick={() => setApprovalStatus(approval.approverId, "Approved")}>
                            تایید
                          </Button>
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
        <Card>
          <CardHeader>
            <CardTitle>چک‌لیست کیفیت</CardTitle>
            <CardDescription>امتیاز کیفیت: {quality.score}/100</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quality.checks.map((check) => (
              <div key={check.id} className="flex items-center gap-2 text-sm">
                <div className={cn("size-2 rounded-full", check.passed ? "bg-green-500" : "bg-destructive")} />
                {check.label}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>اقدامات سریع</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {!decision.ownerId && <Button size="sm" variant="outline">تعیین مالک</Button>}
            {decision.criteria.length === 0 && <Button size="sm" variant="outline">افزودن معیار</Button>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
