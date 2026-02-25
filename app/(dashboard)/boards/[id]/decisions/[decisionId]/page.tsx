"use client";

import { useState } from "react";
import Link from "next/link";
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
import { users } from "@/lib/mock-data";
import { checkDecisionQuality } from "@/lib/quality-gates";
import { useApp } from "@/lib/store";
import type { Decision } from "@/lib/types";

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
        <p className="text-muted-foreground">Decision not found</p>
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
          title={`Decision: ${decision.title}`}
          subtitle={`${decision.status} | ${decision.ownerName || "No owner"} | Due: ${decision.dueDate || "-"} | Quality: ${quality.score}/100`}
          breadcrumbs={[
            { label: "Boards", href: "/boards" },
            { label: board.name, href: `/boards/${boardId}` },
            { label: "Decisions", href: `/boards/${boardId}/decisions` },
            { label: decision.title, href: `/boards/${boardId}/decisions/${decisionId}` },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  {board.columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-2 size-4" />
                Add comment
              </Button>
              <Button variant="outline" size="sm">
                <Send className="mr-2 size-4" />
                Request approval
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="mr-2 size-4" />
                Duplicate
              </Button>
              <Button variant="outline" size="sm">
                <Archive className="mr-2 size-4" />
                Archive
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 size-4" />
                Export
              </Button>
            </div>
          }
        />

        {irreversibleWithoutEvidence && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>High-risk: Irreversible decision requires Evidence + Risks + Options.</AlertTitle>
            <AlertDescription className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="outline">Add Evidence</Button>
              <Button size="sm" variant="outline">Add Risks</Button>
              <Button size="sm" variant="outline">Add Options</Button>
            </AlertDescription>
          </Alert>
        )}

        {highImpactWithoutApprovers && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Approvers required for High impact decisions.</AlertTitle>
            <AlertDescription>
              Add approvers before approval flow starts.
            </AlertDescription>
          </Alert>
        )}

        {lowConfidenceWithoutValidation && (
          <Alert>
            <AlertTriangle className="size-4" />
            <AlertTitle>Confidence &lt; 60% requires Validation Plan.</AlertTitle>
            <AlertDescription>
              Add an experiment/spike/prototype plan.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
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
                {decision.impact}
              </Badge>
              {decision.relatedUncertainty && (
                <Badge variant="outline">{decision.relatedUncertainty}</Badge>
              )}
            </div>
            <p><span className="text-muted-foreground">Owner:</span> {decision.ownerName || "-"}</p>
            <p>
              <span className="text-muted-foreground">Contributors:</span>{" "}
              {contributorNames.length > 0 ? contributorNames.join(", ") : "-"}
            </p>
            <p>
              <span className="text-muted-foreground">Approvers:</span>{" "}
              {approverNames.length > 0 ? approverNames.join(", ") : "-"}
            </p>
            <p><span className="text-muted-foreground">Due date:</span> {decision.dueDate || "-"}</p>
            <p><span className="text-muted-foreground">Review date:</span> {decision.reviewMeetingDate || "-"}</p>
            <p><span className="text-muted-foreground">Created:</span> {new Date(decision.createdAt).toLocaleDateString()}</p>
            <p><span className="text-muted-foreground">Updated:</span> {new Date(decision.updatedAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Problem Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{decision.problemStatement}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            {decision.criteria.length === 0 ? (
              <p className="text-sm text-muted-foreground">No criteria added.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Criterion</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Notes</TableHead>
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
            <CardTitle>Options & Evaluation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {decision.options.length === 0 && (
              <p className="text-sm text-muted-foreground">No options added.</p>
            )}
            {decision.options.map((option) => (
              <div key={option.id} className="space-y-1 rounded-lg border p-3 text-sm">
                <p className="font-medium">{option.title}</p>
                <p><span className="text-muted-foreground">Pros:</span> {option.pros}</p>
                <p><span className="text-muted-foreground">Cons:</span> {option.cons}</p>
                <p><span className="text-muted-foreground">Risk:</span> {option.risk || "-"}</p>
                <p><span className="text-muted-foreground">Cost/time:</span> {option.costTimeEstimate || "-"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision Outcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Chosen option</Label>
              <Select value={chosenOptionId} onValueChange={setChosenOptionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
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
              <Label>Final rationale *</Label>
              <Textarea
                rows={4}
                value={finalRationale}
                onChange={(event) => setFinalRationale(event.target.value)}
                placeholder="Why this option was chosen"
              />
            </div>

            <div className="space-y-2">
              <Label>Implementation notes</Label>
              <Textarea
                rows={3}
                value={implementationNotes}
                onChange={(event) => setImplementationNotes(event.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={outcomeReversible} onCheckedChange={setOutcomeReversible} />
              <Label>Reversible?</Label>
            </div>

            {!outcomeReversible && (
              <div className="space-y-2">
                <Label>Rollback plan / not possible explanation</Label>
                <Textarea
                  rows={3}
                  value={rollbackPlan}
                  onChange={(event) => setRollbackPlan(event.target.value)}
                />
              </div>
            )}

            <Button onClick={saveOutcome}>Save outcome</Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="comments">
          <TabsList>
            <TabsTrigger value="comments">Comments & Discussion</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="attachments">Attachments/Links</TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="mt-4">
            <Card>
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start gap-2">
                  <Textarea
                    rows={2}
                    value={newComment}
                    onChange={(event) => setNewComment(event.target.value)}
                    placeholder="Add comment"
                  />
                  <Button onClick={postComment}>Post</Button>
                </div>
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg border p-3 text-sm">
                      <p>{comment.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
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
                <CardTitle>Approval Summary</CardTitle>
                <CardDescription>
                  Required approvers: {approvalSummary.required} | Approved: {approvalSummary.approved} | Pending: {approvalSummary.pending}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/boards/${boardId}/decisions/${decisionId}/approvals`}>
                    Open full approvals page
                  </Link>
                </Button>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvals.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-muted-foreground">
                          No approvers assigned.
                        </TableCell>
                      </TableRow>
                    )}
                    {approvals.map((approval) => (
                      <TableRow key={approval.approverId}>
                        <TableCell>{approval.approverName}</TableCell>
                        <TableCell>{approval.status}</TableCell>
                        <TableCell>{approval.date ? new Date(approval.date).toLocaleDateString() : "-"}</TableCell>
                        <TableCell className="space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setApprovalStatus(approval.approverId, "Approved")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setApprovalStatus(approval.approverId, "Rejected")}>
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <Card>
              <CardContent className="space-y-2 pt-6 text-sm">
                <p>Status changed to <strong>{decision.status}</strong></p>
                <p>Decision created on {new Date(decision.createdAt).toLocaleString()}</p>
                <p>Last updated on {new Date(decision.updatedAt).toLocaleString()}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments" className="mt-4">
            <Card>
              <CardContent className="space-y-2 pt-6 text-sm">
                {decision.evidenceLinks?.length ? (
                  decision.evidenceLinks.map((link) => (
                    <a key={link} href={link} target="_blank" rel="noreferrer" className="block text-primary hover:underline">
                      {link}
                    </a>
                  ))
                ) : (
                  <p className="text-muted-foreground">No attachments or evidence links.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quality Gate Checklist</CardTitle>
            <CardDescription>Quality score: {quality.score}/100</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quality.checks.map((check) => (
              <div key={check.id} className="text-sm">
                {check.passed ? "OK" : "Missing"} - {check.label}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {failedChecks.length === 0 && !dueSoon && (
              <p className="text-muted-foreground">No warnings.</p>
            )}
            {failedChecks.map((check) => (
              <p key={check.id} className="text-destructive">
                Missing {check.label}
              </p>
            ))}
            {dueSoon && (
              <p className="text-amber-600">Due date in 2 days (at risk)</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Fix Buttons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {!decision.ownerId && <Button size="sm" variant="outline">Assign owner</Button>}
            {decision.criteria.length === 0 && <Button size="sm" variant="outline">Add criteria</Button>}
            {irreversibleWithoutEvidence && <Button size="sm" variant="outline">Add evidence</Button>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
