"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MoreHorizontal,
  Copy,
  Archive,
  Download,
  MessageSquare,
  Send,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApp } from "@/lib/store";
import { checkDecisionQuality } from "@/lib/quality-gates";
import { cn } from "@/lib/utils";

export default function DecisionDetailPage() {
  const params = useParams();
  const boardId = params.id as string;
  const decisionId = params.decisionId as string;
  const { getBoard, getDecision, updateDecision } = useApp();
  const board = getBoard(boardId);
  const decision = getDecision(decisionId);

  const [status, setStatus] = useState(decision?.status ?? "Draft");
  const [chosenOptionId, setChosenOptionId] = useState(decision?.chosenOptionId ?? "");
  const [finalRationale, setFinalRationale] = useState(decision?.finalRationale ?? "");
  const [implementationNotes, setImplementationNotes] = useState(
    decision?.implementationNotes ?? ""
  );
  const [newComment, setNewComment] = useState("");

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as typeof status);
    updateDecision(decisionId, { status: newStatus as typeof status });
  };

  const handleSaveOutcome = () => {
    updateDecision(decisionId, {
      chosenOptionId: chosenOptionId || undefined,
      finalRationale: finalRationale || undefined,
      implementationNotes: implementationNotes || undefined,
    });
  };

  if (!board || !decision) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Decision not found</p>
      </div>
    );
  }

  const { checks, score } = checkDecisionQuality(decision, board);
  const failedChecks = checks.filter((c) => !c.passed);
  const isIrreversibleWithoutEvidence =
    !decision.reversible &&
    (!decision.keyRisksMitigations ||
      !decision.evidenceLinks?.length);
  const isHighImpactWithoutApprovers =
    decision.impact === "High" &&
    (!decision.approverIds || decision.approverIds.length === 0);
  const isDueSoon =
    decision.dueDate &&
    new Date(decision.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <PageHeader
          title={decision.title}
          subtitle={`${decision.status} • ${decision.ownerName || "No owner"} • Due: ${decision.dueDate || "—"} • Quality: ${score}/100`}
          breadcrumbs={[
            { label: "Boards", href: "/boards" },
            { label: board.name, href: `/boards/${boardId}` },
            { label: "Decisions", href: `/boards/${boardId}/decisions` },
            { label: decision.title, href: `/boards/${boardId}/decisions/${decisionId}` },
          ]}
          actions={
            <div className="flex gap-2">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  {board.columns.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <MessageSquare className="size-4 mr-2" />
                Add comment
              </Button>
              <Button variant="outline" size="sm">
                <Send className="size-4 mr-2" />
                Request approval
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2">
                    <Copy className="size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Archive className="size-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Download className="size-4" />
                    Export
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />

        {isIrreversibleWithoutEvidence && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>High-risk: Irreversible decision</AlertTitle>
            <AlertDescription>
              Requires Evidence + Risks + Options.
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline">
                  Add Evidence
                </Button>
                <Button size="sm" variant="outline">
                  Add Risks
                </Button>
                <Button size="sm" variant="outline">
                  Add Options
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isHighImpactWithoutApprovers && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Approvers required</AlertTitle>
            <AlertDescription>
              High impact decisions require approvers list.
              <Button size="sm" variant="outline" className="ml-2">
                Add approvers
              </Button>
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
            <p>
              <span className="text-muted-foreground">Owner:</span>{" "}
              {decision.ownerName || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Contributors:</span> —
            </p>
            <p>
              <span className="text-muted-foreground">Approvers:</span> —
            </p>
            <p>
              <span className="text-muted-foreground">Due:</span>{" "}
              {decision.dueDate || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Review date:</span>{" "}
              {decision.reviewMeetingDate || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Created:</span>{" "}
              {new Date(decision.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Problem Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{decision.problemStatement}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {decision.criteria?.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between rounded border p-2 text-sm"
                >
                  <span>{c.name}</span>
                  <span className="text-muted-foreground">Weight: {c.weight}</span>
                </div>
              ))}
              {(!decision.criteria || decision.criteria.length === 0) && (
                <p className="text-muted-foreground text-sm">No criteria</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Options & Evaluation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {decision.options?.map((o) => (
              <div key={o.id} className="rounded-lg border p-4 space-y-2">
                <p className="font-medium">{o.title}</p>
                <p className="text-muted-foreground text-sm">
                  Pros: {o.pros} | Cons: {o.cons}
                </p>
                {o.risk && (
                  <p className="text-sm">Risk: {o.risk}</p>
                )}
              </div>
            ))}
            {(!decision.options || decision.options.length === 0) && (
              <p className="text-muted-foreground text-sm">No options</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision Outcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chosen option</label>
              <Select
                value={chosenOptionId}
                onValueChange={setChosenOptionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {decision.options?.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Final rationale *</label>
              <Textarea
                value={finalRationale}
                onChange={(e) => setFinalRationale(e.target.value)}
                rows={4}
                placeholder="Why was this option chosen?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Implementation notes</label>
              <Textarea
                value={implementationNotes}
                onChange={(e) => setImplementationNotes(e.target.value)}
                rows={2}
              />
            </div>
            <Button onClick={handleSaveOutcome}>Save outcome</Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="comments">
          <TabsList>
            <TabsTrigger value="comments">Comments & Discussion</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>
          <TabsContent value="comments" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                  />
                  <Button size="sm">Post</Button>
                </div>
                <p className="text-muted-foreground text-sm mt-4">
                  No comments yet.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="approvals" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">
                  Required approvers: — | Approved: — | Pending: —
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="audit" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">
                  No audit log entries.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="attachments" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">
                  No attachments.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quality Gate Checklist</CardTitle>
            <CardDescription>Quality score: {score}/100</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {checks.map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-sm">
                {c.passed ? (
                  <Check className="size-4 text-green-600" />
                ) : (
                  <X className="size-4 text-destructive" />
                )}
                <span>{c.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {failedChecks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Warnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {failedChecks.map((c) => (
                <p key={c.id} className="text-sm text-destructive">
                  • Missing {c.label.toLowerCase()}
                </p>
              ))}
              {isDueSoon && (
                <p className="text-sm text-amber-600">
                  • Due date in 2 days (at risk)
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Fix</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {!decision.ownerId && (
              <Button size="sm" variant="outline">
                Assign owner
              </Button>
            )}
            {(!decision.criteria || decision.criteria.length === 0) && (
              <Button size="sm" variant="outline">
                Add criteria
              </Button>
            )}
            {isIrreversibleWithoutEvidence && (
              <Button size="sm" variant="outline">
                Add evidence
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
